#!/usr/bin/env python3
"""Writes the committed logo derivatives from assets/logo-center.png (PLAN.md §9).

- assets/logo-center-lockup.png: tight crop of the opaque area + 8 px, upscaled x3 (LANCZOS);
- assets/logo-center-mark.png:   the symbol only (columns 12-206, rows 144-298), upscaled x3.

Resampling is done on premultiplied alpha so the transparent edges stay clean (no dark fringes).
Usage: python3 scripts/siapkan-aset.py
"""
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parent.parent
SUMBER = REPO / 'assets' / 'logo-center.png'
SKALA = 3
PADDING = 8
# Opaque columns of the source: mark 20-198, wordmark 221-397; opaque rows 152-290 (exclusive end).
KOTAK_MARK = (12, 144, 207, 299)


def perbesar(img: Image.Image) -> Image.Image:
    rgba = img.convert('RGBA').convert('RGBa')
    besar = rgba.resize((img.width * SKALA, img.height * SKALA), Image.LANCZOS)
    return besar.convert('RGBA')


def main() -> None:
    logo = Image.open(SUMBER).convert('RGBA')
    kotak = logo.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if not kotak:
        raise SystemExit('logo kosong')
    x0, y0, x1, y1 = kotak
    lockup = logo.crop((max(0, x0 - PADDING), max(0, y0 - PADDING), min(logo.width, x1 + PADDING), min(logo.height, y1 + PADDING)))
    mark = logo.crop(KOTAK_MARK)
    for nama, img in (('logo-center-lockup.png', lockup), ('logo-center-mark.png', mark)):
        hasil = perbesar(img)
        tujuan = REPO / 'assets' / nama
        hasil.save(tujuan, optimize=True)
        print(f'{tujuan.relative_to(REPO)}: {hasil.width}x{hasil.height}')


if __name__ == '__main__':
    main()
