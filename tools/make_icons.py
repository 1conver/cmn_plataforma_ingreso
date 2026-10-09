"""Genera los íconos de la PWA (SVG + PNG 192/512) con Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'img'
OUT.mkdir(parents=True, exist_ok=True)
BG, ACC, INK = (11, 15, 13), (168, 197, 111), (11, 15, 13)

SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#0b0f0d"/>
<path d="M32 7 12 14.8v14.4C12 42 20.6 50.8 32 55c11.4-4.2 20-13 20-25.8V14.8z" fill="#a8c56f"/>
<path d="M32 13 17.5 18.6v10.6c0 9.6 6.3 16.4 14.5 20 8.2-3.6 14.5-10.4 14.5-20V18.6z" fill="#0b0f0d"/>
<path d="M22 33h5.5l2.8-8.5 4.2 14 3-8.5H43" fill="none" stroke="#a8c56f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''
(OUT / 'icon.svg').write_text(SVG, encoding='utf-8')


def shield(d, s, scale, inset, fill):
    # escudo aproximado con polígono (64 unidades → s px)
    k = s / 64
    pts = []
    top, left, right = 7 + inset, 12 + inset, 52 - inset
    pts += [(32, top), (left, 14.8 + inset * 0.6), (left, 29)]
    for t in range(0, 11):
        a = t / 10
        x = left + (32 - left) * a
        y = 29 + (55 - inset * 1.1 - 29) * (a ** 0.6)
        pts.append((x, y))
    for t in range(10, -1, -1):
        a = t / 10
        x = right - (right - 32) * a
        y = 29 + (55 - inset * 1.1 - 29) * (a ** 0.6)
        pts.append((x, y))
    pts += [(right, 14.8 + inset * 0.6)]
    d.polygon([(x * k, y * k) for x, y in pts], fill=fill)


for size in (192, 512):
    img = Image.new('RGB', (size, size), BG)
    d = ImageDraw.Draw(img)
    shield(d, size, 1, 0, ACC)
    shield(d, size, 1, 5.5, BG)
    k = size / 64
    line = [(22, 33), (27.5, 33), (30.3, 24.5), (34.5, 38.5), (37.5, 30), (43, 30)]
    d.line([(x * k, y * k) for x, y in line], fill=ACC, width=max(2, int(3 * k)), joint='curve')
    img.save(OUT / f'icon-{size}.png')
print('ok')
