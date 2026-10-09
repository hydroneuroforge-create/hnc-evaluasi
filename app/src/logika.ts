// App logic around the pure core: counts, report numbers, building the frozen LaporanInput.
import {
  formatTanggal, formatUsia, hitungUsia, KEGIATAN_IDS, KLINIK, REFLEKS_IDS, semuaItemProgram, SENSORI_IDS,
  type Asesmen, type LaporanInput, type ProfilKlinik,
} from '../../src/core/index.ts';
import type { Anak, AsesmenDraf, Evaluasi, Sesi } from './db.ts';

export const SESI_EVALUASI = 24;
export const DIAGNOSA_SARAN = ['ASD', 'ADHD', 'Cerebral Palsy', 'Down Syndrome', 'Sensory Processing Disorder', 'Global Developmental Delay', 'Speech Delay'];

/** Local date as ISO yyyy-mm-dd. */
export const hariIni = (d = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const tanggalTampil = (iso: string): string => (iso ? formatTanggal(iso) : '–');
export const usiaTampil = (lahir: string): string => (lahir ? formatUsia(hitungUsia(lahir, hariIni())) : '–');

/** Report markup: known English diagnosis names in italics. */
export function diagnosaMarkup(teks: string): string {
  return teks.split(/(,\s*|\s*\+\s*|\s+dan\s+)/).map((b) => (DIAGNOSA_SARAN.some((s) => s.toLowerCase() === b.trim().toLowerCase()) ? `_${b.trim()}_` : b)).join('');
}

export const evaluasiSelesai = (xs: Evaluasi[]): Evaluasi[] => xs.filter((e) => e.status === 'selesai');

/** Sessions after the latest finished evaluation. */
export function sesiSejakEvaluasi(sesi: Sesi[], evaluasi: Evaluasi[]): number {
  const akhir = evaluasiSelesai(evaluasi).map((e) => e.asesmen.tanggal).sort().pop();
  return akhir ? sesi.filter((s) => s.tanggal > akhir).length : sesi.length;
}

/** Informational flag: ≥ 6 months since the latest finished evaluation. */
export function sudahEnamBulan(evaluasi: Evaluasi[]): boolean {
  const akhir = evaluasiSelesai(evaluasi).map((e) => e.asesmen.tanggal).sort().pop();
  if (!akhir) return false;
  const t = new Date(`${akhir}T00:00:00`);
  t.setMonth(t.getMonth() + 6);
  return hariIni() >= hariIni(t);
}

/** Missing items of a draft (human-readable). */
export function kekuranganAsesmen(a: AsesmenDraf): string[] {
  const k = KEGIATAN_IDS.filter((id) => !a.kegiatan[id]);
  return [...(a.tanggal ? [] : ['tanggal evaluasi']), ...(k.length ? [`${k.length} kegiatan belum dinilai`] : [])];
}

/** Strict Asesmen for the core (missing sensori/refleks = null). */
export function keAsesmen(a: AsesmenDraf, idProgram?: Set<string>): Asesmen {
  const sensori = Object.fromEntries(SENSORI_IDS.map((id) => [id, a.sensori[id] ?? null])) as Asesmen['sensori'];
  const refleks = Object.fromEntries(REFLEKS_IDS.map((id) => [id, a.refleks[id] ?? null])) as Asesmen['refleks'];
  return { ...a, kegiatan: a.kegiatan as Asesmen['kegiatan'], sensori, refleks, program: Object.fromEntries(Object.entries(a.program).filter(([id]) => !idProgram || idProgram.has(id))) };
}

/** HNC/EV/{YYYY}/{MM}/{NNN} */
export function formatNomor(tanggal: string, urut: number): string {
  const [y, m] = tanggal.split('-');
  return `HNC/EV/${y}/${m}/${String(urut).padStart(3, '0')}`;
}

export interface Klinik {
  nama: string; alamat: string; wa: string; ig: string;
  fisioterapis: { nama: string; peran: string }; terapis: { nama: string; peran: string };
}
export const KLINIK_BAWAAN: Klinik = {
  nama: KLINIK.nama, alamat: KLINIK.alamat, wa: KLINIK.kontak.wa, ig: KLINIK.kontak.ig,
  fisioterapis: { nama: KLINIK.penandatangan[0].nama, peran: KLINIK.penandatangan[0].peran },
  terapis: { nama: KLINIK.penandatangan[1].nama, peran: KLINIK.penandatangan[1].peran },
};

/** Core clinic profile; the STR comes only from the activation payload (blank until activated). */
export function profilKlinik(k: Klinik, str?: string): ProfilKlinik {
  return {
    nama: k.nama, alamat: k.alamat, kontak: { wa: k.wa, ig: k.ig }, aplikasi: KLINIK.aplikasi,
    penandatangan: [
      { kunci: 'fisioterapis', nama: k.fisioterapis.nama, peran: k.fisioterapis.peran, ...(str ? { str } : {}) },
      { kunci: 'terapis', nama: k.terapis.nama, peran: k.terapis.peran },
    ],
  };
}

export interface OpsiLaporan {
  nomor: string; tanggal: string; periode: { awal: string; akhir: string }; kondisiAwal: string[]; teks: Record<string, string>;
}

/** Builds the full LaporanInput: BEFORE = previous finished evaluation, AFTER = this one. */
export function buatInput(anak: Anak, evaluasi: Evaluasi[], ini: Evaluasi, sesi: Sesi[], opsi: OpsiLaporan, klinik: ProfilKlinik): LaporanInput {
  const selesai = evaluasiSelesai(evaluasi).filter((e) => e.id !== ini.id && e.asesmen.tanggal <= ini.asesmen.tanggal);
  const sebelum = selesai[selesai.length - 1];
  if (!sebelum) throw new Error('Belum ada evaluasi sebelumnya yang selesai untuk dibandingkan.');
  const ids = new Set(semuaItemProgram(anak.programIndividual).map((x) => x.id));
  return {
    versi: 1,
    laporan: { nomor: opsi.nomor, tempat: 'Bogor', tanggal: opsi.tanggal, periode: opsi.periode, evaluasiBerikutnya: { setelahSesi: SESI_EVALUASI } },
    anak: {
      namaLengkap: anak.namaLengkap.trim(), namaPanggilan: anak.namaPanggilan.trim(), tempatLahir: anak.tempatLahir.trim(),
      tanggalLahir: anak.tanggalLahir, jenisKelamin: anak.jenisKelamin, diagnosa: diagnosaMarkup(anak.diagnosa.trim()),
      ...(anak.bergabungSejak ? { bergabungSejak: anak.bergabungSejak } : {}),
    },
    sebelum: keAsesmen(sebelum.asesmen, ids),
    sesudah: keAsesmen(ini.asesmen, ids),
    riwayat: selesai.slice(0, -1).map((e) => keAsesmen(e.asesmen, ids)),
    sesi: sesi.filter((s) => s.tanggal <= ini.asesmen.tanggal).map((s) => ({ tanggal: s.tanggal })),
    ...(anak.programIndividual.length ? { programTambahan: anak.programIndividual.map((p) => ({ ...p, individual: true })) } : {}),
    narasi: { ...(opsi.kondisiAwal.length ? { kondisiAwal: opsi.kondisiAwal } : {}) },
    teks: opsi.teks,
    klinik,
  };
}

/** Suggested 'Bergabung sejak': month of the earliest logged session or evaluation. */
export function saranBergabung(sesi: Sesi[], evaluasi: Evaluasi[]): string | undefined {
  const t = [...sesi.map((s) => s.tanggal), ...evaluasi.map((e) => e.asesmen.tanggal)].filter(Boolean).sort()[0];
  return t ? t.slice(0, 7) : undefined;
}

/** Sessions counted for a report: after BEFORE, up to and including AFTER. */
export function jumlahSesiAntara(sesi: Sesi[], dari: string, sampai: string): number {
  return sesi.filter((s) => s.tanggal > dari && s.tanggal <= sampai).length;
}

export const namaBerkas = (jenis: 'Laporan' | 'Sertifikat', panggilan: string, tanggal: string, akhiran = ''): string =>
  `${jenis}-HNC-${panggilan.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'Anak'}-${tanggal}${akhiran}.pdf`;
