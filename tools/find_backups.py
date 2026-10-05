import urllib.request
import urllib.parse
import json
import re
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

queries = {
    'va1_osi': 'modelo OSI 7 capas CCNA espanol',
    'va2_dispositivos': 'diferencias hub switch router espanol',
    'va3_subnetting': 'subnetting ipv4 vlsm curso espanol',
    'va4_medios': 'cables utp fibra optica redes espanol',
    'va5_enrutamiento': 'enrutamiento ospf rip diferencias espanol',
    'va6_wan': 'tecnologias wan frame relay hdlc ppp espanol',
    'vb1_ws_ad': 'active directory windows server curso espanol',
    'vb2_fsmo': 'roles fsmo active directory explicacion espanol',
    'vb3_sitios_replicacion': 'active directory sitios y replicacion kcc espanol',
    'vb4_agdlp_ntfs': 'permisos ntfs compartir agdlp windows server espanol',
    'vb5_impresoras': 'servidor impresion windows server pooling espanol',
    'vb6_servicios_red': 'dhcp dns windows server curso espanol',
    'vc1_uml': 'diagramas uml clases casos de uso espanol',
    'vc2_compiladores': 'compilador interprete linker diferencias espanol',
    'vc3_historia_paradigmas': 'paradigmas programacion historia lenguajes espanol',
    'vc4_estructurada': 'programacion estructurada dijkstra bohm jacopini espanol',
    'vc5_web_dom': 'que es dom javascript html explicacion espanol',
    'vc6_backend_php_asp': 'php mysql basico sesiones espanol',
    'vd1_mer': 'modelo entidad relacion bases de datos curso espanol',
    'vd2_relacional': 'modelo relacional codd integridad referencial espanol',
    'vd3_normalizacion_1_3': 'normalizacion bases de datos 1fn 2fn 3fn espanol',
    'vd4_normalizacion_4_5': 'cuarta y quinta forma normal 4fn 5fn dependencias multivaluadas espanol'
}

current_primaries = {
    'va1_osi': 'KTcMdtpWi3U',
    'va2_dispositivos': 'Gky8-OVYmT4',
    'va3_subnetting': 'kIUIMUpXDrY',
    'va4_medios': 'Afk_ZWaXL2w',
    'va5_enrutamiento': 'aNkQXJ8rS4Q',
    'va6_wan': 'AiyRFuEPiVY',
    'vb1_ws_ad': 'yuQATj2xTI8',
    'vb2_fsmo': 'GtrLpbGRbqM',
    'vb3_sitios_replicacion': '21i4bKuDPsA',
    'vb4_agdlp_ntfs': 'z2wz8DUgdds',
    'vb5_impresoras': 'djK0uwngQn8',
    'vb6_servicios_red': 'nSUl7bLUybc',
    'vc1_uml': 'OvdtyLDDK_Y',
    'vc2_compiladores': 'JWrwnWD9E1M',
    'vc3_historia_paradigmas': 'hcuvB58hwlE',
    'vc4_estructurada': 'e_8utUe9ghg',
    'vc5_web_dom': 'Jh-LUQMwtRk',
    'vc6_backend_php_asp': 'I75CUdSJifw',
    'vd1_mer': '7XnGypgLxvc',
    'vd2_relacional': 'RHxh8ATzmO0',
    'vd3_normalizacion_1_3': 'QUWrKd9vK28',
    'vd4_normalizacion_4_5': 'DRV9_uM6sts'
}

def get_yt_candidates(q):
    url = f'https://www.youtube.com/results?search_query={urllib.parse.quote(q)}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=7) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
            seen = []
            for vid in matches:
                if vid not in seen:
                    seen.append(vid)
                if len(seen) >= 8:
                    break
            return seen
    except Exception as e:
        print('ERR search:', e)
        return []

def check_oembed(vid):
    url = f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return True, data.get('title'), data.get('author_name')
    except:
        return False, '', ''

backups = {}
for k, q in queries.items():
    cands = get_yt_candidates(q)
    primary = current_primaries.get(k)
    found = None
    for vid in cands:
        if vid == primary:
            continue
        ok, title, author = check_oembed(vid)
        if ok and len(title) > 5:
            found = {'vid': vid, 'title': title, 'author': author}
            break
    backups[k] = found
    print(f'{k} -> {found}')

with open('tools/backup_videos.json', 'w', encoding='utf-8') as f:
    json.dump(backups, f, indent=2, ensure_ascii=False)
print('Saved to tools/backup_videos.json')
