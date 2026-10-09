#!/usr/bin/env python3
"""Compares the partner-logo renders of scripts/render-mitra.tsx (<dir>/*-tanpa.pdf vs *-yasi.pdf).

(a) same report page count; (b) report pages 2..N-1 pixel-identical; (c) on the report cover + approval page and
both certificates the changed pixels lie in the logo band (above the first text block) and touch no word;
(d) identical words + positions on every page; (e) cover + approval page carry one more image;
(f) with --dasar <dir>: every *-tanpa.pdf is pixel-identical page by page, and byte-identical apart from the creation
    timestamp + document /ID, to the same file rendered on the base commit.
Prints PASS/FAIL lines and exits 1 on any failure.
Usage: python3 scripts/cek-mitra.py <dir> [--dasar <dir>]
"""
import argparse
import re
import sys
from pathlib import Path

import fitz
import numpy as np

DPI = 120
JANGKAR = {'laporan-1': 'LAPORAN', 'laporan-N': 'NOMOR', 'sertifikat': 'Sertifikat'}
gagal: list[str] = []


def cek(ok: bool, pesan: str) -> None:
    print(f"{'PASS' if ok else 'FAIL'} {pesan}")
    if not ok:
        gagal.append(pesan)


def piksel(page: fitz.Page) -> np.ndarray:
    pix = page.get_pixmap(matrix=fitz.Matrix(DPI / 72, DPI / 72), alpha=False)
    return np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, pix.n)


def beda_bbox(a: np.ndarray, b: np.ndarray):
    """Bbox (x0, y0, x1, y1) of differing pixels in PDF points, or None."""
    ys, xs = np.where((a != b).any(axis=2))
    if not len(xs):
        return None
    f = 72 / DPI
    return fitz.Rect(xs.min() * f, ys.min() * f, (xs.max() + 1) * f, (ys.max() + 1) * f)


def cek_pita(nama: str, pt: fitz.Page, py: fitz.Page, jangkar: str) -> None:
    kotak = beda_bbox(piksel(pt), piksel(py))
    if kotak is None:
        cek(False, f'{nama}: tidak ada perbedaan (logo YASI tidak tercetak?)')
        return
    # letter-spaced headings come out as single letters: match text blocks with whitespace removed
    atas = min((bl[1] for bl in pt.get_text('blocks') if ''.join(bl[4].split()).startswith(jangkar)), default=None)
    cek(atas is not None and kotak.y1 <= atas, f'{nama}: perbedaan {tuple(round(v, 1) for v in kotak)} di atas "{jangkar}" (y={atas and round(atas, 1)})')
    tabrak = [w[4] for w in py.get_text('words') if fitz.Rect(w[:4]).intersects(kotak)]
    cek(not tabrak, f'{nama}: perbedaan tidak menyentuh teks {tabrak[:5] if tabrak else ""}')


def sama_kata(nama: str, a: fitz.Document, b: fitz.Document) -> None:
    beda = [i + 1 for i in range(min(len(a), len(b))) if a[i].get_text('words') != b[i].get_text('words')]
    cek(not beda, f'{nama}: teks + posisi sama di semua halaman {beda or ""}')


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('dir', type=Path)
    ap.add_argument('--dasar', type=Path)
    a = ap.parse_args()
    d = a.dir

    lt, ly = fitz.open(d / 'laporan-tanpa.pdf'), fitz.open(d / 'laporan-yasi.pdf')
    n = len(lt)
    cek(n == len(ly), f'(a) jumlah halaman laporan sama ({n} / {len(ly)})')
    beda = [i + 1 for i in range(1, n - 1) if not np.array_equal(piksel(lt[i]), piksel(ly[i]))]
    cek(not beda, f'(b) halaman 2..{n - 1} identik piksel {beda or ""}')
    cek_pita('(c) laporan sampul', lt[0], ly[0], JANGKAR['laporan-1'])
    cek_pita('(c) laporan pengesahan', lt[n - 1], ly[n - 1], JANGKAR['laporan-N'])
    sama_kata('(d) laporan', lt, ly)
    for i in (0, n - 1):
        cek(len(ly[i].get_images()) == len(lt[i].get_images()) + 1, f'(e) halaman {i + 1}: gambar {len(lt[i].get_images())} -> {len(ly[i].get_images())}')
    for v in ('a4', 'sosial'):
        st, sy = fitz.open(d / f'sertifikat-{v}-tanpa.pdf'), fitz.open(d / f'sertifikat-{v}-yasi.pdf')
        cek_pita(f'(c) sertifikat {v}', st[0], sy[0], JANGKAR['sertifikat'])
        sama_kata(f'(d) sertifikat {v}', st, sy)
        cek(len(sy[0].get_images()) == len(st[0].get_images()) + 1, f'(e) sertifikat {v}: gambar {len(st[0].get_images())} -> {len(sy[0].get_images())}')

    if a.dasar:
        for nama in ('laporan-tanpa.pdf', 'sertifikat-a4-tanpa.pdf', 'sertifikat-sosial-tanpa.pdf'):
            x, y = fitz.open(d / nama), fitz.open(a.dasar / nama)
            beda = [i + 1 for i in range(len(x)) if len(x) != len(y) or not np.array_equal(piksel(x[i]), piksel(y[i]))]
            cek(len(x) == len(y) and not beda, f'(f) {nama} identik piksel dengan commit dasar ({len(x)} / {len(y)} halaman) {beda or ""}')
            tanpa_waktu = lambda f: re.sub(rb'/ID \[<[0-9a-f]+> <[0-9a-f]+>\]', b'', re.sub(rb'\(D:\d{14}Z\)', b'', f.read_bytes()))
            cek(tanpa_waktu(d / nama) == tanpa_waktu(a.dasar / nama), f'(f) {nama} identik byte dengan commit dasar (kecuali tanggal dibuat + /ID)')

    print('SEMUA LULUS' if not gagal else f'{len(gagal)} GAGAL')
    sys.exit(1 if gagal else 0)


if __name__ == '__main__':
    main()
