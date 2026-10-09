#!/usr/bin/env python3
"""Writes the committed logo derivatives from assets/logo-center.png (PLAN.md §9).

- assets/logo-center-lockup.png: tight crop of the opaque area + 8 px, upscaled x3 (LANCZOS);
- assets/logo-center-mark.png:   the symbol only (columns 12-206, rows 144-298), upscaled x3;
- assets/logo-yasi.png:          partner logo (Yayasan Anak Spesial Indonesia) from the JPG on black (--yasi):
  black background removed with soft alpha (no halo), grey text darkened to #444 so it reads on white, then
  rearranged as a horizontal lockup (star left, text in two lines right) with the same ink/height ratio as the
  HNC lockup, so both render at the same height side by side; longest side 500 px.
  Skipped with a note if the JPG is missing (it is never committed).

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
YASI_MAKS = 500  # longest side (px) of the embedded asset
YASI_BINTANG_PER_BARIS = 4.8  # star height in text-line heights (two lines ≈ 45 % of the star, like the HNC wordmark)


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

    def potong(bagian: Image.Image) -> Image.Image:
        return bagian.crop(bagian.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())

    # horizontal lockup like the HNC logo: star left, the text in two lines right (split at the word gap nearest the middle)
    bintang = potong(img.crop((0, 0, img.width, pisah)))
    teks = potong(img.crop((0, pisah, img.width, img.height)))
    kolom = np.asarray(teks.getchannel('A')).max(axis=0) > 8
    isi = np.where(kolom)[0]
    sela = [(int(isi[i]) + 1, int(isi[i + 1])) for i in np.where(np.diff(isi) > teks.height // 4)[0]]
    x0, x1 = min(sela, key=lambda s: abs((s[0] + s[1]) / 2 - teks.width / 2))
    def potong_x(bagian: Image.Image) -> Image.Image:  # horizontal crop only, so both lines keep one baseline
        k = bagian.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        return bagian.crop((k[0], 0, k[2], bagian.height))

    baris1, baris2 = potong_x(teks.crop((0, 0, x0, teks.height))), potong_x(teks.crop((x1, 0, teks.width, teks.height)))
    tb = teks.height  # one text line incl. descenders, at source scale
    sb = round(tb * YASI_BINTANG_PER_BARIS)
    bintang = bintang.convert('RGBa').resize((round(bintang.width * sb / bintang.height), sb), Image.LANCZOS)
    jarak, antar = round(0.12 * sb), round(0.35 * tb)
    lebar_teks = max(baris1.width, baris2.width)
    tinggi_teks = 2 * tb + antar
    # vertical padding so ink / height equals the HNC lockup's (assets/logo-center-lockup.png: 415 of 462 px)
    tinggi = round(sb * 462 / 415)
    atas, kiri = (tinggi - sb) // 2, (tinggi - sb) // 2
    kanvas = Image.new('RGBa', (kiri + bintang.width + jarak + lebar_teks + kiri, tinggi), (0, 0, 0, 0))
    kanvas.paste(bintang, (kiri, atas))
    yt = atas + (sb - tinggi_teks) // 2
    for i, baris in enumerate((baris1, baris2)):
        kanvas.paste(baris.convert('RGBa'), (kiri + bintang.width + jarak, yt + i * (tb + antar)))
    f = YASI_MAKS / max(kanvas.size)
    if f < 1:
        kanvas = kanvas.resize((round(kanvas.width * f), round(kanvas.height * f)), Image.LANCZOS)
    img = kanvas.convert('RGBA')
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
