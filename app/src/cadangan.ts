// Versioned JSON backup / restore. Excludes the decrypted activation payload (signatures), the PIN and PDFs.
import { db, NAMA_STORE, tulisPengaturan, umumkan } from './db.ts';
import { hariIni } from './logika.ts';

export const FORMAT = 'hnc-evaluasi-cadangan';
const PENGATURAN_LOKAL = new Set(['aktivasi', 'pin', 'pinGagal', 'aktivasiDilewati', 'terakhirCadangan', 'perluCadangan']);

export interface Cadangan { format: typeof FORMAT; versi: 1; dibuat: string; data: Record<(typeof NAMA_STORE)[number], unknown[]> }

export async function buatCadangan(): Promise<{ bytes: Uint8Array; nama: string }> {
  const d = await db();
  const data = {} as Cadangan['data'];
  for (const s of NAMA_STORE) data[s] = await d.getAll(s);
  data.pengaturan = (data.pengaturan as { kunci: string }[]).filter((x) => !PENGATURAN_LOKAL.has(x.kunci));
  const c: Cadangan = { format: FORMAT, versi: 1, dibuat: new Date().toISOString(), data };
  return { bytes: new TextEncoder().encode(JSON.stringify(c)), nama: `HNC-Cadangan-${hariIni()}.json` };
}

export async function tandaiTercadang(): Promise<void> {
  await tulisPengaturan('terakhirCadangan', Date.now());
  await tulisPengaturan('perluCadangan', false);
}

export interface Ringkasan { anak: number; sesi: number; evaluasi: number; laporan: number; dibuat: string }

/** Parses and validates a backup file; throws a readable message. */
export function periksaCadangan(teks: string): { c: Cadangan; ringkasan: Ringkasan } {
  let c: Cadangan;
  try { c = JSON.parse(teks) as Cadangan; } catch { throw new Error('Berkas bukan cadangan HNC Evaluasi (JSON tidak valid).'); }
  if (c?.format !== FORMAT) throw new Error('Berkas bukan cadangan HNC Evaluasi.');
  if (c.versi !== 1) throw new Error(`Versi cadangan ${String(c.versi)} belum didukung. Perbarui aplikasi.`);
  for (const s of NAMA_STORE) if (!Array.isArray(c.data?.[s])) throw new Error(`Cadangan rusak: bagian "${s}" tidak ada.`);
  const kunci = { anak: 'id', sesi: 'id', evaluasi: 'id', laporan: 'id', pengaturan: 'kunci' } as const;
  for (const s of NAMA_STORE) for (const x of c.data[s]) if (!x || typeof (x as Record<string, unknown>)[kunci[s]] !== 'string') throw new Error(`Cadangan rusak: data "${s}" tidak valid.`);
  return { c, ringkasan: { anak: c.data.anak.length, sesi: c.data.sesi.length, evaluasi: c.data.evaluasi.length, laporan: c.data.laporan.length, dibuat: c.dibuat } };
}

// Older child records without mitraYasi restore as "off" (no logo); the field round-trips untouched.
/** Replaces all data (local-only settings such as PIN and activation are kept). */
export async function pulihkan(c: Cadangan): Promise<void> {
  const d = await db();
  const tx = d.transaction([...NAMA_STORE], 'readwrite');
  for (const s of NAMA_STORE) {
    const st = tx.objectStore(s);
    if (s === 'pengaturan') {
      for (const k of await st.getAllKeys()) if (!PENGATURAN_LOKAL.has(String(k))) await st.delete(k);
    } else await st.clear();
    for (const x of c.data[s]) await st.put(x as never);
  }
  await tx.done;
  umumkan();
}
