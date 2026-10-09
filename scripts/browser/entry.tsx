// Browser entry for the browser-safety check (D3): only src/ (core + report) — no Node modules, no data, no
// assets. The caller supplies the input and the assets at runtime.
import { siapkanLaporan, type LaporanInput } from '../../src/core/index.ts';
import { renderLaporanPdf, type AsetRender } from '../../src/report/index.ts';

export interface HasilCek { ok: boolean; bytes: number; kepala: string; halaman: number; b64?: string; galat?: string }

export async function cekLaporan(input: LaporanInput, aset: AsetRender): Promise<HasilCek> {
  try {
    const pdf = await renderLaporanPdf(siapkanLaporan(input), aset);
    const teks = new TextDecoder('latin1').decode(pdf);
    const halaman = (teks.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
    let biner = '';
    for (let i = 0; i < pdf.length; i += 0x8000) biner += String.fromCharCode(...pdf.subarray(i, i + 0x8000));
    return { ok: true, bytes: pdf.length, kepala: teks.slice(0, 5), halaman, b64: btoa(biner) };
  } catch (e) {
    return { ok: false, bytes: 0, kepala: '', halaman: 0, galat: String((e as Error)?.stack ?? e) };
  }
}

(globalThis as unknown as { cekLaporan: typeof cekLaporan }).cekLaporan = cekLaporan;
