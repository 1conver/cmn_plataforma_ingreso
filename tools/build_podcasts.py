"""Genera los episodios de "Frecuencia CMN" a partir de tools/podcast_src/*.txt.

Uso:
    python tools/build_podcasts.py              # sintetiza lo que falte y reescribe los datos
    python tools/build_podcasts.py --data-only  # solo reescribe assets/js/data/podcasts.js
    python tools/build_podcasts.py --only a1,b2 # regenera esos episodios

Formato de los guiones:
    === id: a1
    titulo: ...
    pilar: A | B | C | D | I
    puntos: A1, A2
    resumen: ...
    L: línea de Lu (voz es-AR-ElenaNeural)
    T: línea de Tomi (voz es-AR-TomasNeural)
    Q: pregunta | correcta | incorrecta | incorrecta | explicación

    {texto visible|texto hablado} fuerza una pronunciación puntual.

Requiere: pip install edge-tts (voces neuronales en línea de Microsoft Edge).
Los segmentos se cachean en tools/.podcast_cache (ignorada por git).
"""
import asyncio, hashlib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'tools' / 'podcast_src'
CACHE = ROOT / 'tools' / '.podcast_cache'
OUT_AUDIO = ROOT / 'podcast'
OUT_DATA = ROOT / 'assets' / 'js' / 'data' / 'podcasts.js'
VOICES = {'L': 'es-AR-ElenaNeural', 'T': 'es-AR-TomasNeural'}
HOSTS = {'L': 'Lu', 'T': 'Tomi'}
RATE = '+4%'

