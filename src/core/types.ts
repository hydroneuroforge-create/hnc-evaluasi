// Data model of the HNC Evaluasi report engine (PLAN.md §5.2).
// Pure types: no runtime code, no Node/DOM dependency.
import type { ProfilKlinik } from './klinik.ts';

export type Level = 1 | 2 | 3 | 4;
/** 'tdo' = tidak dapat diobservasi (excluded from scores). */
export type NilaiKegiatan = Level | 'tdo';

export const KEGIATAN_IDS = [
  'responEkspresi', 'eyeContact', 'pemahamanInstruksi', 'kekuatanLeher', 'proning', 'reaksiVerbal',
  'motorikTangan', 'motorikKaki', 'ototInti', 'berjalanMajuMundur', 'posturTulangBelakang', 'bahu',
  'kakiAyun', 'backFloating',
] as const;
export type KegiatanId = (typeof KEGIATAN_IDS)[number];

export const SENSORI_IDS = ['vestibular', 'taktil', 'proprioseptif'] as const;
export type SensoriId = (typeof SENSORI_IDS)[number];

export const REFLEKS_IDS = [
  'atnr', 'stnr', 'tlr', 'palmarGrasp', 'plantarBabinski', 'moro', 'spinalGalant', 'suckingRooting',
  'amphibian', 'diving',
] as const;
export type RefleksId = (typeof REFLEKS_IDS)[number];

/** Stable Program item id, e.g. 'b1.feelingWater'; custom items ('Program Individual') use their own ids. */
export type ProgramItemId = string;

export type SumberTeks = 'DOKUMEN' | 'BARU';
/** One sentence-bank entry. `teks` uses markup **bold**, _italic_ and template syntax (teks.ts). */
export interface TeksBank { teks: string; sumber: SumberTeks; catatan?: string }

/** A formatted text run (D11). */
export interface Run { teks: string; tebal?: boolean; miring?: boolean }

/** A generated paragraph: markup source + runs + provenance. */
export interface Paragraf {
  id: string;
  markup: string;
  runs: Run[];
  /** DOKUMEN = verbatim source wording; BARU = newly drafted; CAMPURAN = both; INPUT = therapist free text. */
  sumber: SumberTeks | 'CAMPURAN' | 'INPUT';
}

export interface KegiatanNilai {
  level: NilaiKegiatan;
  /** Detail slots, e.g. { durasi: '30–60 detik' }. */
  slot?: Record<string, string>;
  /** Selected add-on sentence ids, appended in definition order. */
  tambahan?: string[];
  /** Free-text therapist note (may use name tokens). */
  catatan?: string;
}

export interface Asesmen {
  tanggal: string; // ISO yyyy-mm-dd
  /** Reason shown in the standard 'tidak dapat diobservasi' sentence. */
  alasanTdo?: string;
  kegiatan: Record<KegiatanId, KegiatanNilai>;
  sensori: Record<SensoriId, Level | null>;
  refleks: Record<RefleksId, Level | null>;
  /** null (or missing) = '–' Belum diberikan. */
  program: Record<ProgramItemId, Level | null>;
}

export interface Anak {
  namaLengkap: string;
  namaPanggilan: string;
  tempatLahir: string;
  tanggalLahir: string; // ISO
  jenisKelamin: 'L' | 'P';
  /** Markup, e.g. '_Contoh Diagnosa_'. */
  diagnosa: string;
  /** Month the child joined, 'YYYY-MM' (optional; start of the report period). */
  bergabungSejak?: string;
}

export interface ProgramItemDef {
  id: ProgramItemId;
  bab: 1 | 2 | 3;
  no: number;
  /** Bold prefix, e.g. 'PRONE (Tummy):'. */
  posisi?: string;
  aktivitas: string;
  /** Rendered in italics. */
  targetRefleks: string;
  manfaat?: string;
  /** true = custom movement ('Program Individual' badge). */
  individual?: boolean;
  catatanFisioterapis?: string;
}

export type BlokRefleks = 'manfaat' | 'saran' | 'penutup' | 'bukti';

export interface NarasiInput {
  /** Ids from bank/kesimpulan KONDISI_AWAL. */
  kondisiAwal?: string[];
  /** Highlight candidate ids (e.g. 'kegiatan:ototInti', 'sensori', 'program:b1', 'refleks'); overrides the auto ranking. */
  sorotan?: string[];
  /** Explicit recommendation order (ids from bank/rekomendasi). */
  rekomendasi?: string[];
  rekomendasiNonaktif?: string[];
  refleks?: Partial<Record<RefleksId, { catatan?: string; sembunyikan?: BlokRefleks[] }>>;
}

export interface LaporanInput {
  versi: 1;
  /** grafikSesi: render the sessions-per-month chart (default off; the report never prints session counts). */
  opsi?: { setSkala?: 'A' | 'B'; maksRekomendasi?: number; grafikSesi?: boolean };
  laporan: {
    nomor: string;
    tempat: string;
    tanggal: string; // ISO
    /** Legacy; no longer printed. */
    jumlahSesi?: number;
    /** Report period, 'YYYY-MM' each. Default: anak.bergabungSejak (else the BEFORE evaluation) → the AFTER evaluation. */
    periode?: { awal: string; akhir: string };
    evaluasiBerikutnya: { setelahSesi: number };
  };
  anak: Anak;
  sebelum: Asesmen;
  sesudah: Asesmen;
  /** Older evaluations (oldest first) for the trend chart. */
  riwayat?: Asesmen[];
  /** Session log; the sessions-per-month chart renders only if present. */
  sesi?: { tanggal: string }[];
  /** Custom movements -> 'Program Individual' badge. */
  programTambahan?: ProgramItemDef[];
  narasi?: NarasiInput;
  /** Therapist text overrides keyed by stable paragraph id (markup); applied after generation (PWA review). */
  teks?: Record<string, string>;
  /** Clinic profile override (PWA settings + activation); defaults to KLINIK. */
  klinik?: ProfilKlinik;
  sertifikat?: { pencapaian: string; tanggal: string; tempat: string };
  /** Review doc + console only, never printed in the PDF. */
  asumsi?: string[];
}

export interface OpsiSiapkan {
  /** Strict mode: validation errors and name-guard hits throw instead of becoming `peringatan`. Default true. */
  ketat?: boolean;
}
