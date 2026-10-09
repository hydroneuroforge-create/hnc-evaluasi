// Fidelity check: siapkanLaporan(private data) vs the private oracle (owner's text + PLAN.md §6.4 deviations).
// Normalisation: whitespace collapsed, dash variants equal, punctuation/whitespace style-neutral (so punctuation
// may sit inside or outside a markup span). Words AND bold/italic spans must match.
// Also fails on any `terlarang` string or periksaNama() hit in any generated text.
// Report: <output>/cek-fidelitas.md
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { keRuns, kumpulkanTeks, periksaNama, siapkanLaporan, siapkanSertifikat, type LaporanSiap } from '../src/core/index.ts';
import { bacaDataAnak, bacaOracle } from './lib/data-privat.ts';
import { BERKAS_CEK_FIDELITAS } from './lib/jalur.ts';

const NETRAL = /[\s.,;:!?()"'“”‘’\-]/;
const FRASA_EVALUASI = 'setelah Ananda menyelesaikan 24 sesi berikutnya';

/** Canonical markup: per-character style, neutral characters unstyled, runs re-merged. */
export function normalisasi(markup: string): string {
  const huruf: { c: string; b: boolean; i: boolean }[] = [];
  for (const r of keRuns(markup)) {
    for (const c0 of r.teks.replace(/[\u2012-\u2015\u2212]/g, '-').replace(/\s/g, ' ')) {
      const netral = NETRAL.test(c0);
      huruf.push({ c: c0, b: !netral && !!r.tebal, i: !netral && !!r.miring });
    }
  }
  // collapse whitespace
  const rapi = huruf.filter((h, idx) => !(h.c === ' ' && (idx === 0 || huruf[idx - 1]!.c === ' ')));
  while (rapi.length && rapi[rapi.length - 1]!.c === ' ') rapi.pop();
  let out = '';
  let b = false;
  let i = false;
  for (const h of rapi) {
    if (h.i !== i && i) { out += '_'; i = false; }
    if (h.b !== b) { out += '**'; b = h.b; }
    if (h.i !== i) { out += '_'; i = h.i; }
    out += h.c;
  }
  if (i) out += '_';
  if (b) out += '**';
  return out;
}

/** Simple word diff (LCS) for the report. */
function diffKata(a: string, b: string): string {
  const x = a.split(' ');
  const y = b.split(' ');
  const m = x.length;
  const n = y.length;
  const t: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let p = m - 1; p >= 0; p--) for (let q = n - 1; q >= 0; q--) t[p]![q] = x[p] === y[q] ? t[p + 1]![q + 1]! + 1 : Math.max(t[p + 1]![q]!, t[p]![q + 1]!);
  const out: string[] = [];
  let p = 0;
  let q = 0;
  while (p < m && q < n) {
    if (x[p] === y[q]) { out.push(x[p]!); p++; q++; }
    else if (t[p + 1]![q]! >= t[p]![q + 1]!) out.push(`[-${x[p++]}-]`);
    else out.push(`{+${y[q++]}+}`);
  }
  while (p < m) out.push(`[-${x[p++]}-]`);
  while (q < n) out.push(`{+${y[q++]}+}`);
  return out.join(' ');
}

interface Hasil { id: string; lulus: boolean; catatan?: string; diff?: string }

const data = bacaDataAnak();
const oracle = bacaOracle();
const siap: LaporanSiap = siapkanLaporan(data, { ketat: true });
const hasil: Hasil[] = [];

const bandingkan = (id: string, harapan: string | undefined, dapat: string | undefined) => {
  if (harapan === undefined) { hasil.push({ id, lulus: false, catatan: 'tidak ada di oracle' }); return; }
  if (dapat === undefined) { hasil.push({ id, lulus: false, catatan: 'tidak dihasilkan generator' }); return; }
  const a = normalisasi(harapan);
  const b = normalisasi(dapat);
  hasil.push(a === b ? { id, lulus: true } : { id, lulus: false, diff: diffKata(a, b) });
};
const jumlah = (id: string, harapan: number, dapat: number) =>
  hasil.push(harapan === dapat ? { id, lulus: true } : { id, lulus: false, catatan: `jumlah ${dapat}, seharusnya ${harapan}` });

// Kegiatan 14 BEFORE + 14 AFTER
for (const k of siap.kegiatan.kartu) {
  bandingkan(`kegiatan.${k.id}.sebelum`, oracle.kegiatan[k.id]?.sebelum, k.sebelum.paragraf.markup);
  bandingkan(`kegiatan.${k.id}.sesudah`, oracle.kegiatan[k.id]?.sesudah, k.sesudah.paragraf.markup);
}
jumlah('kegiatan.jumlah', Object.keys(oracle.kegiatan).length, siap.kegiatan.kartu.length);

// Legends (index 0..3 = value 1..4)
const leg = (nama: string, daftar: string[], baris: LaporanSiap['sensori']['legenda']['baris']) =>
  daftar.forEach((t, i) => bandingkan(`${nama}.nilai${i + 1}`, t, baris.find((x) => x.nilai === i + 1)?.paragraf.markup));
leg('legendaSensori', oracle.legendaSensori, siap.sensori.legenda.baris);
leg('legendaRefleks', oracle.legendaRefleks, siap.refleks.legenda.baris);
leg('skalaProgram', oracle.skalaProgram, siap.program.legenda.baris);