# Pronunciación: solo afecta al texto que se sintetiza, nunca a la transcripción.
PRON = [
    (r'\bTCP/IP\b', 'TCP IP'), (r'\bCSMA/CD\b', 'CSMA CD'), (r'\bCSMA/CA\b', 'CSMA CA'),
    (r'\b1FN\b', 'primera forma normal'), (r'\b2FN\b', 'segunda forma normal'),
    (r'\b3FN\b', 'tercera forma normal'), (r'\b4FN\b', 'cuarta forma normal'),
    (r'\b5FN\b', 'quinta forma normal'), (r'\bBCNF\b', 'forma normal de Boyce Codd'),
    (r'\bFSMO\b', 'efe ese eme o'), (r'\bT-SQL\b', 'te ese cu ele'), (r'\bMySQL\b', 'mai ese cu ele'),
    (r'\bmysqli\b', 'mai ese cu ele i'), (r'\bSQL\b', 'ese cu ele'), (r'\bASP\.NET\b', 'a ese pe punto net'),
    (r'\bASP\b', 'a ese pe'), (r'\bVBScript\b', 've be script'), (r'\bJScript\b', 'yei script'),
    (r'\bL2TP\b', 'ele dos te pe'), (r'\bIPSec\b', 'i pe sec'), (r'\bRRAS\b', 'erre erre a ese'),
    (r'\bRJ-45\b', 'erre jota cuarenta y cinco'), (r'\b802\.11\b', 'ocho cero dos punto once'),
    (r'\b802\.11([a-z]{1,2})\b', r'ocho cero dos punto once \1'), (r'\b802\.3\b', 'ocho cero dos punto tres'),
    (r'\b802\.5\b', 'ocho cero dos punto cinco'), (r'\b802\.1X\b', 'ocho cero dos punto uno equis'),
    (r'\bPSeInt\b', 'pe se int'), (r'Böhm', 'Bom'), (r'Jacopini', 'Yacopini'), (r'Dijkstra', 'Daikstra'),
    (r'\bGOTO\b', 'go tu'), (r'\bgoto\b', 'go tu'), (r'\bIIS\b', 'i i ese'), (r'\bPOO\b', 'pe o o'),
    (r'\bN:M\b', 'ene a eme'), (r'\b1:N\b', 'uno a ene'), (r'\b1:1\b', 'uno a uno'),
    (r'\bE-R\b', 'entidad relación'), (r'\bSYN-ACK\b', 'sin ac'), (r'\bSYN\b', 'sin'), (r'\bACK\b', 'ac'),
    (r'\bSPA\b', 'ese pe a'), (r'\bPWA\b', 'pe doble ve a'), (r'\bSSR\b', 'ese ese erre'),
    (r'\bCIDR\b', 'sáider'), (r'\bAGDLP\b', 'a ge de ele pe'), (r'\bAGUDLP\b', 'a ge u de ele pe'),
    (r'\b10BASE5\b', 'diez base cinco'), (r'\b10BASE2\b', 'diez base dos'), (r'\b1000BASE-T\b', 'mil base te'),
    (r'\bIPv4\b', 'i pe ve cuatro'), (r'\bIPv6\b', 'i pe ve seis'), (r'\bWPA3\b', 'doble ve pe a tres'),
    (r'\bWPA2\b', 'doble ve pe a dos'), (r'\bWPA\b', 'doble ve pe a'), (r'\bWEP\b', 'doble ve e pe'),
    (r'\bMIMO\b', 'maimo'), (r'\bVCSEL\b', 'vixel'), (r'\bUML\b', 'u eme ele'), (r'\bOMG\b', 'o eme ge'),
    (r'\bAD DS\b', 'a de de ese'), (r'\bDSRM\b', 'de ese erre eme'), (r'\bNTDS\.dit\b', 'ene te de ese punto dit'),
    (r'\bSYSVOL\b', 'sisvol'), (r'\bDFSR\b', 'de efe ese erre'), (r'\bDFS-R\b', 'de efe ese erre'),
    (r'\bOUs\b', 'unidades organizativas'), (r'\bGPOs\b', 'ge pe os'), (r'\bVLANs\b', 'ví lans'),
    (r'\bVLAN\b', 'ví lan'), (r'\bWAN\b', 'guan'), (r'\bWi-Fi\b', 'uai fai'), (r'\bDHTML\b', 'de hache te eme ele'),
    (r'\bAJAX\b', 'ayax'), (r'\bJSON\b', 'yeison'), (r'\bPHP\b', 'pe hache pe'), (r'\bPDO\b', 'pe de o'),
    (r'\bCRUD\b', 'crud'), (r'\bADO\b', 'a de o'), (r'\bADODB\b', 'a de o de be'), (r'\bglobal\.asa\b', 'global punto asa'),
    (r'\bIDENTITY\b', 'identiti'), (r'\bTRUNCATE\b', 'troncueit'), (r'\bWHERE\b', 'guer'), (r'\bHAVING\b', 'javing'),
    (r'\bSELECT\b', 'selet'), (r'\bGROUP BY\b', 'grup bai'), (r'\bORDER BY\b', 'order bai'), (r'\bJOIN\b', 'yoin'),
    (r'\bCLUSTERED\b', 'clasterd'), (r'\bNONCLUSTERED\b', 'non clasterd'), (r'\bclustered\b', 'clasterd'),
    (r'\bnon-clustered\b', 'non clasterd'), (r'\bVIEW\b', 'viu'), (r'\bINDEX\b', 'índex'),
    (r'\bACID\b', 'ácid'), (r'\bDDL\b', 'de de ele'), (r'\bDML\b', 'de eme ele'), (r'\bDCL\b', 'de ce ele'),
    (r'\bTCL\b', 'te ce ele'), (r'\bPK\b', 'clave primaria'), (r'\bFK\b', 'clave foránea'),
    (r'\bKCC\b', 'ka ce ce'), (r'\bISTG\b', 'i ese te ge'), (r'\bRID\b', 'rid'), (r'\bPDC\b', 'pe de ce'),
    (r'\bNPS\b', 'ene pe ese'), (r'\bAAA\b', 'triple a'), (r'\bIKE\b', 'aik'), (r'\bIKEv2\b', 'aik ve dos'),
    (r'\bSSTP\b', 'ese ese te pe'), (r'\bPPTP\b', 'pe pe te pe'), (r'\bMPPE\b', 'eme pe pe e'),
    (r'\bMS-CHAPv2\b', 'eme ese chap ve dos'), (r'\bESP\b', 'e ese pe'), (r'\bGRE\b', 'ge erre e'),
    (r'\bMD5\b', 'eme de cinco'), (r'\bAES\b', 'a e ese'), (r'\bSAE\b', 'ese a e'), (r'\bUDP\b', 'u de pe'),
    (r'\bTCP\b', 'te ce pe'), (r'\bARP\b', 'arp'), (r'\bICMP\b', 'i ce eme pe'), (r'\bDNS\b', 'de ene ese'),
    (r'\bDHCP\b', 'de hache ce pe'), (r'\bNTFS\b', 'ene te efe ese'), (r'\bUNC\b', 'u ene ce'),
    (r'\bSMB\b', 'ese eme be'), (r'\bLDAP\b', 'ele dap'), (r'\bSRV\b', 'ese erre ve'), (r'\bPTR\b', 'pe te erre'),
    (r'\bCNAME\b', 'ce neim'), (r'\bMX\b', 'eme equis'), (r'\bSOA\b', 'ese o a'), (r'\bNS\b', 'ene ese'),
    (r'\bAAAA\b', 'cuádruple a'), (r'\bTTL\b', 'te te ele'), (r'\bLMHOSTS\b', 'ele eme hosts'),
    (r'\bAPIPA\b', 'apipa'), (r'\bDORA\b', 'dora'), (r'\bVLSM\b', 've ele ese eme'), (r'\bFLSM\b', 'efe ele ese eme'),
    (r'\bOSPF\b', 'o ese pe efe'), (r'\bEIGRP\b', 'e i ge erre pe'), (r'\bBGP\b', 'be ge pe'),
    (r'\bIGP\b', 'i ge pe'), (r'\bEGP\b', 'e ge pe'), (r'\bDUAL\b', 'dual'), (r'\bSPF\b', 'ese pe efe'),
    (r'\bDLCI\b', 'de ele ce i'), (r'\bLMI\b', 'ele eme i'), (r'\bCIR\b', 'ce i erre'), (r'\bPVC\b', 'pe ve ce'),
    (r'\bSVC\b', 'ese ve ce'), (r'\bNBMA\b', 'ene be eme a'), (r'\bHDLC\b', 'hache de ele ce'),
    (r'\bFECN\b', 'efe e ce ene'), (r'\bBECN\b', 'be e ce ene'), (r'\bATM\b', 'a te eme'),
    (r'\bMPLS\b', 'eme pe ele ese'), (r'\bRDSI\b', 'erre de ese i'), (r'\bLCP\b', 'ele ce pe'),
    (r'\bNCP\b', 'ene ce pe'), (r'\bIPCP\b', 'i pe ce pe'), (r'\bPAP\b', 'pap'), (r'\bCHAP\b', 'chap'),
    (r'\bUTP\b', 'u te pe'), (r'\bSTP\b', 'ese te pe'), (r'\bBNC\b', 'be ene ce'), (r'\bLED\b', 'led'),
    (r'\bFCS\b', 'efe ce ese'), (r'\bCRC\b', 'ce erre ce'), (r'\bPDU\b', 'pe de u'), (r'\bMAC\b', 'mac'),
    (r'\bCAM\b', 'cam'), (r'\bASIC\b', 'eisic'), (r'\bOSI\b', 'osi'), (r'\bISO\b', 'iso'), (r'\bIEEE\b', 'i triple e'),
    (r'\bRFC\b', 'erre efe ce'), (r'\bARPANET\b', 'arpanet'), (r'\bCERN\b', 'cern'), (r'\bW3C\b', 'doble ve tres ce'),
    (r'\bWHATWG\b', 'guat doble ve ge'), (r'\bHTTP\b', 'hache te te pe'), (r'\bHTTPS\b', 'hache te te pe ese'),
    (r'\bHTML5\b', 'hache te eme ele cinco'), (r'\bHTML\b', 'hache te eme ele'), (r'\bCSS\b', 'ce ese ese'),
    (r'\bDOM\b', 'dom'), (r'\bURL\b', 'u erre ele'), (r'\bCGI\b', 'ce ge i'), (r'\bAPI\b', 'a pe i'),
    (r'\bAPIs\b', 'a pe is'), (r'\bREST\b', 'rest'), (r'\bJIT\b', 'yit'), (r'\bJVM\b', 'yota ve eme'),
    (r'\bCLR\b', 'ce ele erre'), (r'\bGPO\b', 'ge pe o'), (r'\bOU\b', 'o u'), (r'\bUPN\b', 'u pe ene'),
    (r'\bSID\b', 'sid'), (r'\bSAM\b', 'sam'), (r'\bDC\b', 'de ce'), (r'\bDCs\b', 'de ces'), (r'\bGC\b', 'ge ce'),
    (r'\bAD\b', 'a de'), (r'\bDFS\b', 'de efe ese'), (r'\bRDC\b', 'erre de ce'), (r'\bFRS\b', 'efe erre ese'),
    (r'\bWINS\b', 'wins'), (r'\bNetBIOS\b', 'net bios'), (r'\bNAT\b', 'nat'), (r'\bVPN\b', 've pe ene'),
    (r'\bRADIUS\b', 'radius'), (r'\bNAS\b', 'nas'), (r'\bIP\b', 'i pe'), (r'\bLAN\b', 'lan'), (r'\bMAN\b', 'man'),
    (r'\bPAN\b', 'pan'), (r'\bEC\b', 'e ce'), (r'\bSCD\b', 'ese ce de'), (r'\bCMN\b', 'ce eme ene'),
    (r'\bTFI\b', 'te efe i'), (r'\bXAMPP\b', 'shamp'), (r'\bLAMP\b', 'lamp'), (r'\bWAMP\b', 'uamp'),
    (r'\bCVSS\b', 'ce ve ese ese'), (r'\bOWASP\b', 'ouasp'), (r'\bXSS\b', 'equis ese ese'), (r'\bSYN flood\b', 'sin flad'),
    (r'\bRUP\b', 'rup'), (r'\bOMT\b', 'o eme te'), (r'\bOOSE\b', 'o o ese e'), (r'\bE/S\b', 'entrada salida'),
    (r'\bMOD\b', 'mod'), (r'<-', ' flecha '), (r'→', ', '), (r'↠', ' multidetermina '),
    (r'\bCat (\d)e\b', r'categoría \1 e'), (r'\bCat (\d)A\b', r'categoría \1 A'), (r'\bCat (\d)\b', r'categoría \1'),
]
PRON = [(re.compile(p), r) for p, r in PRON]


