#!/usr/bin/env python3
"""Output checks for the sample flow (PLAN.md §9). Writes cek-output.txt next to the outputs and exits 1 on failure.

Checks the report PDF: A4 size; page 1 without kop/footer; pages 2..N with kop, footer
'Rahasia – untuk orang tua/wali' and 'Halaman i dari N'; embedded fonts only PlusJakartaSans-*; no forbidden
strings (oracle 'terlarang') in the PDF text or the Markdown outputs; the exact next-evaluation phrase; no
'Program Latihan di Rumah'; previews exist (one per page). Certificate: one A4-landscape page, fonts, exact
texts + both signatories, no STR/contact/promotion, logo + 2 signatures, IG handle <= 7 pt, PNG 1080x1350.
Paths: HNC_OUTPUT (default /projects/sandbox/_referensi/output), HNC_DATA (default /projects/sandbox/_referensi/data).
"""
import json
import os
import re
import sys
from pathlib import Path

import fitz

OUTPUT = Path(os.environ.get('HNC_OUTPUT', '/projects/sandbox/_referensi/output'))
DATA = Path(os.environ.get('HNC_DATA', '/projects/sandbox/_referensi/data'))
LAPORAN = OUTPUT / 'contoh-laporan.pdf'
PREVIEW = OUTPUT / 'preview'
SERTIFIKAT_PDF = OUTPUT / 'contoh-sertifikat.pdf'
SERTIFIKAT_PNG = OUTPUT / 'contoh-sertifikat.png'

KOP = 'Hydro Neuroforge Center'
RAHASIA = 'Rahasia – untuk orang tua/wali'
FRASA_EVAL = 'setelah Ananda menyelesaikan 24 sesi berikutnya'
DILARANG_TAMBAHAN = ['Program Latihan di Rumah']  # plus the oracle 'terlarang' list (read at runtime)
A4 = (595.28, 841.89)

hasil: list[tuple[bool, str]] = []


def cek(lulus: bool, pesan: str) -> None:
    hasil.append((bool(lulus), pesan))


def rapat(t: str) -> str:
    """Normalises whitespace (letter-spaced labels and line breaks)."""
    return re.sub(r'\s+', ' ', t)


