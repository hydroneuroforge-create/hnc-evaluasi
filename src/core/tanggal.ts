// Date helpers (Indonesian formatting). All computations use UTC so results never depend on the device time zone.
import type { LaporanInput } from './types.ts';

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;
export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

export interface TanggalIso { tahun: number; bulan: number; hari: number }

const POLA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses 'yyyy-mm-dd'; throws on malformed or impossible dates. */
export function parseIso(iso: string): TanggalIso {
  const m = POLA_ISO.exec(iso);
  if (!m) throw new Error(`tanggal tidak valid: "${iso}" (format yyyy-mm-dd)`);
  const t = { tahun: Number(m[1]), bulan: Number(m[2]), hari: Number(m[3]) };
  const d = new Date(Date.UTC(t.tahun, t.bulan - 1, t.hari));
  if (d.getUTCFullYear() !== t.tahun || d.getUTCMonth() !== t.bulan - 1 || d.getUTCDate() !== t.hari) {
    throw new Error(`tanggal tidak valid: "${iso}"`);
  }
  return t;
}

export function isoValid(iso: string): boolean {
  try { parseIso(iso); return true; } catch { return false; }
}

const keDate = (iso: string): Date => { const t = parseIso(iso); return new Date(Date.UTC(t.tahun, t.bulan - 1, t.hari)); };

/** '10 Februari 2026' */
export function formatTanggal(iso: string): string {
  const t = parseIso(iso);
  return `${t.hari} ${NAMA_BULAN[t.bulan - 1]} ${t.tahun}`;
}

/** 'Selasa, 10 Februari 2026' */
export function formatTanggalPanjang(iso: string): string {
  return `${NAMA_HARI[keDate(iso).getUTCDay()]}, ${formatTanggal(iso)}`;
}

/** 'Februari 2026' */
export function formatBulan(iso: string): string {
  const t = parseIso(iso);
  return `${NAMA_BULAN[t.bulan - 1]} ${t.tahun}`;
}

/** Completed years and months between the birth date and the reference date. */
export function hitungUsia(lahirIso: string, padaIso: string): { tahun: number; bulan: number } {
  const l = parseIso(lahirIso);
  const p = parseIso(padaIso);
  let bulan = (p.tahun - l.tahun) * 12 + (p.bulan - l.bulan);
  if (p.hari < l.hari) bulan -= 1;
  if (bulan < 0) throw new Error(`tanggal lahir ${lahirIso} setelah ${padaIso}`);
  return { tahun: Math.floor(bulan / 12), bulan: bulan % 12 };
}

/** '6 tahun 10 bulan' (months omitted when 0). */
export function formatUsia(u: { tahun: number; bulan: number }): string {
  return u.bulan === 0 ? `${u.tahun} tahun` : `${u.tahun} tahun ${u.bulan} bulan`;
}

/** '25 September 2025 – 10 Februari 2026' */
export function formatPeriode(awalIso: string, akhirIso: string): string {
  return `${formatTanggal(awalIso)} – ${formatTanggal(akhirIso)}`;
}

/** 'YYYY-MM' (or an ISO date) → 'Juni\u00a02024'. */
export function formatBulanTahun(ym: string): string {
  const [th, bl] = ym.split('-').map(Number);
  return `${NAMA_BULAN[bl! - 1]}\u00a0${th}`;
}

export function bulanValid(ym: string): boolean {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  return !!m && Number(m[2]) >= 1 && Number(m[2]) <= 12;
}

/** The report period as 'YYYY-MM' pair: explicit, else anak.bergabungSejak / BEFORE evaluation → AFTER evaluation. */
export function periodeBulan(input: Pick<LaporanInput, 'laporan' | 'anak' | 'sebelum' | 'sesudah'>): { awal: string; akhir: string } {
  return {
    awal: input.laporan.periode?.awal ?? input.anak.bergabungSejak ?? input.sebelum.tanggal.slice(0, 7),
    akhir: input.laporan.periode?.akhir ?? input.sesudah.tanggal.slice(0, 7),
  };
}

/** 'Juni 2024 – Mei 2025' (month + year, non-breaking space inside each); a single month if start = end. */
export function formatPeriodeBulan(awal: string, akhir: string): string {
  const a = formatBulanTahun(awal);
  const b = formatBulanTahun(akhir);
  return a === b ? a : `${a} – ${b}`;
}

export function bandingkanIso(a: string, b: string): number {
  return keDate(a).getTime() - keDate(b).getTime();
}
