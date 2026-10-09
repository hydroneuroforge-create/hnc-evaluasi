// Kesimpulan, recommendations, targets and the Ringkasan page texts (PLAN.md §6.3).
import { BANK_KEGIATAN } from '../bank/kegiatan.ts';
import { FRASA_KATEGORI, KESIMPULAN, KONDISI_AWAL, kategoriDari, type KategoriPerkembangan } from '../bank/kesimpulan.ts';
import { MAKS_REKOMENDASI_BAWAAN, REKOMENDASI, rekomendasiDef, type Rekomendasi } from '../bank/rekomendasi.ts';
import { RINGKAS_ORTU } from '../bank/ringkas-ortu.ts';
import { JUDUL_KELOMPOK_TARGET, TARGET } from '../bank/target.ts';
import { STATUS } from '../bank/cara-membaca.ts';
import { KEGIATAN } from '../master/kegiatan.ts';
import { BAB_PROGRAM, namaItemProgram } from '../master/program.ts';
import { REFLEKS } from '../master/refleks.ts';
import { SENSORI } from '../master/sensori.ts';
import { labelLevel, nilaiBerikutnya, peringkat } from '../skala.ts';
import { cekSyarat } from '../syarat.ts';
import { buatParagraf, gabungDaftar, gabungKalimat } from '../teks.ts';
import { formatPeriodeBulan, periodeBulan } from '../tanggal.ts';
import type { Level, Paragraf } from '../types.ts';
import { isi, keParagraf, type Konteks } from './konteks.ts';
import type { Sorotan } from './sorotan.ts';

const ada = (v: unknown): v is Level => typeof v === 'number';

// --- recommendations -------------------------------------------------------------------------------------
export interface RekomendasiSiap { id: string; judul: string; paragraf: Paragraf; ringkas: Paragraf; sumber: 'DOKUMEN' | 'BARU' }

export function pilihRekomendasi(k: Konteks): RekomendasiSiap[] {
  const maks = k.input.opsi?.maksRekomendasi ?? MAKS_REKOMENDASI_BAWAAN;
  const nonaktif = new Set(k.input.narasi?.rekomendasiNonaktif ?? []);
  const eksplisit = k.input.narasi?.rekomendasi;
  let daftar: Rekomendasi[];
  if (eksplisit?.length) {
    daftar = eksplisit.map((id) => {
      const r = rekomendasiDef(id);
      if (!r) throw new Error(`rekomendasi tidak dikenal: "${id}"`);
      return r;
    });
  } else {
    daftar = REKOMENDASI.filter((r) => cekSyarat(r.syarat, k.syarat)).sort((a, b) => a.prioritas - b.prioritas);
  }
  daftar = daftar.filter((r) => !nonaktif.has(r.id)).slice(0, maks);

  const s = k.set.skala.sensori;
  const nilaiSensori = SENSORI.map((x) => k.input.sesudah.sensori[x.id]).filter(ada);
  const bintangTerbaikSesudah = nilaiSensori.length ? nilaiSensori.reduce((m, v) => (peringkat(s, v) > peringkat(s, m) ? v : m)) : undefined;
  return daftar.map((r) => {
    const t = isi(k, `rekomendasi.${r.id}`, r.teks, { bintangTerbaikSesudah });
    return {
      id: r.id, judul: r.judul, sumber: r.sumber,
      paragraf: buatParagraf(`rekomendasi.${r.id}`, gabungKalimat([`**${r.judul}:** ${t.markup}`]), t.sumber),
      ringkas: buatParagraf(`rekomendasi.${r.id}.ringkas`, isi(k, `rekomendasi.${r.id}.ringkas`, r.ringkas).markup, r.ringkas.sumber),
    };
  });
}

// --- Kesimpulan --------------------------------------------------------------------------------------------
export interface KesimpulanSiap {
  kategori: KategoriPerkembangan;
  p1: Paragraf;
  p2: Paragraf;
  sorotan: Paragraf[];
  p3: Paragraf;
  rekomendasi: Paragraf[];
}