def spoken(text):
    text = re.sub(r'\{([^|{}]*)\|([^{}]*)\}', r'\2', text)
    for rx, rep in PRON:
        text = rx.sub(rep, text)
    return text


def display(text):
    return re.sub(r'\{([^|{}]*)\|([^{}]*)\}', r'\1', text)


def parse():
    eps = []
    for f in sorted(SRC.glob('*.txt')):
        cur = None
        for raw in f.read_text(encoding='utf-8').splitlines():
            line = raw.strip()
            if not line:
                continue
            if line.startswith('=== id:'):
                cur = {'id': line.split(':', 1)[1].strip(), 'lines': [], 'quiz': []}
                eps.append(cur)
            elif re.match(r'^(titulo|pilar|puntos|resumen):', line):
                k, v = line.split(':', 1)
                cur[k] = v.strip()
            elif line[:2] in ('L:', 'T:'):
                cur['lines'].append({'s': line[0], 'raw': line[2:].strip()})
            elif line.startswith('Q:'):
                parts = [p.strip() for p in line[2:].split('|')]
                if len(parts) != 5:
                    sys.exit(f'Pregunta mal formada en {cur["id"]}: {line}')
                cur['quiz'].append({'q': parts[0], 'o': parts[1:4], 'e': parts[4]})
            else:
                sys.exit(f'Línea no reconocida en {f.name}: {line}')
    return eps


