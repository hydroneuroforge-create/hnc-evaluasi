#!/usr/bin/env python3
"""Writes the committed logo derivatives from assets/logo-center.png (PLAN.md §9).

- assets/logo-center-lockup.png: tight crop of the opaque area + 8 px, upscaled x3 (LANCZOS);
- assets/logo-center-mark.png:   the symbol only (columns 12-206, rows 144-298), upscaled x3;
- assets/logo-yasi.png:          partner logo (Yayasan Anak Spesial Indonesia) from the JPG on black (--yasi):
  black background removed with soft alpha (no halo), grey text darkened to #444 so it reads on white,
  cropped + 12 px, longest side 800 px. Skipped with a note if the JPG is missing (it is never committed).

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
YASI_TEKS = (0x44, 0x44, 0x44)
YASI_MAKS = 800


def perbesar(img: Image.Image) -> Image.Image:
    rgba = img.convert('RGBA').convert('RGBa')
    besar = rgba.resize((img.width * SKALA, img.height * SKALA), Image.LANCZOS)
    return besar.convert('RGBA')


def buat_logo_yasi(sumber: Path) -> None:
    """Same algorithm as the reviewed pratinjau script (scripts/tambah-logo-yasi.py, buat_logo_transparan)."""
    import numpy as np

    a = np.asarray(Image.open(sumber).convert('RGB')).astype(np.float32)
    mx = a.max(axis=2)
    baris = np.where((mx > 40).any(axis=1))[0]
    pisah = baris[np.argmax(np.diff(baris))] + 1  # largest black gap = star rows | text rows
    out = np.zeros(a.shape[:2] + (4,), np.float32)
    # star: alpha from brightness, colour un-premultiplied (source = colour x alpha over black)
    s = slice(0, pisah)
    out[s, :, :3] = np.clip(a[s] / np.maximum(mx[s], 1)[..., None] * np.maximum(mx[s], 115)[..., None], 0, 255)
    out[s, :, 3] = np.clip((mx[s] - 25) / 90, 0, 1) * 255
    # grey text: alpha from brightness, colour replaced by dark grey
    t = slice(pisah, None)
    out[t, :, :3] = YASI_TEKS
    out[t, :, 3] = np.clip((mx[t] - 25) / 100, 0, 1) * 255
    img = Image.fromarray(out.round().astype(np.uint8))
    ys, xs = np.where(out[..., 3] > 8)
    pad = 12
    img = img.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(img.width, xs.max() + 1 + pad), min(img.height, ys.max() + 1 + pad)))
    f = YASI_MAKS / max(img.size)
    if f < 1:
        img = img.convert('RGBa').resize((round(img.width * f), round(img.height * f)), Image.LANCZOS).convert('RGBA')
    tujuan = REPO / 'assets' / 'logo-yasi.png'
    img.save(tujuan, optimize=True)
    print(f'{tujuan.relative_to(REPO)}: {img.width}x{img.height} ({tujuan.stat().st_size // 1024} kB)')


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