export function buatKesimpulan(k: Konteks, sorotan: Sorotan[], rekomendasi: RekomendasiSiap[]): KesimpulanSiap {
  const kategori = kategoriDari(k.skor.keseluruhan.selisih);
  const pembuka = kategori === 'stabil'
    ? isi(k, 'kesimpulan.p1', KESIMPULAN.p1Stabil)
    : isi(k, 'kesimpulan.p1', KESIMPULAN.p1, { kategori: FRASA_KATEGORI[kategori] });
  const kondisi = (k.input.narasi?.kondisiAwal ?? []).map((id) => {
    const kd = KONDISI_AWAL.find((x) => x.id === id);
    if (!kd) throw new Error(`kondisi awal tidak dikenal: "${id}"`);
    return isi(k, `kesimpulan.kondisiAwal.${id}`, kd.teks);
  });
  const p2 = kategori === 'stabil' ? KESIMPULAN.p2Stabil : kategori === 'bertahap' ? KESIMPULAN.p2Bertahap : KESIMPULAN.p2;
  return {
    kategori,
    p1: keParagraf('kesimpulan.p1', [pembuka, ...kondisi], gabungKalimat),
    p2: keParagraf('kesimpulan.p2', [isi(k, 'kesimpulan.p2', p2)], gabungKalimat),
    sorotan: sorotan.map((s) => s.kalimat),
    p3: keParagraf('kesimpulan.p3', [isi(k, 'kesimpulan.p3', KESIMPULAN.p3)], gabungKalimat),
    rekomendasi: rekomendasi.map((r) => r.paragraf),
  };
}

// --- targets -----------------------------------------------------------------------------------------------
export interface BarisTarget { id: string; item: string; saatIni: string; target: string }
export interface KelompokTarget { id: string; judul: string; baris: BarisTarget[] }
export interface TargetSiap { judul: string; kelompok: KelompokTarget[]; evaluasiBerikutnya: Paragraf }

export function buatTarget(k: Konteks): TargetSiap {
  const { kegiatan: sk, sensori: ss, refleks: sr, program: sp } = k.set.skala;
  const A = k.input.sesudah;
  const kelompok: KelompokTarget[] = [];
  const isiT = (id: string, tb: typeof TARGET.kegiatan, token: Record<string, string | number>) => isi(k, `target.${id}`, tb, token).markup;

  const kg: BarisTarget[] = [];
  for (const d of KEGIATAN) {
    const v = A.kegiatan[d.id]?.level;
    if (!ada(v) || peringkat(sk, v) > 2) continue;
    const n = nilaiBerikutnya(sk, v);
    if (!n) continue;
    const L = BANK_KEGIATAN[d.id].level;
    kg.push({ id: d.id, item: d.nama, saatIni: `${L[v].label} (${v})`, target: isiT(d.id, TARGET.kegiatan, { label: L[n].label, nilai: n }) });
  }
  if (kg.length) kelompok.push({ id: 'kegiatan', judul: JUDUL_KELOMPOK_TARGET.kegiatan, baris: kg });

  const sn: BarisTarget[] = [];
  for (const d of SENSORI) {
    const v = A.sensori[d.id];
    if (!ada(v)) continue;
    const n = nilaiBerikutnya(ss, v);
    if (!n) continue;
    sn.push({ id: d.id, item: d.nama, saatIni: `Bintang ${v}`, target: isiT(d.id, TARGET.sensori, { label: `Bintang ${n}`, nilai: n }) });
  }
  if (sn.length) kelompok.push({ id: 'sensori', judul: JUDUL_KELOMPOK_TARGET.sensori, baris: sn });

  const rf: BarisTarget[] = [];
  for (const d of REFLEKS) {
    const v = A.refleks[d.id];
    if (!ada(v) || peringkat(sr, v) > 2) continue;
    const n = nilaiBerikutnya(sr, v);
    if (!n) continue;
    rf.push({ id: d.id, item: d.namaTabel, saatIni: `${labelLevel(sr, v)} (Nilai ${v})`, target: isiT(d.id, TARGET.refleks, { label: labelLevel(sr, n), nilai: n }) });
  }
  if (rf.length) kelompok.push({ id: 'refleks', judul: JUDUL_KELOMPOK_TARGET.refleks, baris: rf });

  for (const b of BAB_PROGRAM) {
    const baris: BarisTarget[] = [];
    for (const it of k.itemProgram.filter((x) => x.bab === b.bab)) {
      const v = A.program[it.id];
      if (!ada(v)) {
        baris.push({ id: it.id, item: namaItemProgram(it), saatIni: STATUS.belumDiberikan.label, target: isiT(it.id, TARGET.programBaru, {}) });
        continue;
      }
      const n = nilaiBerikutnya(sp, v);
      if (!n) continue;
      baris.push({ id: it.id, item: namaItemProgram(it), saatIni: `${labelLevel(sp, v)} (${v})`, target: isiT(it.id, TARGET.programNaik, { label: labelLevel(sp, n), nilai: n }) });
    }
    if (baris.length) kelompok.push({ id: `program:b${b.bab}`, judul: JUDUL_KELOMPOK_TARGET.program(b.nama), baris });
  }

  const setelahSesi = k.input.laporan.evaluasiBerikutnya.setelahSesi;
  return {
    judul: isi(k, 'target.judul', TARGET.judul, { setelahSesi }).markup,
    kelompok,
    evaluasiBerikutnya: keParagraf('target.evaluasiBerikutnya', [isi(k, 'target.evaluasiBerikutnya', TARGET.evaluasiBerikutnya, { setelahSesi })], gabungKalimat),
  };
}

