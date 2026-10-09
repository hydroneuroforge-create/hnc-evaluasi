// Settings helpers: clinic profile, activation payload (signatures + STR), report-number counter, backup date.
import type { KunciPenandatangan } from '../../src/core/index.ts';
import { bacaPengaturan, tulisPengaturan } from './db.ts';
import { formatNomor, KLINIK_BAWAAN, profilKlinik, type Klinik } from './logika.ts';

export interface Aktivasi { ttd: Partial<Record<KunciPenandatangan, string>>; str: string; diaktifkan: number }
export interface Nomor { mulai: number; perTahun: Record<string, number> }

export const bacaKlinik = async (): Promise<Klinik> => ({ ...KLINIK_BAWAAN, ...(await bacaPengaturan<Klinik>('klinik')) });
export const bacaAktivasi = (): Promise<Aktivasi | undefined> => bacaPengaturan<Aktivasi>('aktivasi');
const bacaNomor = async (): Promise<Nomor> => ({ mulai: 1, perTahun: {}, ...(await bacaPengaturan<Nomor>('nomor')) });

/** Clinic profile for the core + signature images for the renderer (blank until activated). */
export async function konteksKlinik() {
  const [k, akt] = await Promise.all([bacaKlinik(), bacaAktivasi()]);
  return { klinik: profilKlinik(k, akt?.str), ttd: akt?.ttd ?? {}, aktif: !!akt };
}

export async function nomorBerikutnya(tanggal: string): Promise<string> {
  const n = await bacaNomor();
  const y = tanggal.slice(0, 4);
  return formatNomor(tanggal, Math.max(n.perTahun[y] ?? 0, n.mulai - 1) + 1);
}

export async function catatNomor(nomor: string): Promise<void> {
  const m = /^HNC\/EV\/(\d{4})\/\d{2}\/(\d+)$/.exec(nomor);
  if (!m) return;
  const n = await bacaNomor();
  n.perTahun[m[1]!] = Math.max(n.perTahun[m[1]!] ?? 0, Number(m[2]));
  await tulisPengaturan('nomor', n);
}

export const bacaMulaiNomor = async (): Promise<number> => (await bacaNomor()).mulai;
export async function tulisMulaiNomor(mulai: number): Promise<void> { await tulisPengaturan('nomor', { ...(await bacaNomor()), mulai }); }
