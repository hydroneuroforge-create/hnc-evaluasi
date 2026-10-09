// Writes the review document <output>/draf-bank-kalimat.md (PLAN.md §9, brief §13) from the bank metadata.
// Every bank sentence carries its tag: [DOKUMEN] = verbatim from the original report, [BARU] = newly drafted.
// Brief §13: the owner reads this on an iPhone, so NO code-like syntax is printed — template tokens become
// plain blanks in square brackets ("[nilai awal]"), optional segments are printed inline with a plain note
// ("bagian … hanya muncul bila …"), and internal keys are replaced by plain "kapan dipakai" labels.
// The changelog comes from the private oracle (`perubahan`), so no original typo or wrong name lives in the repo.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import * as bank from '../src/core/bank/index.ts';
import type { KelasPerubahan } from '../src/core/bank/refleks.ts';
import {
  BAB_PROGRAM, DOMAIN, KEGIATAN, LEVELS, REFLEKS, SENSORI, SET_SKALA_B, adalahTerbaik, gabungDaftar, hitungSkor,
  isiTemplat, jelaskanSyarat, kataArah, kegiatanDef, labelLegenda, rapikanSpasi, siapkanLaporan, tambahanKegiatan,
  teksPolos, urutanLegenda, type Level, type SkalaId, type TeksBank,
} from '../src/core/index.ts';
import { buatSorotan, peringkatSorotan } from '../src/core/generator/sorotan.ts';
import { buatKonteks } from '../src/core/generator/konteks.ts';
import { bacaDataAnak, bacaOracle } from './lib/data-privat.ts';
import { BERKAS_DRAF } from './lib/jalur.ts';

const data = bacaDataAnak();
const oracle = bacaOracle();
const set = SET_SKALA_B;
const siap = siapkanLaporan(data);
const skor = hitungSkor(data, set);
const out: string[] = [];
const tulis = (...xs: string[]) => out.push(...xs);
const namaPolos = (s: string) => s.replace(/\*\*|_/g, '');
const nilaiTeks = (v: unknown) => (v === 'tdo' ? 'tidak dapat diobservasi' : v === null || v === undefined ? '–' : String(v));

// Plain-language blanks ---------------------------------------------------------------------------------
/** Default plain name of every template token (context-specific names are passed per entry). */
const ISIAN: Record<string, string> = {
  anandaPanggilan: 'Ananda [nama panggilan]',
  anandaLengkap: 'Ananda [nama lengkap]',
  nama: '[nama refleks]',
  sebelum: '[nilai awal]',
  sesudah: '[nilai sekarang]',
  kataArah: kataArah(set.skala.refleks),
  alasanTdo: '[alasan]',
  durasi: '[durasi]',
  jenisBantuan: '[jenis bantuan]',
  sisiLemah: '[sisi kaki yang lebih lemah]',
  'ototInti.durasi': '[durasi pada kegiatan Otot Inti]',
  'motorikKaki.sisiLemah': '[sisi kaki yang lebih lemah]',
  ringkasSebelum: '[frasa ringkas level awal]',
  inti: '[teks level sekarang]',
  besaran: '[besar perkembangan]',
  besaranSorotan: '[besar perkembangan]',
  daftar: '[daftar]',
  terbaik: '[nilai terbaik]',
  labelTerbaik: '[nama nilai terbaik]',
  kategori: '[kategori perkembangan]',
  kategoriSebelum: '[kategori awal]',
  kategoriSesudah: '[kategori sekarang]',
  labelSebelum: '[tingkat awal]',
  labelSesudah: '[tingkat sekarang]',
  label: '[nama tingkat berikutnya]',
  nilai: '[nilai berikutnya]',
  frasa: '[kemampuan]',
  jumlah: '[jumlah refleks yang membaik]',
  total: '[jumlah seluruh refleks]',
  namaBab: '[nama bab]',
  awal: '[persentase awal]',
  akhir: '[persentase sekarang]',
  bintangTerbaikSesudah: '[bintang tertinggi saat ini]',
  periode: '[periode, bulan dan tahun]',
  skorAwal: '[skor awal]',
  skorAkhir: '[skor sekarang]',
  selisih: '[selisih]',
  setelahSesi: String(data.laporan.evaluasiBerikutnya.setelahSesi),
};

/** Plain description of the conditional flags used in the bank. */
const FLAG: Record<string, string> = {
  bukanTerbaik: 'nilai sekarang belum mencapai nilai terbaik (Nilai 4)',
  terbaik: 'nilai sekarang sudah mencapai nilai terbaik (Nilai 4)',
  waterTrap: 'kalimat tambahan “Mampu melakukan water trap di kolam dalam” dipilih pada kegiatan Otot Inti',
};

