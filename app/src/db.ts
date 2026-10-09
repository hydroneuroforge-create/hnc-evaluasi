// IndexedDB (idb): children, sessions, evaluations (dated snapshots + autosaved drafts), reports (frozen input),
// settings (key/value). All data stays on this device.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Asesmen, KegiatanNilai, LaporanInput, Level, ProgramItemDef } from '../../src/core/index.ts';

export interface Anak {
  id: string;
  namaLengkap: string;
  namaPanggilan: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  /** Plain text as typed (known English diagnoses are italicised for the report). */
  diagnosa: string;
  /** Month the child joined, 'YYYY-MM' (optional; default start of the report period). */
  bergabungSejak?: string;
  /** Custom 'Program Individual' activities; carried into every later evaluation. */
  programIndividual: ProgramItemDef[];
  dibuat: number;
}

export interface Sesi { id: string; anakId: string; tanggal: string; dibuat: number }

/** Draft-tolerant assessment: kegiatan may be incomplete until the evaluation is finished. */
export interface AsesmenDraf extends Omit<Asesmen, 'kegiatan'> { kegiatan: Partial<Asesmen['kegiatan']> }

export interface Evaluasi {
  id: string;
  anakId: string;
  jenis: 'awal' | 'lanjutan';
  status: 'draf' | 'selesai';
  asesmen: AsesmenDraf;
  diubah: number;
}

export interface Laporan {
  id: string;
  anakId: string;
  evaluasiId: string;
  nomor: string;
  tanggal: string;
  /** Frozen input (incl. text overrides and options) so the PDF re-renders identically. */
  input: LaporanInput;
  dibuat: number;
  sertifikat?: { pencapaian: string; tanggal: string };
}

export interface Pengaturan<T = unknown> { kunci: string; nilai: T }

interface Skema extends DBSchema {
  anak: { key: string; value: Anak };
  sesi: { key: string; value: Sesi; indexes: { anakId: string } };
  evaluasi: { key: string; value: Evaluasi; indexes: { anakId: string } };
  laporan: { key: string; value: Laporan; indexes: { anakId: string } };
  pengaturan: { key: string; value: Pengaturan };
}

export const NAMA_STORE = ['anak', 'sesi', 'evaluasi', 'laporan', 'pengaturan'] as const;

let dbP: Promise<IDBPDatabase<Skema>> | null = null;
export function db(): Promise<IDBPDatabase<Skema>> {
  dbP ??= openDB<Skema>('hnc-evaluasi', 1, {
    upgrade(d) {
      d.createObjectStore('anak', { keyPath: 'id' });
      d.createObjectStore('sesi', { keyPath: 'id' }).createIndex('anakId', 'anakId');
      d.createObjectStore('evaluasi', { keyPath: 'id' }).createIndex('anakId', 'anakId');
      d.createObjectStore('laporan', { keyPath: 'id' }).createIndex('anakId', 'anakId');
      d.createObjectStore('pengaturan', { keyPath: 'kunci' });
    },
  });
  return dbP;
}

export const idBaru = (): string => crypto.randomUUID();

// --- tiny change bus so screens refresh after writes -------------------------------------------------------
const pendengar = new Set<() => void>();
export const dengarPerubahan = (f: () => void): (() => void) => { pendengar.add(f); return () => pendengar.delete(f); };
export const umumkan = (): void => pendengar.forEach((f) => f());

export async function simpan<S extends 'anak' | 'sesi' | 'evaluasi' | 'laporan'>(store: S, nilai: Skema[S]['value']): Promise<void> {
  await (await db()).put(store, nilai as never);
  umumkan();
}
export async function hapus(store: 'anak' | 'sesi' | 'evaluasi' | 'laporan', id: string): Promise<void> {
  await (await db()).delete(store, id);
  umumkan();
}
export const semuaAnak = async (): Promise<Anak[]> => (await (await db()).getAll('anak')).sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap, 'id'));
export const ambilAnak = async (id: string) => (await db()).get('anak', id);
export const ambilEvaluasi = async (id: string) => (await db()).get('evaluasi', id);
export const ambilLaporan = async (id: string) => (await db()).get('laporan', id);
export const sesiAnak = async (anakId: string): Promise<Sesi[]> =>
  (await (await db()).getAllFromIndex('sesi', 'anakId', anakId)).sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.dibuat - b.dibuat);
export const evaluasiAnak = async (anakId: string): Promise<Evaluasi[]> =>
  (await (await db()).getAllFromIndex('evaluasi', 'anakId', anakId)).sort((a, b) => a.asesmen.tanggal.localeCompare(b.asesmen.tanggal) || a.diubah - b.diubah);
export const laporanAnak = async (anakId: string): Promise<Laporan[]> =>
  (await (await db()).getAllFromIndex('laporan', 'anakId', anakId)).sort((a, b) => b.dibuat - a.dibuat);
export const semuaSesi = async (): Promise<Sesi[]> => (await db()).getAll('sesi');
export const semuaEvaluasi = async (): Promise<Evaluasi[]> => (await db()).getAll('evaluasi');

export async function hapusAnak(id: string): Promise<void> {
  const d = await db();
  const tx = d.transaction(['anak', 'sesi', 'evaluasi', 'laporan'], 'readwrite');
  for (const s of ['sesi', 'evaluasi', 'laporan'] as const) {
    for (const k of await tx.objectStore(s).index('anakId').getAllKeys(id)) await tx.objectStore(s).delete(k);
  }
  await tx.objectStore('anak').delete(id);
  await tx.done;
  umumkan();
}

export async function bacaPengaturan<T>(kunci: string): Promise<T | undefined> {
  return (await (await db()).get('pengaturan', kunci))?.nilai as T | undefined;
}
export async function tulisPengaturan<T>(kunci: string, nilai: T): Promise<void> {
  await (await db()).put('pengaturan', { kunci, nilai });
  umumkan();
}

/** Empty draft assessment for a date. */
export const asesmenKosong = (tanggal: string): AsesmenDraf => ({ tanggal, kegiatan: {}, sensori: {} as Record<string, Level | null>, refleks: {} as Record<string, Level | null>, program: {} } as AsesmenDraf);
export type { KegiatanNilai };
