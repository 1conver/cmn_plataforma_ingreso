"""Verifica la videoteca: que cada video exista, se pueda embeber y que la duración cargada sea la real.

Uso: python tools/verify_videos.py
Lee los IDs de assets/js/data/temario.js (constante VIDEOS) y consulta la página pública de YouTube.
"""
import concurrent.futures as cf
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'js' / 'data' / 'temario.js'
H = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36',
     'Accept-Language': 'es-AR,es;q=0.9', 'Cookie': 'CONSENT=YES+1; SOCS=CAI'}
STR = r'"((?:[^"\\]|\\.)*)"'


def check(vid):
    try:
        req = urllib.request.Request(f'https://www.youtube.com/watch?v={vid}&hl=es', headers=H)
        t = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
        ln = re.search(r'"lengthSeconds":"(\d+)"', t)
        st = re.search(r'"playabilityStatus":\{"status":"(\w+)"', t)
        emb = re.search(r'"playableInEmbed":(true|false)', t)
        ti = re.search(r'"videoDetails":\{"videoId":"[^"]+","title":' + STR, t)
        return vid, {'len': int(ln.group(1)) if ln else None, 'status': st.group(1) if st else None,
                     'embed': emb.group(1) == 'true' if emb else None,
                     'title': json.loads('"' + ti.group(1) + '"') if ti else None}
    except Exception as e:  # red caída, video borrado, etc.
        return vid, {'err': str(e)}


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    src = SRC.read_text(encoding='utf-8')
    vids = re.findall(r"\{ y: '([\w-]{11})', p: '([A-D])', pts: '[^']*', s: (\d+)", src)
    with cf.ThreadPoolExecutor(8) as ex:
        res = dict(ex.map(check, [v[0] for v in vids]))
    bad = 0
    for vid, p, s in vids:
        r = res[vid]
        ok = r.get('status') == 'OK' and r.get('embed') and r.get('len') and abs(r['len'] - int(s)) <= 3
        bad += not ok
        print(('OK  ' if ok else 'REV '), vid, p, f"{int(s)}s→{r.get('len')}s", r.get('status'), 'embed' if r.get('embed') else 'NO-EMBED',
              (r.get('title') or r.get('err', ''))[:70])
    print(f'\n{len(vids) - bad}/{len(vids)} correctos')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
