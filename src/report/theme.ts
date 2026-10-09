// Visual theme of the report: brand palette (THEME-NOTES.md), scale-zone colours (D9), type scale and spacing.
// Pure data; no React here.
import type { Styles } from '@react-pdf/renderer';
import type { StatusItem, Zona } from '../core/index.ts';

/** A react-pdf style object. */
export type Gaya = Styles[string];

export const FONT = 'PlusJakartaSans';

/** Brand palette sampled from the logo, plus neutral tones. */
export const WARNA = {
  navy: '#04141C',
  hijauGelap: '#1C5450',
  petrol: '#24546C',
  petrolTua: '#1B4256',
  slate: '#507C8C',
  teal: '#448084',
  aqua: '#68A4B0',
  slateBiru: '#6C8CA0',
  teks: '#1E2B33',
  teksLembut: '#4E5F69',
  teksSamar: '#7E8C94',
  garis: '#D9E2E6',
  garisLembut: '#E8EEF1',
  latar: '#F4F8F9',
  latarTeal: '#EAF3F4',
  putih: '#FFFFFF',
  /** BEFORE (evaluasi awal) marks: grey. */
  awal: '#9AA6AE',
  awalMuda: '#D3DADF',
  /** AFTER (evaluasi lanjutan) marks: petrol / teal, filled. */
  lanjutan: '#24546C',
  lanjutanMuda: '#CFE3E6',
  aksen: '#2E7D78',
} as const;

/** Colour zones of the scales (z4 = most developed). No red. */
export const ZONA: Record<Zona, { kuat: string; muda: string; teks: string }> = {
  z4: { kuat: '#2E7D78', muda: '#D5EAE7', teks: '#1C5450' },
  z3: { kuat: '#7DBEC4', muda: '#E3F2F3', teks: '#2B6478' },
  z2: { kuat: '#F2C48D', muda: '#FCEEDC', teks: '#8A5A1E' },
  z1: { kuat: '#EFA48B', muda: '#FBE3DA', teks: '#8E4630' },
};

/** Status chip colours. */
export const STATUS_WARNA: Record<StatusItem, { latar: string; teks: string; garis: string }> = {
  meningkat: { latar: '#E1F0EE', teks: '#1C5450', garis: '#B9DCD6' },
  stabil: { latar: '#E8EEF2', teks: '#3E5F70', garis: '#CBD8E0' },
  perluPenguatan: { latar: '#FCEEDC', teks: '#8A5A1E', garis: '#F2D3AA' },
  baruTeramati: { latar: '#E3F1F5', teks: '#2B6478', garis: '#BFDDE6' },
  belumDiberikan: { latar: '#F1F3F4', teks: '#8A949A', garis: '#E0E4E6' },
  tidakTeramati: { latar: '#F1F3F4', teks: '#8A949A', garis: '#E0E4E6' },
};

/** Type scale in pt. Body 9.5 pt, line height ≈ 1.45. */
export const UKURAN = {
  mikro: 6.5,
  kecil: 7.5,
  catatan: 8.2,
  isi: 9.5,
  sub: 11,
  judulKartu: 10.5,
  judulBagian: 17,
  besar: 24,
} as const;

export const BARIS = 1.45;

/** 8-pt spacing grid. */
export const JARAK = { s1: 4, s2: 8, s3: 12, s4: 16, s5: 24, s6: 32 } as const;

/** A4 portrait geometry (pt). */
export const HALAMAN = {
  lebar: 595.28,
  tinggi: 841.89,
  sisi: 42,
  atas: 78,
  bawah: 52,
} as const;

export const LEBAR_ISI = HALAMAN.lebar - 2 * HALAMAN.sisi;

/** Tabular numbers for every figure. */
export const ANGKA = { fontFeatureSettings: ['tnum'] as ['tnum'] };
