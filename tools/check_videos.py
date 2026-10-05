import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

video_ids = [
    ('va1_osi', 'KTcMdtpWi3U'),
    ('va2_dispositivos', 'Gky8-OVYmT4'),
    ('va3_subnetting', 'kIUIMUpXDrY'),
    ('va6_wan', 'AiyRFuEPiVY'),
    ('vb1_ws_ad', 'yuQATj2xTI8'),
    ('vb2_fsmo', 'GtrLpbGRbqM'),
    ('vb3_sitios_replicacion', '21i4bKuDPsA'),
    ('vb4_agdlp_ntfs', 'z2wz8DUgdds'),
    ('vb5_impresoras', 'djK0uwngQn8'),
    ('vb6_servicios_red', 'nSUl7bLUybc'),
    ('vc1_uml', 'OvdtyLDDK_Y'),
    ('vc3_historia_paradigmas', 'hcuvB58hwlE'),
    ('vc4_estructurada', 'e_8utUe9ghg'),
    ('vc5_web_dom', 'Jh-LUQMwtRk'),
    ('vc6_backend_php_asp', 'I75CUdSJifw'),
    ('vd1_mer', '7XnGypgLxvc'),
    ('vd2_relacional', 'RHxh8ATzmO0'),
    ('vd3_normalizacion_1_3', 'QUWrKd9vK28'),
    ('vd4_normalizacion_4_5', 'DRV9_uM6sts'),
    ('vd5_sql_curso', 'MZWI0AZcfG4'),
    ('vd6_tsql_avanzado', '09lsHOi3vP4'),
    ('va4_medios', 'Afk_ZWaXL2w'),
    ('va5_enrutamiento', 'aNkQXJ8rS4Q'),
    ('vc2_compiladores', 'JWrwnWD9E1M')
]

for tag, vid in video_ids:
    url = f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            print(f"[OK] {tag} ({vid}): {data.get('title')} by {data.get('author_name')}")
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {tag} ({vid}): HTTP {e.code} - {e.reason}")
    except Exception as e:
        print(f"[ERR] {tag} ({vid}): {e}")
