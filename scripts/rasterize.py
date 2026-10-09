#!/usr/bin/env python3
"""Rasterises PDF pages to PNG with PyMuPDF.

Usage:
  python3 scripts/rasterize.py <pdf> <dir-out> [--dpi 120] [--prefix halaman-]   -> <dir-out>/<prefix>NN.png
  python3 scripts/rasterize.py <pdf> <png-out> --zoom 2 --page 1                 -> one page to one file
Only overwrites the files it writes. With --rapikan it also removes its own stale <prefix>NN.png pages beyond
the new page count (nothing else is ever deleted).
"""
import argparse
from pathlib import Path

import fitz


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('pdf')
    ap.add_argument('keluaran')
    ap.add_argument('--dpi', type=float, default=120)
    ap.add_argument('--zoom', type=float)
    ap.add_argument('--page', type=int)
    ap.add_argument('--prefix', default='halaman-')
    ap.add_argument('--rapikan', action='store_true')
    a = ap.parse_args()
    doc = fitz.open(a.pdf)
    mat = fitz.Matrix(a.zoom, a.zoom) if a.zoom else fitz.Matrix(a.dpi / 72, a.dpi / 72)
    if a.page:
        pix = doc[a.page - 1].get_pixmap(matrix=mat, alpha=False)
        Path(a.keluaran).parent.mkdir(parents=True, exist_ok=True)
        pix.save(a.keluaran)
        print(f'{a.keluaran}: {pix.width}x{pix.height}')
        return
    out = Path(a.keluaran)
    out.mkdir(parents=True, exist_ok=True)
    for i, page in enumerate(doc, start=1):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        pix.save(out / f'{a.prefix}{i:02d}.png')
    if a.rapikan:
        import re
        pola = re.compile(re.escape(a.prefix) + r'(\d+)\.png$')
        for f in out.iterdir():
            m = pola.fullmatch(f.name)
            if m and int(m.group(1)) > len(doc):
                f.unlink()
    print(f'{out}: {len(doc)} halaman ({a.dpi:g} dpi)')


if __name__ == '__main__':
    main()