# ---------- MP3: quitar la trama Xing/Info y medir duración exacta ----------
BR = {  # (versión, capa III) -> kbps
    1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
}
SR = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def mp3_frames(data):
    """Devuelve (bytes sin tramas Xing/Info, segundos)."""
    i, out, secs = 0, bytearray(), 0.0
    if data[:3] == b'ID3':
        i = 10 + ((data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9])
    while i + 4 <= len(data):
        h = data[i:i + 4]
        if h[0] != 0xFF or (h[1] & 0xE0) != 0xE0:
            i += 1
            continue
        ver_bits = (h[1] >> 3) & 3
        if ver_bits == 1 or ((h[1] >> 1) & 3) != 1:
            i += 1
            continue
        ver = 1 if ver_bits == 3 else 2
        br = BR[ver][(h[2] >> 4) & 15] * 1000
        sr = SR[ver_bits][(h[2] >> 2) & 3] if ((h[2] >> 2) & 3) < 3 else 0
        if not br or not sr:
            i += 1
            continue
        pad = (h[2] >> 1) & 1
        size = (144 if ver == 1 else 72) * br // sr + pad
        frame = data[i:i + size]
        if b'Xing' in frame[:64] or b'Info' in frame[:64]:
            i += size
            continue
        out += frame
        secs += (1152 if ver == 1 else 576) / sr
        i += size
    return bytes(out), secs