// --- Ringkasan untuk Orang Tua -------------------------------------------------------------------------------
export interface RingkasanOrtuSiap {
  paragraf: Paragraf;
  pencapaian: { id: string; judul: Paragraf; ringkas: Paragraf }[];
  fokus: { id: string; judul: string; ringkas: Paragraf }[];
  catatanSkor: string;
}

export function buatRingkasanOrtu(k: Konteks, sorotan: Sorotan[], rekomendasi: RekomendasiSiap[]): RingkasanOrtuSiap {
  const kategori = kategoriDari(k.skor.keseluruhan.selisih);
  const ks = k.skor.keseluruhan;
  const token = {
    periode: formatPeriodeBulan(periodeBulan(k.input).awal, periodeBulan(k.input).akhir),
    skorAwal: ks.awalBulat, skorAkhir: ks.akhirBulat, selisih: ks.selisih,
  };
  const bagian = [
    kategori === 'stabil'
      ? isi(k, 'ringkasOrtu.pembuka', RINGKAS_ORTU.pembukaStabil, token)
      : isi(k, 'ringkasOrtu.pembuka', RINGKAS_ORTU.pembuka, { ...token, kategori: FRASA_KATEGORI[kategori] }),
  ];
  if (ks.awalBulat !== null && ks.akhirBulat !== null) {
    bagian.push(isi(k, 'ringkasOrtu.skor', (ks.selisih ?? 0) > 0 ? RINGKAS_ORTU.skorNaik : RINGKAS_ORTU.skorTetap, token));
  }
  const naik = k.skor.domain.filter((d) => d.selisih !== null && d.selisih > 0);
  if (naik.length) {
    const maks = Math.max(...naik.map((d) => d.selisih!));
    const teratas = naik.filter((d) => d.selisih === maks).slice(0, 2).map((d) => d.nama);
    bagian.push(isi(k, 'ringkasOrtu.domainTeratas', RINGKAS_ORTU.domainTeratas, { daftar: gabungDaftar(teratas) }));
  }
  const fokus = rekomendasi.slice(0, 2).map((r) => r.judul.toLocaleLowerCase('id'));
  if (fokus.length) bagian.push(isi(k, 'ringkasOrtu.penutup', RINGKAS_ORTU.penutup, { daftar: gabungDaftar(fokus) }));
  return {
    paragraf: keParagraf('ringkasOrtu', bagian, gabungKalimat),
    pencapaian: sorotan.slice(0, 3).map((s) => ({ id: s.id, judul: s.judulSingkat, ringkas: s.ringkas })),
    fokus: rekomendasi.slice(0, 3).map((r) => ({ id: r.id, judul: r.judul, ringkas: r.ringkas })),
    catatanSkor: RINGKAS_ORTU.catatanSkor.teks,
  };
}
