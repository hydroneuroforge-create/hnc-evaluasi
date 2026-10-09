#!/usr/bin/env python3
"""Writes the committed logo derivatives from assets/logo-center.png (PLAN.md §9).

- assets/logo-center-lockup.png: tight crop of the opaque area + 8 px, upscaled x3 (LANCZOS);
- assets/logo-center-mark.png:   the symbol only (columns 12-206, rows 144-298), upscaled x3;
- assets/logo-yasi.png:          partner logo (Yayasan Anak Spesial Indonesia) from the JPG on black (--yasi), used
  AS-IS: the original artwork (star above the grey text, original colours and proportions) with only the black
  background turned transparent, the empty margin cropped uniformly and a uniform downscale; longest side 720 px.
  Never rearranged, recoloured or split. Skipped with a note if the JPG is missing (it is never committed).

Resampling is done on premultiplied alpha so the transparent edges stay clean (no dark fringes).
Usage: python3 scripts/siapkan-aset.py [--yasi <logo-yasi.JPG>]
"""
import argparse
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parent.parent
SUMBER = REPO / 'assets' / 'logo-center.png'
SKALA = 3
PADDING = 8
# Opaque columns of the source: mark 20-198, wordmark 221-397; opaque rows 152-290 (exclusive end).
KOTAK_MARK = (12, 144, 207, 299)
YASI_JPG = Path('/projects/sandbox/hnc-evaluasi-pratinjau/logo-yasi.JPG')
YASI_MAKS = 720  # longest side (px) of the embedded asset
YASI_BUKA = 128  # source brightness from which a pixel is fully opaque (star and grey-text cores are brighter)
YASI_DERAU = 10  # darker source pixels are background noise -> transparent
YASI_MARGIN = 0.055  # margin per side as a share of the ink height (ink/height ≈ the HNC lockup's 416/462)


def perbesar(img: Image.Image) -> Image.Image:
    rgba = img.convert('RGBA').convert('RGBa')
    besar = rgba.resize((img.width * SKALA, img.height * SKALA), Image.LANCZOS)
    return besar.convert('RGBA')


def buat_logo_yasi(sumber: Path) -> None:
    """The original artwork (star above the text), only: black background -> transparency, uniform crop, uniform scale.

    Colour-to-alpha against black: alpha = max(R, G, B) / YASI_BUKA (capped at 1), colour un-premultiplied
    (RGB / alpha), so alpha x colour reproduces the source pixel exactly over black and every pixel at least
    YASI_BUKA bright stays opaque with its original colour (no recolouring, no black halo on a light page).
    Crop and scale are applied to the opaque JPG first, so resampling can't darken the transparent edges.
    """
    import numpy as np

    jpg = Image.open(sumber).convert('RGB')
    x0, y0, x1, y1 = jpg.point(lambda v: 255 if v >= YASI_DERAU else 0).getbbox()
    m = round(YASI_MARGIN * (y1 - y0))  # same margin on every side
    jpg = jpg.crop((x0 - m, y0 - m, x1 + m, y1 + m))
    f = YASI_MAKS / max(jpg.size)
    if f < 1:
        jpg = jpg.resize((round(jpg.width * f), round(jpg.height * f)), Image.LANCZOS)
    a = np.asarray(jpg).astype(np.float32)
    mx = a.max(axis=2)
    alpha = np.clip(mx / YASI_BUKA, 0, 1)
    alpha[mx < YASI_DERAU] = 0  # JPG noise in the black background
    rgb = np.clip(a / np.maximum(alpha, 1e-6)[..., None], 0, 255)
    img = Image.fromarray(np.dstack([rgb, alpha * 255]).round().astype(np.uint8))
    tujuan = REPO / 'assets' / 'logo-yasi.png'
    img.save(tujuan, optimize=True)
    print(f'{tujuan.relative_to(REPO)}: {img.width}x{img.height} (RASIO_LOGO_YASI {img.width}/{img.height}, '
          f'{tujuan.stat().st_size // 1024} kB)')


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--yasi', type=Path, default=YASI_JPG, help='YASI logo JPG (white/grey on black)')
    arg = ap.parse_args()
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
    if arg.yasi.exists():
        buat_logo_yasi(arg.yasi)
    else:
        print(f'lewati assets/logo-yasi.png: sumber {arg.yasi} tidak ditemukan')


if __name__ == '__main__':
    main()