async def synth(text, voice, path, sem):
    import edge_tts
    async with sem:
        for attempt in range(4):
            try:
                comm = edge_tts.Communicate(text, voice, rate=RATE)
                buf = bytearray()
                async for ch in comm.stream():
                    if ch['type'] == 'audio':
                        buf += ch['data']
                if not buf:
                    raise RuntimeError('audio vacío')
                path.write_bytes(bytes(buf))
                return
            except Exception as e:  # reintentos ante cortes de red
                if attempt == 3:
                    raise
                print(f'  reintento {attempt + 1}: {e}')
                await asyncio.sleep(2 + attempt * 3)


async def build_audio(eps, only):
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT_AUDIO.mkdir(exist_ok=True)
    sem = asyncio.Semaphore(4)
    jobs = []
    for ep in eps:
        if only and ep['id'] not in only:
            continue
        for ln in ep['lines']:
            txt = spoken(ln['raw'])
            key = hashlib.sha1(f'{VOICES[ln["s"]]}|{RATE}|{txt}'.encode()).hexdigest()[:20]
            ln['cache'] = CACHE / f'{key}.mp3'
            if not ln['cache'].exists():
                jobs.append(synth(txt, VOICES[ln['s']], ln['cache'], sem))
    print(f'Segmentos a sintetizar: {len(jobs)}')
    done = 0
    for coro in asyncio.as_completed(jobs):
        await coro
        done += 1
        if done % 25 == 0:
            print(f'  {done}/{len(jobs)}')


def assemble(eps, only):
    for ep in eps:
        if only and ep['id'] not in only:
            continue
        audio, t = bytearray(), 0.0
        for ln in ep['lines']:
            seg, secs = mp3_frames(ln['cache'].read_bytes())
            ln['at'] = round(t, 2)
            audio += seg
            t += secs
        (OUT_AUDIO / f'{ep["id"]}.mp3').write_bytes(bytes(audio))
        ep['dur'] = round(t, 1)
        print(f'{ep["id"]}: {t / 60:.1f} min, {len(audio) / 1e6:.2f} MB')


def write_data(eps):
    prev = {}
    if OUT_DATA.exists():
        txt = OUT_DATA.read_text(encoding='utf-8')
        m = re.search(r'window\.PODCASTS = (\[.*\]);', txt, re.S)
        if m:
            prev = {e['id']: e for e in json.loads(m.group(1))}
    data = []
    for ep in eps:
        old = prev.get(ep['id'], {})
        lines = []
        for n, ln in enumerate(ep['lines']):
            at = ln.get('at')
            if at is None and old.get('lines') and n < len(old['lines']):
                at = old['lines'][n].get('at')
            lines.append({'s': ln['s'], 't': display(ln['raw']), 'at': at})
        data.append({
            'id': ep['id'], 'titulo': ep['titulo'], 'pilar': ep['pilar'], 'puntos': ep.get('puntos', ''),
            'resumen': ep.get('resumen', ''), 'dur': ep.get('dur', old.get('dur')),
            'file': f'podcast/{ep["id"]}.mp3', 'lines': lines, 'quiz': ep['quiz'],
        })
    OUT_DATA.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    OUT_DATA.write_text(
        '/* Generado por tools/build_podcasts.py — no editar a mano. */\n'
        f'window.PODCAST_HOSTS = {json.dumps(HOSTS, ensure_ascii=False)};\n'
        f'window.PODCASTS = {body};\n', encoding='utf-8')
    print(f'Datos: {OUT_DATA.relative_to(ROOT)} ({len(data)} episodios)')


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    eps = parse()
    args = sys.argv[1:]
    only = set()
    if '--only' in args:
        only = set(args[args.index('--only') + 1].split(','))
    if '--data-only' not in args:
        asyncio.run(build_audio(eps, only))
        assemble(eps, only)
    write_data(eps)


if __name__ == '__main__':
    main()