def main() -> None:
    oracle = json.loads((DATA / 'referensi-teks-sumber.json').read_text(encoding='utf8'))
    terlarang = list(oracle.get('terlarang', [])) + DILARANG_TAMBAHAN

    cek(LAPORAN.exists(), f'laporan ada: {LAPORAN.name}')
    if not LAPORAN.exists():
        return
    doc = fitz.open(LAPORAN)
    n = len(doc)
    cek(n >= 10, f'jumlah halaman laporan {n} (>= 10)')
    ukuran_ok = all(abs(p.rect.width - A4[0]) < 1 and abs(p.rect.height - A4[1]) < 1 for p in doc)
    cek(ukuran_ok, 'semua halaman berukuran A4 (595 x 842 pt)')

    teks = [p.get_text() for p in doc]
    p1 = teks[0]
    cek(RAHASIA not in p1 and 'Halaman 1 dari' not in p1, 'halaman 1 (sampul) tanpa footer')
    tinggi = doc[0].rect.height
    kop_p1 = [b for b in doc[0].get_text('blocks') if b[1] < 70 and KOP in b[4]]
    cek(not kop_p1, 'halaman 1 (sampul) tanpa kop')

    salah = []
    for i in range(1, n):
        halaman = doc[i]
        blok = halaman.get_text('blocks')
        ada_kop = any(b[1] < 70 and KOP in b[4] for b in blok)
        bawah = rapat(' '.join(b[4] for b in blok if b[1] > tinggi - 60))
        if not (ada_kop and RAHASIA in bawah and f'Halaman {i + 1} dari {n}' in bawah):
            salah.append(i + 1)
    cek(not salah, f'halaman 2..{n}: kop + "{RAHASIA}" + "Halaman i dari {n}"' + (f' (gagal: {salah})' if salah else ''))

    fonts = sorted({f[3].split('+', 1)[-1] for p in doc for f in p.get_fonts()})
    asing = [f for f in fonts if not f.startswith('PlusJakartaSans-')]
    cek(not asing, f'font tertanam hanya PlusJakartaSans-* ({", ".join(fonts)})' + (f' — asing: {asing}' if asing else ''))

    semua = rapat(' '.join(teks))
    cek(FRASA_EVAL in semua, f'frasa evaluasi berikutnya ada: "{FRASA_EVAL}"')
    kena = [t for t in terlarang if t in semua]
    cek(not kena, 'tidak ada string terlarang di PDF' + (f' — ditemukan: {kena}' if kena else ''))
    cek(not re.search(r'\b(19|20)\d\d\b', semua.split(FRASA_EVAL)[-1][:80]) if FRASA_EVAL in semua else False,
        'tidak ada tanggal setelah frasa evaluasi berikutnya')

    # Only the sample flow's own outputs; review artifacts in the same folder are not ours.
    for md in (OUTPUT / 'cek-fidelitas.md', OUTPUT / 'draf-bank-kalimat.md'):
        if not md.exists():
            continue
        isi = md.read_text(encoding='utf8')
        kena = [t for t in oracle.get('terlarang', []) if t in isi]
        cek(not kena, f'tidak ada string terlarang di {md.name}' + (f' — ditemukan: {kena}' if kena else ''))

    draf = OUTPUT / 'draf-bank-kalimat.md'
    if draf.exists():
        isi = draf.read_text(encoding='utf8')
        pola = [r'\{[A-Za-z][\w.]*\}', r'\[\[', r'\]\]', r'#\w+:', r'`',
                r'\b(membaik[123]|tetapTerbaik|tetapBelum|memburuk|sesudahNaik|sesudahSama|bukanTerbaik)\b']
        sisa = [p for p in pola if re.search(p, isi)]
        cek(not sisa and 'Hal yang perlu Anda konfirmasi' in isi and '[DOKUMEN]' in isi and '[BARU]' in isi,
            'draf-bank-kalimat.md mudah dibaca (tanpa sintaks kode; tag + bagian konfirmasi ada)'
            + (f' — tersisa: {sisa}' if sisa else ''))

    hilang = [i for i in range(1, n + 1) if not (PREVIEW / f'halaman-{i:02d}.png').exists()]
    cek(not hilang, f'preview halaman-01..{n:02d}.png ada' + (f' (hilang: {hilang})' if hilang else ''))

    cek(SERTIFIKAT_PDF.exists(), f'sertifikat ada: {SERTIFIKAT_PDF.name}')
    if SERTIFIKAT_PDF.exists():
        from PIL import Image  # noqa: WPS433 (only needed for the certificate)
        s = fitz.open(SERTIFIKAT_PDF)
        cek(len(s) == 1 and abs(s[0].rect.width - A4[1]) < 1 and abs(s[0].rect.height - A4[0]) < 1,
            f'sertifikat 1 halaman A4 lanskap ({len(s)} hlm)')
        sf = sorted({f[3].split('+', 1)[-1] for p in s for f in p.get_fonts()})
        cek(sf and all(f.startswith('PlusJakartaSans-') for f in sf), f'font sertifikat hanya PlusJakartaSans-* ({", ".join(sf)})')
        st = rapat(s[0].get_text())
        wajib = ['Sertifikat Pencapaian', 'Certificate of Achievement', 'diberikan kepada',
                 'atas keberhasilannya melakukan water trap di kolam dalam', 'Bogor, 10 Februari 2026', '@hydro.neuroforge']
        wajib += [n for n in oracle.get('pengesahan', {}).get('nama', [])]
        kurang = [w for w in wajib if w not in st]
        cek(not kurang, 'teks sertifikat lengkap (judul, penerima, pencapaian, tanggal, 2 penandatangan, IG)'
            + (f' — kurang: {kurang}' if kurang else ''))
        promosi = [w for w in ['STR', 'WA ', '0881', 'Daftar', 'Hubungi', 'www', 'http', 'Kompleks'] if w in st]
        cek(not promosi, 'sertifikat tanpa STR/kontak/promosi' + (f' — ditemukan: {promosi}' if promosi else ''))
        kena = [t for t in terlarang if t in st]
        cek(not kena, 'tidak ada string terlarang di sertifikat' + (f' — ditemukan: {kena}' if kena else ''))
        cek(len(s[0].get_images()) >= 3, f'sertifikat memuat logo + 2 tanda tangan ({len(s[0].get_images())} gambar)')
        ig = [sp['size'] for b in s[0].get_text('dict')['blocks'] for ln in b.get('lines', []) for sp in ln['spans']
              if '@hydro.neuroforge' in sp['text']]
        cek(ig and max(ig) <= 7, f'handle IG kecil (<= 7 pt: {ig})')
    cek(SERTIFIKAT_PNG.exists(), f'PNG sertifikat ada: {SERTIFIKAT_PNG.name}')
    if SERTIFIKAT_PNG.exists():
        from PIL import Image  # noqa: WPS433
        with Image.open(SERTIFIKAT_PNG) as im:
            cek(im.size == (1080, 1350), f'PNG sertifikat 1080x1350 ({im.size[0]}x{im.size[1]})')
    cek((PREVIEW / 'sertifikat-a4.png').exists(), 'preview/sertifikat-a4.png ada')


if __name__ == '__main__':
    main()
    baris = [f"{'PASS' if ok else 'FAIL'}  {p}" for ok, p in hasil]
    gagal = [b for b in baris if b.startswith('FAIL')]
    laporan = '\n'.join(baris + ['', f'{len(baris) - len(gagal)}/{len(baris)} PASS'])
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / 'cek-output.txt').write_text(laporan + '\n', encoding='utf8')
    print('cek-output:')
    print(laporan)
    sys.exit(1 if gagal else 0)