// Summary, Gambaran
jumlah('ringkasanRefleks.jumlah', oracle.ringkasanRefleks.length, siap.refleks.ringkasan.length);
oracle.ringkasanRefleks.forEach((t, i) => bandingkan(`ringkasanRefleks.${i + 1}`, t, siap.refleks.ringkasan[i]?.markup));
bandingkan('gambaran.pengantar', oracle.gambaranPengantar, siap.refleks.pengantar.markup);
jumlah('gambaran.jumlah', Object.keys(oracle.gambaran).length, siap.refleks.gambaran.length);
for (const [id, t] of Object.entries(oracle.gambaran)) bandingkan(`gambaran.${id}`, t, siap.refleks.gambaran.find((g) => g.id === id)?.paragraf.markup);

// Kesimpulan
const ks = oracle.kesimpulan;
bandingkan('kesimpulan.p1', ks.p1, siap.kesimpulan.p1.markup);
bandingkan('kesimpulan.p2', ks.p2, siap.kesimpulan.p2.markup);
jumlah('kesimpulan.sorotan.jumlah', ks.sorotan.length, siap.kesimpulan.sorotan.length);
ks.sorotan.forEach((t, i) => bandingkan(`kesimpulan.sorotan.${i + 1}`, t, siap.kesimpulan.sorotan[i]?.markup));
bandingkan('kesimpulan.p3', ks.p3, siap.kesimpulan.p3.markup);
jumlah('kesimpulan.rekomendasi.jumlah', ks.rekomendasi.length, siap.kesimpulan.rekomendasi.length);
ks.rekomendasi.forEach((t, i) => bandingkan(`kesimpulan.rekomendasi.${i + 1}`, t, siap.kesimpulan.rekomendasi[i]?.markup));

// Pengesahan
bandingkan('pengesahan.tanggal', oracle.pengesahan.tanggal, siap.pengesahan.tempatTanggal.markup);
oracle.pengesahan.nama.forEach((t, i) => bandingkan(`pengesahan.nama.${i + 1}`, t, siap.pengesahan.penandatangan[i]?.nama));
oracle.pengesahan.peran.forEach((t, i) => bandingkan(`pengesahan.peran.${i + 1}`, t, siap.pengesahan.penandatangan[i]?.peran));

// Global checks over every generated text (report + certificate)
const sertifikat = siapkanSertifikat(data);
const semuaTeks = [...kumpulkanTeks(siap), sertifikat.nama, sertifikat.pencapaian.markup, sertifikat.tempatTanggal, sertifikat.judul];
const gabungan = semuaTeks.join('\n');
oracle.terlarang.forEach((t, i) => {
  const ada = gabungan.includes(t);
  hasil.push({ id: `terlarang.${i + 1}`, lulus: !ada, ...(ada ? { catatan: `pola terlarang #${i + 1} ditemukan` } : {}) });
});
const temuanNama = semuaTeks.flatMap((t) => periksaNama(t, data.anak));
hasil.push({ id: 'periksaNama', lulus: temuanNama.length === 0, ...(temuanNama.length ? { catatan: `${temuanNama.length} nama tidak dikenal` } : {}) });
const ev = siap.target.evaluasiBerikutnya.markup;
hasil.push({ id: 'evaluasiBerikutnya.frasa', lulus: ev.includes(FRASA_EVALUASI) && !/\d{4}/.test(ev), ...(ev.includes(FRASA_EVALUASI) ? {} : { catatan: ev }) });

// Report
const gagal = hasil.filter((h) => !h.lulus);
const baris = [
  '# Cek fidelitas — generator vs teks dokumen asli',
  '',
  `Set skala: ${siap.meta.setSkala}. Diperiksa: ${hasil.length} butir. **${gagal.length === 0 ? '100% PASS' : `${gagal.length} FAIL`}** (${hasil.length - gagal.length}/${hasil.length}).`,
  '',
  'Normalisasi: spasi diringkas, varian tanda pisah dianggap sama, tanda baca boleh di dalam/di luar penanda tebal/miring. Kata dan rentang **tebal**/_miring_ harus sama.',
  '',
  '| Butir | Hasil | Catatan |',
  '|---|---|---|',
  ...hasil.map((h) => `| ${h.id} | ${h.lulus ? 'PASS' : '**FAIL**'} | ${h.catatan ?? ''} |`),
  '',
];
if (gagal.some((h) => h.diff)) {
  baris.push('## Selisih kata (`[-oracle-]` `{+generator+}`)', '');
  for (const h of gagal.filter((x) => x.diff)) baris.push(`### ${h.id}`, '', h.diff!, '');
}
mkdirSync(dirname(BERKAS_CEK_FIDELITAS), { recursive: true });
writeFileSync(BERKAS_CEK_FIDELITAS, baris.join('\n'));

console.log(`fidelitas: ${hasil.length - gagal.length}/${hasil.length} PASS -> ${BERKAS_CEK_FIDELITAS}`);
if (gagal.length) {
  for (const h of gagal) console.error(`  FAIL ${h.id}${h.catatan ? ` — ${h.catatan}` : ''}${h.diff ? `\n    ${h.diff}` : ''}`);
  process.exit(1);
}
