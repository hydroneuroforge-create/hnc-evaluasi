// The 14 kegiatan of the 'Report Evaluasi' form, with their detail slots and add-on sentence ids.
// Texts live in bank/kegiatan.ts.
import type { KegiatanId } from '../types.ts';
import type { DomainId } from './domain.ts';

export interface SlotDef {
  id: string;
  label: string;
  /** Example value for the future picker. */
  contoh?: string;
  /** Closed choice list, when applicable. */
  pilihan?: readonly string[];
}

export interface TambahanDef { id: string; label: string }

export interface KegiatanDef {
  id: KegiatanId;
  no: number;
  /** Display name (markup). */
  nama: string;
  domain: DomainId;
  /** Noun phrase used in generated sentences, e.g. 'kemampuan menjalin kontak mata'. */
  frasa: string;
  slot: readonly SlotDef[];
  tambahan: readonly TambahanDef[];
}

const SISI = ['kiri', 'kanan'] as const;
const BANTUAN = ['instruksi verbal', 'isyarat visual', 'bantuan fisik ringan', 'bantuan fisik penuh'] as const;
const DURASI = (contoh: string): SlotDef => ({ id: 'durasi', label: 'Durasi', contoh });

/** Add-ons available for every kegiatan (appended after the kegiatan-specific ones). */
export const TAMBAHAN_UMUM: readonly TambahanDef[] = [
  { id: 'butuhPengingat', label: 'Masih memerlukan pengingat' },
  { id: 'mandiriTanpaBantuan', label: 'Sudah mandiri tanpa bantuan' },
];

export const KEGIATAN: readonly KegiatanDef[] = [
  { id: 'responEkspresi', no: 1, nama: 'Respon Ekspresi', domain: 'emosi', frasa: 'respons dan regulasi emosi selama sesi',
    slot: [{ id: 'jenisBantuan', label: 'Jenis arahan', contoh: 'instruksi verbal', pilihan: BANTUAN }],
    tambahan: [{ id: 'penolakanDurasi', label: 'Menolak bila durasi di air melebihi kebiasaan' }] },
  { id: 'eyeContact', no: 2, nama: 'Eye Contact', domain: 'komunikasi', frasa: 'kemampuan menjalin kontak mata', slot: [], tambahan: [] },
  { id: 'pemahamanInstruksi', no: 3, nama: 'Pemahaman Instruksi', domain: 'pemahaman', frasa: 'kemampuan memahami dan mengikuti instruksi', slot: [], tambahan: [] },
  { id: 'kekuatanLeher', no: 4, nama: 'Kekuatan Leher', domain: 'stabilitas', frasa: 'kekuatan leher dan kontrol kepala', slot: [DURASI('15 hingga 30 detik')], tambahan: [] },
  { id: 'proning', no: 5, nama: 'Proning/Tengkurap', domain: 'stabilitas', frasa: 'kemampuan beraktivitas dalam posisi tengkurap',
    slot: [], tambahan: [{ id: 'kepalaMasukAir', label: 'Berani memasukkan kepala ke dalam air' }] },
  { id: 'reaksiVerbal', no: 6, nama: 'Reaksi Verbal', domain: 'komunikasi', frasa: 'kemampuan verbal', slot: [], tambahan: [] },
  { id: 'motorikTangan', no: 7, nama: 'Motorik Tangan', domain: 'motorik', frasa: 'kekuatan genggaman tangan', slot: [], tambahan: [] },
  { id: 'motorikKaki', no: 8, nama: 'Motorik Kaki', domain: 'motorik', frasa: 'kekuatan dan koordinasi otot kaki',
    slot: [{ id: 'sisiLemah', label: 'Sisi kaki yang masih lebih lemah', contoh: 'kiri', pilihan: SISI }], tambahan: [] },
  { id: 'ototInti', no: 9, nama: 'Otot Inti (_Core Muscle_)', domain: 'stabilitas', frasa: 'kekuatan otot inti (core muscle)',
    slot: [DURASI('30–60 detik')], tambahan: [{ id: 'waterTrap', label: 'Mampu melakukan water trap di kolam dalam' }] },
  { id: 'berjalanMajuMundur', no: 10, nama: 'Berjalan Maju & Mundur', domain: 'motorik', frasa: 'kemampuan berjalan maju dan mundur di air', slot: [], tambahan: [] },
  { id: 'posturTulangBelakang', no: 11, nama: 'Postur Tulang Belakang', domain: 'stabilitas', frasa: 'postur tulang belakang', slot: [], tambahan: [] },
  { id: 'bahu', no: 12, nama: 'Bahu Kanan & Bahu Kiri', domain: 'motorik', frasa: 'keseimbangan dan koordinasi kedua bahu', slot: [], tambahan: [] },
  { id: 'kakiAyun', no: 13, nama: 'Kaki Ayun Ke Depan & Belakang', domain: 'motorik', frasa: 'pola ayunan kaki ke depan dan ke belakang', slot: [], tambahan: [] },
  { id: 'backFloating', no: 14, nama: 'Back Floating', domain: 'stabilitas', frasa: 'kemampuan mengapung telentang (back floating)',
    slot: [{ id: 'jenisBantuan', label: 'Jenis bantuan', contoh: 'fisik dari terapis', pilihan: ['fisik dari terapis', 'alat bantu apung'] }],
    tambahan: [{ id: 'inisiatifSendiri', label: 'Menunjukkan inisiatif melakukannya sendiri' }] },
];

export const kegiatanDef = (id: KegiatanId): KegiatanDef => KEGIATAN.find((k) => k.id === id)!;

/** Kegiatan-specific add-ons followed by the general ones. */
export const tambahanKegiatan = (id: KegiatanId): TambahanDef[] => [...kegiatanDef(id).tambahan, ...TAMBAHAN_UMUM];