const POLA_TOKEN = /\{([A-Za-z][\w.]*)\}/g;
const POLA_SEGMEN = /\[\[((?:(?!\[\[)[\s\S])*?)\]\]/;
const POLA_FLAG = /^#([\w.]+):/;

/** Template -> plain sentence + plain notes for its optional parts. Throws on an unnamed token or flag. */
function polos(templat: string, ganti: Record<string, string> = {}): { teks: string; catatan: string[] } {
  const peta = { ...ISIAN, ...ganti };
  const isian = (s: string) => s.replace(POLA_TOKEN, (_, t: string) => {
    const v = peta[t];
    if (v === undefined) throw new Error(`draf: isian "${t}" belum punya nama polos`);
    return v;
  });
  const catatan: string[] = [];
  let s = templat;
  for (let m = POLA_SEGMEN.exec(s); m; m = POLA_SEGMEN.exec(s)) {
    let isi = m[1]!;
    let syarat: string;
    const f = POLA_FLAG.exec(isi);
    if (f) {
      isi = isi.slice(f[0].length);
      const d = FLAG[f[1]!];
      if (!d) throw new Error(`draf: kondisi "${f[1]}" belum punya keterangan polos`);
      syarat = d;
    } else {
      const kosong = [...new Set([...isi.matchAll(POLA_TOKEN)].map((t) => isian(`{${t[1]}}`)))];
      syarat = `${gabungDaftar(kosong)} diisi`;
    }
    const tampil = isian(isi);
    const kutip = teksPolos(tampil).trim().replace(/^[,.;:]\s*/, '').replace(/^\((.*)\)$/, '$1');
    const hanyaIsian = !f && /^\[[^\]]+\]$/.test(kutip);
    catatan.push(hanyaIsian ? `isian ${kutip} boleh dikosongkan` : `bagian “${kutip}” hanya muncul bila ${syarat}`);
    s = s.slice(0, m.index) + tampil + s.slice(m.index + m[0].length);
  }
  return { teks: rapikanSpasi(isian(s)), catatan };
}

interface OpsiEntri {
  /** Context-specific names for blanks. */
  ganti?: Record<string, string>;
  /** Replaces the bank's own note (null = drop it). */
  catatan?: string | null;
  /** Filled-in example for the reference child. */
  contoh?: string;
}

/** One tagged bullet: "- [TAG] <kapan dipakai>: <plain sentence> _(Catatan: …)_". */
function entri(tb: TeksBank, kapan = '', o: OpsiEntri = {}): string {
  const p = polos(tb.teks, o.ganti);
  const catBank = o.catatan === undefined ? tb.catatan : o.catatan;
  const cat = [...p.catatan, ...(catBank ? [teksPolos(polos(catBank, o.ganti).teks)] : [])];
  const baris = [`- [${tb.sumber}] ${kapan ? `${kapan}: ` : ''}${p.teks}${cat.length ? ` _(Catatan: ${cat.join('; ')}.)_` : ''}`];
  if (o.contoh) baris.push(`  - Contoh untuk Ananda: ${o.contoh}`);
  return baris.join('\n');
}

/** Plain "kapan dipakai" labels for the reflex change classes. */
const KAPAN_KELAS: Record<KelasPerubahan, string> = {
  membaik1: 'Bila nilai naik 1 tingkat',
  membaik2: 'Bila nilai naik 2 tingkat',
  membaik3: 'Bila nilai naik 3 tingkat',
  tetapTerbaik: 'Bila nilai tetap di tingkat terbaik',
  tetapBelum: 'Bila nilai tetap dan belum di tingkat terbaik',
  memburuk: 'Bila nilai turun',
};
const BLOK: Record<string, string> = { manfaat: 'manfaat', saran: 'saran', penutup: 'penutup', bukti: 'bukti perkembangan' };

// 1 -------------------------------------------------------------------------------------------------------
tulis(
  '# Draf Bank Kalimat — HNC Evaluasi',
  '',
  'Dokumen tinjauan untuk pemilik dan fisioterapis. Isinya semua kalimat yang dapat dipakai aplikasi untuk menyusun laporan. Contoh angka memakai data evaluasi Ananda (semua skala 1–4: makin besar makin berkembang).',
  '',
  '## 1. Cara membaca dokumen ini',
  '',
  '- **[DOKUMEN]** = kalimat diambil apa adanya dari laporan evaluasi asli (hanya perbaikan pada bagian 2 yang diterapkan).',
  '- **[BARU]** = kalimat yang baru disusun untuk melengkapi bank kalimat; **perlu ditinjau secara klinis** sebelum dipakai.',
  '- Kata dalam kurung siku, misalnya [nilai awal] atau [nama panggilan], adalah isian yang diisi otomatis oleh aplikasi dari data anak.',
  '- Tulisan sebelum titik dua (misalnya "Bila nilai naik 1 tingkat:") menjelaskan kapan kalimat itu dipakai.',
  '- Keterangan miring "(Catatan: bagian … hanya muncul bila …)" menandai bagian kalimat yang hanya ditampilkan pada kondisi tertentu.',
  '- Teks **tebal** dan _miring_ mengikuti format laporan asli.',
  '',
);

// 2 -------------------------------------------------------------------------------------------------------
tulis('## 2. Daftar perubahan dari dokumen asli', '', 'Selain perubahan berikut, seluruh kalimat [DOKUMEN] sama persis dengan laporan asli. Huruf yang diperbaiki ditandai **tebal** pada kolom "Semula".', '',
  '| # | Jenis | Lokasi | Semula | Menjadi |', '|---|---|---|---|---|',
  ...oracle.perubahan.map((p, i) => `| ${i + 1} | ${p.jenis} | ${p.lokasi} | ${p.dari} | ${p.menjadi} |`), '');

// 3 -------------------------------------------------------------------------------------------------------
const kartuKegiatan = new Map(siap.kegiatan.kartu.map((k) => [k.id, k]));
tulis('## 3. Kegiatan Evaluasi (14 kegiatan)', '',
  'Setiap kegiatan memiliki 4 level (1 = paling awal, 4 = paling berkembang) dan status khusus "tidak dapat diobservasi". "Teks dasar" dipakai untuk evaluasi awal, dan juga untuk evaluasi lanjutan bila level tersebut tidak memiliki teks lanjutan khusus.', '',
  '**Kalimat standar bila kegiatan tidak dapat diobservasi:**', '',
  entri(bank.TEKS_TDO, '', { contoh: siap.kegiatan.calloutSebelum?.paragraf.markup }),
  `- [BARU] Kartu kegiatan menampilkan: "${bank.TEKS_TDO_KARTU_AWAL}" (label status: "${bank.STATUS.baruTeramati.label}").`, '',
  '**Pola umum evaluasi lanjutan** (dipakai bila level tidak memiliki teks lanjutan khusus):', '',
  entri(bank.VARIAN_UMUM.naik, 'Bila level naik', { catatan: '[teks level sekarang] = teks dasar level evaluasi lanjutan; [frasa ringkas level awal] = frasa ringkas level evaluasi awal' }),
  entri(bank.VARIAN_UMUM.sama, 'Bila level sama'),
  entri(bank.VARIAN_UMUM.turun, 'Bila level turun'),
  `- [BARU] Isian [besar perkembangan]: naik 1 level = "${bank.BESARAN.satu}", naik 2 level atau lebih = "${bank.BESARAN.lebih}".`, '',
  '**Kalimat tambahan umum** (dapat dipilih untuk semua kegiatan):', '',
  ...tambahanKegiatan(KEGIATAN[0]!.id).filter((t) => bank.TAMBAHAN_UMUM_TEKS[t.id]).map((t) => entri(bank.TAMBAHAN_UMUM_TEKS[t.id]!, `Bila dipilih “${t.label}”`)), '');
for (const d of KEGIATAN) {
  const b = data.sebelum.kegiatan[d.id];
  const a = data.sesudah.kegiatan[d.id];
  const kb = bank.BANK_KEGIATAN[d.id];
  const kartu = kartuKegiatan.get(d.id);
  const ganti = Object.fromEntries(d.slot.map((s) => [s.id, `[${s.label.toLowerCase()}]`]));
  tulis(`### ${d.no}. ${d.nama}`, '', `Level untuk Ananda (disimpulkan dari narasi asli): evaluasi awal **${nilaiTeks(b.level)}**, evaluasi lanjutan **${nilaiTeks(a.level)}**.`, '');
  for (const v of LEVELS) {
    const lv = kb.level[v];
    tulis(`**Level ${v} — ${lv.label}** [BARU: label]; frasa ringkas: "${lv.ringkas}" [${lv.ringkasDokumen ? 'DOKUMEN' : 'BARU'}]`, '');
    tulis(entri(lv.sebelum, 'Teks dasar', { ganti }));
    if (lv.sesudah) tulis(entri(lv.sesudah, 'Evaluasi lanjutan', { ganti }));
    if (lv.sesudahNaik) tulis(entri(lv.sesudahNaik, 'Evaluasi lanjutan bila level naik', { ganti, catatan: lv.sesudahNaik.catatan ? '[besar perkembangan]: naik 1 level = "yang positif", naik 2 level atau lebih = "yang sangat signifikan"' : undefined }));
    if (lv.sesudahSama) tulis(entri(lv.sesudahSama, 'Evaluasi lanjutan bila level sama', { ganti }));
    if (lv.sesudahTurun) tulis(entri(lv.sesudahTurun, 'Evaluasi lanjutan bila level turun', { ganti }));
    if (lv.sesudahTanpaSebelum) tulis(entri(lv.sesudahTanpaSebelum, 'Evaluasi lanjutan bila evaluasi awal tidak teramati', { ganti }));
    tulis('');
  }
  if (d.slot.length) tulis(`Isian: ${d.slot.map((s) => `[${s.label.toLowerCase()}]${s.contoh ? ` (contoh: "${s.contoh}")` : ''}${s.pilihan ? ` — pilihan: ${s.pilihan.join(', ')}` : ''}`).join('; ')}.`, '');
  const khusus = tambahanKegiatan(d.id).filter((t) => kb.tambahan[t.id]);
  if (khusus.length) tulis('Kalimat tambahan:', '', ...khusus.map((t) => entri(kb.tambahan[t.id]!, `Bila dipilih “${t.label}”`)), '');
  const lvA = a.level === 'tdo' ? undefined : kb.level[a.level];
  const templatA = lvA ? [lvA.sebelum, lvA.sesudah, lvA.sesudahNaik, lvA.sesudahSama, lvA.sesudahTurun, lvA.sesudahTanpaSebelum] : [];
  const pakaiIsian = templatA.some((tb) => tb && /\{|\[\[/.test(tb.teks)) || (a.tambahan?.length ?? 0) > 0;
  if (kartu && pakaiIsian) tulis(`Contoh untuk Ananda (evaluasi lanjutan): ${kartu.sesudah.paragraf.markup}`, '');
}

// 4 -------------------------------------------------------------------------------------------------------
const legenda = (id: SkalaId) => urutanLegenda(set.skala[id]).map((v) => {
  const lv = set.skala[id].level[v];
  const awal = `**${labelLegenda(set.skala[id], v)}** ${id === 'program' || id === 'kegiatan' ? `${lv.label} – ` : ''}`;
  return entri({ ...lv.legenda!, teks: awal + lv.legenda!.teks });
});
tulis('## 4. Sistem Sensorik', '', 'Legenda (Bintang 4 = paling berkembang; teks dari dokumen asli dengan urutan dibalik):', '', ...legenda('sensori'), '',
  `Kategori dalam kalimat: ${urutanLegenda(set.skala.sensori).map((v) => `Bintang ${v} = "${set.skala.sensori.level[v].kategori}"`).join('; ')} [DOKUMEN].`, '',
  `**${bank.JUDUL_APA_ARTINYA}**`, '');
for (const s of SENSORI) {
  tulis(`*${s.nama}* — Ananda: Bintang ${nilaiTeks(data.sebelum.sensori[s.id])} → Bintang ${nilaiTeks(data.sesudah.sensori[s.id])}`, '');
  for (const v of [4, 3, 2, 1] as Level[]) tulis(entri(bank.APA_ARTINYA[s.id][v], `Bila Bintang ${v}`));
  tulis('');
}

// 5 -------------------------------------------------------------------------------------------------------
const [ringkasP1, ringkasP2] = siap.refleks.ringkasan;
tulis('## 5. Sistem Saraf Pusat (refleks primitif)', '', 'Legenda (Nilai 4 = paling berkembang):', '', ...legenda('refleks'), '',
  '**Summary** (disusun otomatis dari angka):', '',
  entri(bank.RINGKASAN_REFLEKS.tetapTerbaik, 'Untuk refleks yang sejak awal sudah di tingkat terbaik', {
    ganti: { daftar: '[daftar refleks]', terbaik: '[nilai terbaik]', labelTerbaik: '[nama nilai terbaik]' },
    catatan: 'pada Ananda: "4 (Kontrol Baik)"', contoh: ringkasP1?.markup }),
  entri(bank.RINGKASAN_REFLEKS.membaik, 'Untuk refleks yang membaik', {
    ganti: { daftar: '[daftar refleks beserta nilainya]' },
    catatan: 'daftar disusun "a, b, …, dan y, serta z"; bila hanya dua refleks: "a dan b"', contoh: ringkasP2?.markup }),
  entri(bank.RINGKASAN_REFLEKS.item, 'Bentuk setiap butir dalam daftar'),
  entri(bank.RINGKASAN_REFLEKS.tetapBelum, 'Bila nilai tetap dan belum di tingkat terbaik'),
  entri(bank.RINGKASAN_REFLEKS.memburuk, 'Bila nilai turun'), '',
  '**Gambaran Perkembangan** — kalimat pengantar:', '', entri(bank.PENGANTAR_GAMBARAN), '',
  'Kalimat pembuka umum (dipakai bila refleks tidak memiliki pembuka khusus):', '',
  ...(Object.entries(bank.PEMBUKA_UMUM) as [KelasPerubahan, TeksBank][]).map(([k, tb]) => entri(tb, KAPAN_KELAS[k], {
    catatan: k === 'tetapTerbaik' ? 'secara bawaan tidak dibuat paragraf; refleks ini cukup disebut dalam Summary' : undefined })), '',
  entri(bank.AWALAN_FRASA, 'Bukti pengganti, bila tidak semua syarat kutipan bukti dokumen terpenuhi', { ganti: { daftar: '[frasa bukti yang terpenuhi]' }, catatan: null }),
  entri(bank.PENUTUP_UMUM, 'Penutup umum'),
  entri(bank.PENUTUP_TERBAIK, 'Penutup bila nilai sekarang sudah di tingkat terbaik', { catatan: 'bagian manfaat dilewati' }), '');
for (const r of REFLEKS) {
  const rb = bank.BANK_REFLEKS[r.id];
  const b = data.sebelum.refleks[r.id] as Level;
  const a = data.sesudah.refleks[r.id] as Level;
  tulis(`### ${r.no}. ${namaPolos(r.namaTabel)}`, '', `Ananda: nilai ${nilaiTeks(b)} → ${nilaiTeks(a)}.`, '');
  // Group identical openings (e.g. Moro uses one text for every 'naik' class).
  const grup = new Map<TeksBank, KelasPerubahan[]>();
  for (const [k, tb] of Object.entries(rb.pembuka ?? {}) as [KelasPerubahan, TeksBank][]) grup.set(tb, [...(grup.get(tb) ?? []), k]);
  for (const [tb, kelas] of grup) {
    const naik = kelas.filter((k) => k.startsWith('membaik')).map((k) => k.slice(-1));
    const kapan = kelas.length > 1 && naik.length === kelas.length ? 'Pembuka khusus, bila nilai naik' : `Pembuka khusus, ${KAPAN_KELAS[kelas[0]!].toLowerCase()}`;
    const contoh = rapikanSpasi(teksPolos(isiTemplat(`draf.${r.id}`, tb.teks, {
      token: { nama: r.namaKalimat, anandaPanggilan: siap.anak.sapaan, sebelum: b, sesudah: a, kataArah: kataArah(set.skala.refleks), 'ototInti.durasi': data.sesudah.kegiatan.ototInti.slot?.durasi },
      flag: { bukanTerbaik: !adalahTerbaik(set.skala.refleks, a), terbaik: adalahTerbaik(set.skala.refleks, a) },
    })));
    tulis(entri(tb, kapan, { catatan: tb.catatan ? (r.id === 'tlr' ? 'nama anak lain pada dokumen asli diganti nama panggilan Ananda' : tb.catatan) : undefined, contoh: rb.pembuka && a > b ? contoh : undefined }));
  }
  if (rb.keterangan) tulis(entri(rb.keterangan, 'Keterangan, bila nilai naik'));
  if (rb.bukti) tulis(entri(rb.bukti.teks, 'Bukti perkembangan (kutipan dokumen)'), `  - Dipakai bila: ${rb.bukti.syarat.map(jelaskanSyarat).join('; ')}.`);
  for (const f of rb.frasa) tulis(entri(f.teks, 'Frasa bukti pengganti'), `  - Dipakai bila: ${f.syarat.map(jelaskanSyarat).join('; ')}.`);
  if (rb.manfaat) tulis(entri(rb.manfaat, 'Manfaat'));
  if (rb.saran) tulis(entri(rb.saran, 'Saran'));
  if (rb.penutup) tulis(entri(rb.penutup, 'Penutup'));
  const n = data.narasi?.refleks?.[r.id];
  if (n?.catatan) tulis(`- [DOKUMEN] Catatan terapis khusus Ananda (isian bebas): ${polos(n.catatan).teks}`);
  if (n?.sembunyikan?.length) tulis(`- Bagian yang tidak ditampilkan untuk Ananda: ${n.sembunyikan.map((x) => BLOK[x] ?? x).join(', ')}.`);
  tulis('');
}

// 6 -------------------------------------------------------------------------------------------------------
tulis('## 6. Program Hidroterapi', '', 'Skala penilaian:', '', ...legenda('program'), '',
  `- [DOKUMEN] "–" ditampilkan sebagai "${bank.STATUS.belumDiberikan.label}" dan tidak dihitung dalam skor.`,
  `- [BARU] Lencana "${bank.LABEL_PROGRAM_INDIVIDUAL}" untuk gerakan khusus yang dirancang bersama fisioterapis.`,
  `- Bab: ${BAB_PROGRAM.map((b) => `${b.bab}. ${b.nama}${b.namaInggris !== b.nama ? ` (${b.namaInggris})` : ''}`).join('; ')} — nama aktivitas, target refleks dan manfaat sama persis dengan dokumen asli [DOKUMEN].`, '');

// 7 -------------------------------------------------------------------------------------------------------
const A = bank.AMBANG_KATEGORI;
const { kesimpulan } = siap;
tulis('## 7. Kesimpulan, rekomendasi dan target', '', '**Pembuka**', '',
  entri(bank.KESIMPULAN.p1, 'Bila skor keseluruhan naik', {
    catatan: `[kategori perkembangan]: naik ${A.signifikan} poin atau lebih = "${bank.FRASA_KATEGORI.signifikan}"; ${A.berarti}–${A.signifikan - 1} poin = "${bank.FRASA_KATEGORI.berarti}"; ${A.bertahap}–${A.berarti - 1} poin = "${bank.FRASA_KATEGORI.bertahap}"`,
    contoh: kesimpulan.p1.markup }),
  entri(bank.KESIMPULAN.p1Stabil, 'Bila skor keseluruhan tidak naik', { catatan: null }),
  entri(bank.KESIMPULAN.p2, `Kalimat kedua, bila skor naik ${A.berarti} poin atau lebih`, { catatan: null, contoh: kesimpulan.p2.markup }),
  entri(bank.KESIMPULAN.p2Bertahap, `Kalimat kedua, bila skor naik ${A.bertahap}–${A.berarti - 1} poin`),
  entri(bank.KESIMPULAN.p2Stabil, 'Kalimat kedua, bila skor tidak naik'),
  entri(bank.KESIMPULAN.p3, 'Pengantar rekomendasi'), '',
  '**Kalimat kondisi awal** (dapat dipilih):', '', ...bank.KONDISI_AWAL.map((k) => entri(k.teks, `Bila dipilih “${k.label}”`)), '',
  '**Kandidat sorotan** (otomatis: urut dari peningkatan terbesar pada butir yang dinilai di kedua evaluasi; dapat dipilih manual):', '',
  entri(bank.SOROTAN_KEGIATAN_UMUM.kalimat, 'Kegiatan yang meningkat — kalimat kesimpulan'),
  entri(bank.SOROTAN_KEGIATAN_UMUM.kalimatBaruTeramati, 'Kegiatan yang baru teramati — kalimat kesimpulan'),
  entri(bank.SOROTAN_KEGIATAN_UMUM.ringkas, 'Kegiatan yang meningkat — kalimat ringkas (halaman Ringkasan)'),
  entri(bank.SOROTAN_KEGIATAN_UMUM.ringkasBaruTeramati, 'Kegiatan yang baru teramati — kalimat ringkas (halaman Ringkasan)'));
for (const d of KEGIATAN) {
  const s = bank.SOROTAN_KEGIATAN[d.id];
  const nm = namaPolos(d.nama);
  tulis(entri(s.judulSingkat, `Judul singkat ${nm}`));
  if (s.kalimat) tulis(entri(s.kalimat.teks, `Kalimat khusus ${nm}${s.kalimat.levelSesudah ? ` (bila level lanjutan ${s.kalimat.levelSesudah})` : ''}`, {
    catatan: s.kalimat.teks.catatan ? '[besar perkembangan]: naik 2 level atau lebih = "yang sangat signifikan", naik 1 level = "yang positif"' : undefined }));
  if (s.ringkas) tulis(entri(s.ringkas.teks, `Ringkas khusus ${nm}${s.ringkas.levelSesudah ? ` (bila level lanjutan ${s.ringkas.levelSesudah})` : ''}`));
}
for (const [nama, t, ganti] of [
  ['Sensorik, bila ketiga sistem berubah sama', bank.SOROTAN_SENSORI.seragam, { sebelum: '[bintang awal]', sesudah: '[bintang sekarang]' }],
  ['Sensorik, bila perubahan ketiga sistem berbeda', bank.SOROTAN_SENSORI.campuran, { daftar: '[sistem yang membaik]' }],
  ['Refleks', bank.SOROTAN_REFLEKS, {}],
  ['Program per bab', bank.SOROTAN_PROGRAM, {}],
] as const) {
  tulis(entri(t.kalimat, `${nama} — kalimat kesimpulan`, { ganti }), entri(t.judulSingkat, `${nama} — judul singkat`, { ganti }), entri(t.ringkas, `${nama} — kalimat ringkas`, { ganti }));
}
const konteks = buatKonteks(data, set);
const otomatis = peringkatSorotan(konteks).slice(0, 3).map((s) => `“${namaPolos(s.judulSingkat.markup)}”`);
const dipilih = (data.narasi?.sorotan ?? []).map((id) => buatSorotan(konteks, id)).filter((x) => !!x).map((x) => `“${namaPolos(x!.judulSingkat.markup)}”`);
tulis('', `Sorotan untuk Ananda (pilihan pemilik, sesuai dokumen asli): ${dipilih.join(', ')}. Bila dipilih otomatis, aplikasi akan memilih: ${otomatis.join(', ')}.`, '',
  '**Rekomendasi** (otomatis: semua yang syaratnya terpenuhi, urut prioritas, maksimal 5):', '');
for (const r of bank.REKOMENDASI) {
  tulis(entri({ ...r.teks, teks: `**${r.judul}:** ${r.teks.teks}` }, `Prioritas ${r.prioritas}`, { catatan: null }),
    `  - Muncul bila: ${jelaskanSyarat(r.syarat)}.`, `  ${entri(r.ringkas, 'Kalimat ringkas (halaman Ringkasan)')}`);
}
tulis('', `Contoh untuk Ananda: ${kesimpulan.rekomendasi.map((p, i) => `${i + 1}. ${p.markup}`).join(' ')}`, '');
const T = bank.TARGET;
tulis('', `**Aturan target ${data.laporan.evaluasiBerikutnya.setelahSesi} sesi berikutnya**`, '',
  entri(T.judul, 'Judul tabel'),
  entri(T.programNaik, 'Aktivitas program yang sudah diberikan dan belum Mandiri', { catatan: null }),
  entri(T.programBaru, 'Aktivitas program yang belum diberikan', { catatan: null }),
  entri(T.kegiatan, 'Kegiatan dengan level 2 atau lebih rendah pada evaluasi lanjutan', { catatan: null }),
  entri(T.refleks, 'Refleks dengan nilai 2 atau lebih rendah pada evaluasi lanjutan', { catatan: null }),
  entri(T.sensori, 'Sistem sensorik yang belum mencapai Bintang 4', { catatan: null }),
  entri(T.evaluasiBerikutnya, 'Kotak evaluasi berikutnya'), '');

// 8 -------------------------------------------------------------------------------------------------------
const R = bank.RINGKAS_ORTU;
tulis('## 8. Halaman Ringkasan untuk Orang Tua', '',
  entri(R.pembuka, 'Kalimat pembuka, bila skor naik'),
  entri(R.pembukaStabil, 'Kalimat pembuka, bila skor tidak naik'),
  entri(R.skorNaik, 'Bila skor naik'),
  entri(R.skorTetap, 'Bila skor tidak naik'),
  entri(R.domainTeratas, 'Aspek dengan kemajuan terbesar', { ganti: { daftar: '[aspek dengan kemajuan terbesar]' } }),
  entri(R.penutup, 'Penutup', { ganti: { daftar: '[dua rekomendasi utama]' } }),
  entri(R.catatanSkor, 'Catatan kecil di bawah skor'), '',
  '_Pembaruan: kalimat pembuka kini hanya menyebut periode, yaitu bulan dan tahun bergabung sampai bulan dan tahun evaluasi, tanpa jumlah sesi; laporan tidak lagi mencetak jumlah sesi._', '',
  `Hasil untuk Ananda: ${siap.ringkasan.paragraf.markup}`, '');

// 9 -------------------------------------------------------------------------------------------------------
tulis('## 9. Glosarium', '', ...bank.GLOSARIUM.map((g) => entri({ ...g.definisi, teks: `**${g.istilah}** — ${g.definisi.teks}` })), '');

// 10 ------------------------------------------------------------------------------------------------------
// Only the texts used when every scale is 'makin besar makin berkembang' are listed (the mixed-direction
// alternatives are never printed under the owner's decision).
const C = bank.CARA_MEMBACA;
const WARNA_ZONA: Record<string, string> = { z4: 'teal tua', z3: 'biru muda', z2: 'kuning lembut', z1: 'oranye lembut' };
tulis('## 10. Cara Membaca Laporan dan label status', '',
  entri(C.aturanSatu, 'Aturan utama (spanduk)'),
  entri(C.penjelasanSatu, 'Penjelasan aturan'),
  entri(C.arahNaik, 'Arah setiap skala'),
  entri(C.dikecualikan, 'Nilai yang tidak dihitung'),
  entri(C.warna, 'Warna'),
  entri(C.skor, 'Penjelasan Skor Perkembangan'),
  ...Object.values(bank.KETERANGAN_SKALA).map((v) => entri(v.tampilan, v.judul)),
  ...(['z4', 'z3', 'z2', 'z1'] as const).map((z) => `- [BARU] Warna tingkat ${z.slice(1)} (${WARNA_ZONA[z]}): "${bank.LABEL_ZONA[z]}"`),
  '', '**Label status:**', '',
  ...Object.values(bank.STATUS).map((s) => entri(s.keterangan, `"${s.label}"`)),
  `- [BARU] Nama level kegiatan pada pilihan aplikasi: ${urutanLegenda(set.skala.kegiatan).map((v) => `Level ${v} "${set.skala.kegiatan.level[v].label}"`).join(', ')}.`,
  ...legenda('kegiatan'), '');

// 11 ------------------------------------------------------------------------------------------------------
const f = (x: number | null) => (x === null ? '–' : String(x));
tulis('## 11. Metode skor (bahasa sederhana)', '',
  '- Setiap nilai 1–4 diubah ke angka 0–100: nilai 1 = 0, nilai 2 = 33, nilai 3 = 67, nilai 4 = 100 (semua skala: makin besar makin berkembang).',
  '- "Tidak dapat diobservasi" dan "Belum diberikan" **tidak dihitung** dan tidak diisi dengan perkiraan.',
  '- Skor tiap aspek = rata-rata butir yang benar-benar teramati pada evaluasi tersebut. Cakupan (berapa butir teramati) dicatat; bila cakupan evaluasi awal lebih sedikit, label aspek diberi tanda * dan catatan kaki.',
  '- Skor Perkembangan = rata-rata semua aspek yang memiliki nilai. Angka ditampilkan dibulatkan; selisih = angka akhir bulat − angka awal bulat, sehingga angka yang tercetak selalu cocok.',
  '- Persentase bab Program = rata-rata aktivitas yang sudah diberikan, disertai keterangan "n dari N aktivitas sudah diberikan". Posisi saat ini = bab pertama yang belum tuntas (tuntas = semua aktivitas diberikan dan semuanya minimal nilai 3).',
  '', '**Pengelompokan aspek:**', '',
  ...DOMAIN.map((d) => `- ${d.nama}: ${d.kegiatan ? d.kegiatan.map((id) => namaPolos(kegiatanDef(id).nama)).join(', ') : d.area === 'sensori' ? '3 sistem sensorik' : d.area === 'refleks' ? '10 refleks primitif' : 'semua aktivitas Program yang diberikan (termasuk Program Individual)'}`),
  '', '**Angka Ananda:**', '', '| Aspek | Awal | Lanjutan | Selisih | Cakupan awal |', '|---|---|---|---|---|',
  ...skor.domain.map((d) => `| ${d.nama}${d.bertanda ? ' *' : ''} | ${f(d.awalBulat)} | ${f(d.akhirBulat)} | ${d.selisih === null ? '–' : (d.selisih > 0 ? '+' : '') + d.selisih} | ${d.cakupanAwal.teramati}/${d.cakupanAwal.total} |`),
  `| **Skor Perkembangan** | **${f(skor.keseluruhan.awalBulat)}** | **${f(skor.keseluruhan.akhirBulat)}** | **+${f(skor.keseluruhan.selisih)}** | |`,
  '', ...skor.bab.map((b) => `- Bab ${b.bab} ${b.nama}: ${f(b.awalBulat)}% → ${f(b.akhirBulat)}% (${b.teksDiberikan}).`),
  `- Posisi saat ini: ${skor.posisiSaatIni.nama}.`, '');

// 12 ------------------------------------------------------------------------------------------------------
tulis('## 12. Hal yang perlu Anda konfirmasi', '',
  '1. **Teks legenda yang ditulis ulang** — persentase pada legenda Sistem Saraf Pusat (Kontrol Cukup sekitar 30%, Kontrol Minimal sekitar 70%) dan pemetaan bintang sensorik yang dibalik (Bintang 4 = sudah terintegrasi dengan baik … Bintang 1 = belum terintegrasi).',
  '2. **Nilai sensorik evaluasi awal yang disimpulkan** — Bintang 2 untuk ketiga sistem disimpulkan dari teks kesimpulan dokumen asli, karena tabel evaluasi awal tidak tersedia.',
  '3. **Semua teks [BARU]** — teks level kegiatan, label, glosarium, "Apa artinya untuk Ananda?", target, rekomendasi tambahan, kalimat halaman Ringkasan, dan Cara Membaca.',
  '4. **Pengelompokan aspek dan metode skor** — delapan aspek dan cara perhitungan pada bagian 11.',
  '5. **Perbaikan kalimat pembuka Moro** — kata "Moro" disisipkan: "Pada refleks Moro, Ananda mulai berkembang …".',
  '6. **Pemetaan level kegiatan untuk Ananda** — level 1–4 tiap kegiatan disimpulkan dari narasi asli (lihat bagian 3).',
  `7. **Pilihan pencapaian yang disorot** — tiga sorotan Kesimpulan mengikuti dokumen asli (otot inti, sistem sensorik, mengikuti instruksi); bila otomatis, aplikasi akan memilih ${otomatis.join(', ')}.`,
  `8. **Label "${bank.STATUS.baruTeramati.label}"** — untuk kegiatan yang belum dapat diobservasi pada evaluasi awal dan kini sudah dapat dinilai.`,
  '');

const teks = out.join('\n');
const terlarang = oracle.terlarang.filter((t) => teks.includes(t));
if (terlarang.length) {
  console.error(`draf: ${terlarang.length} pola terlarang ditemukan dalam draf — tidak ditulis.`);
  process.exit(1);
}
// Brief §13 readability guard: no template syntax, flags, code spans or internal keys may reach the owner.
const SINTAKS = [/\{[A-Za-z][\w.]*\}/, /\[\[/, /\]\]/, /#\w+:/, /`/, /\b(membaik[123]|tetapTerbaik|tetapBelum|memburuk|sesudahNaik|sesudahSama|bukanTerbaik)\b/];
const sisa = SINTAKS.filter((p) => p.test(teks)).map(String);
if (sisa.length) {
  console.error(`draf: sintaks kode tersisa (${sisa.join(', ')}) — tidak ditulis.`);
  process.exit(1);
}
mkdirSync(dirname(BERKAS_DRAF), { recursive: true });
writeFileSync(BERKAS_DRAF, teks);
const jumlahTag = (teks.match(/\[(DOKUMEN|BARU)\]/g) ?? []).length;
console.log(`draf: ${BERKAS_DRAF} (${out.length} baris, ${jumlahTag} kalimat bertag)`);
