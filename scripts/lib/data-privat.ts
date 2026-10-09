// Loads the private reference data (never committed) and its fidelity oracle.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LaporanInput } from '../../src/core/index.ts';
import { BERKAS_DATA_ANAK, BERKAS_KODE_AKTIVASI, BERKAS_ORACLE, DIR_TTD } from './jalur.ts';

export interface Perubahan { lokasi: string; dari: string; menjadi: string; jenis: string }

export interface Oracle {
  kegiatan: Record<string, { sebelum: string; sesudah: string }>;
  legendaSensori: string[];
  legendaRefleks: string[];
  skalaProgram: string[];
  ringkasanRefleks: string[];
  gambaranPengantar: string;
  gambaran: Record<string, string>;
  kesimpulan: { p1: string; p2: string; sorotan: string[]; p3: string; rekomendasi: string[] };
  pengesahan: { tanggal: string; nama: string[]; peran: string[] };
  terlarang: string[];
  perubahan: Perubahan[];
}

const bacaJson = <T>(berkas: string): T => {
  if (!existsSync(berkas)) throw new Error(`berkas privat tidak ditemukan: ${berkas} (atur HNC_DATA bila lokasinya lain)`);
  return JSON.parse(readFileSync(berkas, 'utf8')) as T;
};

export const bacaDataAnak = (): LaporanInput => bacaJson<LaporanInput>(BERKAS_DATA_ANAK);
export const bacaOracle = (): Oracle => bacaJson<Oracle>(BERKAS_ORACLE);

export const sha256 = (b: Uint8Array): string => createHash('sha256').update(b).digest('hex');

/** Activation code (private file), or null when not generated yet. Never print it. */
export const bacaKodeAktivasi = (): string | null =>
  existsSync(BERKAS_KODE_AKTIVASI) ? readFileSync(BERKAS_KODE_AKTIVASI, 'utf8').trim() || null : null;

/** sha256 of every private signature image. */
export function hashTandaTangan(): Set<string> {
  if (!existsSync(DIR_TTD)) return new Set();
  return new Set(readdirSync(DIR_TTD).filter((f) => /\.png$/i.test(f)).map((f) => sha256(readFileSync(join(DIR_TTD, f)))));
}
