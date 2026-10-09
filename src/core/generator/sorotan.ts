// Highlights: auto ranking by normalised improvement of paired items (tie-break: domain order), or the
// therapist's explicit choice (narasi.sorotan).
import { BANK_KEGIATAN, besaranUntuk } from '../bank/kegiatan.ts';
import { SOROTAN_KEGIATAN, SOROTAN_KEGIATAN_UMUM, SOROTAN_PROGRAM, SOROTAN_REFLEKS, SOROTAN_SENSORI, type TemplatSorotan } from '../bank/sorotan.ts';
import { DOMAIN } from '../master/domain.ts';
import { KEGIATAN, kegiatanDef } from '../master/kegiatan.ts';
import { SENSORI } from '../master/sensori.ts';
import { selisihPerbaikan, skorItem } from '../skala.ts';
import { buatParagraf, gabungDaftar, gabungKalimat } from '../teks.ts';
import { REFLEKS_IDS, type KegiatanId, type Level, type Paragraf } from '../types.ts';
import { isi, type Konteks, type Potongan, type Token } from './konteks.ts';

export interface Sorotan {
  id: string;
  kalimat: Paragraf;
  judulSingkat: Paragraf;
  ringkas: Paragraf;
  /** Normalised improvement (0–100 points) of paired items; null when nothing is paired. */
  nilai: number | null;
  /** Tie-break order (domain order, then item order). */
  urutan: number;
}

const ada = (v: unknown): v is Level => typeof v === 'number';
const rata = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const urutanDomain = (id: string) => DOMAIN.findIndex((d) => d.id === id);

function dariTemplat(k: Konteks, id: string, t: TemplatSorotan, token: Token, flag: Record<string, boolean> = {}, nilai: number | null, urutan: number): Sorotan {
  const p = (nama: string, x: Potongan) => buatParagraf(`sorotan.${id}.${nama}`, gabungKalimat([x.markup]), x.sumber);
  return {
    id, nilai, urutan,
    kalimat: p('kalimat', isi(k, `sorotan.${id}`, t.kalimat, token, flag)),
    judulSingkat: p('judul', isi(k, `sorotan.${id}.judul`, t.judulSingkat, token, flag)),
    ringkas: p('ringkas', isi(k, `sorotan.${id}.ringkas`, t.ringkas, token, flag)),
  };
}

function sorotanKegiatan(k: Konteks, id: KegiatanId): Sorotan | null {
  const a = k.input.sesudah.kegiatan[id]?.level;
  if (!ada(a)) return null;
  const b = k.input.sebelum.kegiatan[id]?.level;
  const sk = k.set.skala.kegiatan;
  const def = kegiatanDef(id);
  const bank = SOROTAN_KEGIATAN[id];
  const L = BANK_KEGIATAN[id].level;
  const berpasangan = ada(b);
  const token: Token = {
    frasa: def.frasa, labelSesudah: L[a].label, labelSebelum: berpasangan ? L[b].label : undefined,
    besaranSorotan: berpasangan ? besaranUntuk(selisihPerbaikan(sk, b, a)) : undefined,
  };
  const flag: Record<string, boolean> = {};
  for (const t of k.input.sesudah.kegiatan[id]?.tambahan ?? []) flag[t] = true;
  const cocok = (o?: { levelSesudah?: number }) => !!o && (o.levelSesudah === undefined || o.levelSesudah === a);
  const t: TemplatSorotan = {
    kalimat: cocok(bank.kalimat) ? bank.kalimat!.teks : berpasangan ? SOROTAN_KEGIATAN_UMUM.kalimat : SOROTAN_KEGIATAN_UMUM.kalimatBaruTeramati,
    judulSingkat: bank.judulSingkat,
    ringkas: cocok(bank.ringkas) ? bank.ringkas!.teks : berpasangan ? SOROTAN_KEGIATAN_UMUM.ringkas : SOROTAN_KEGIATAN_UMUM.ringkasBaruTeramati,
  };
  const nilai = berpasangan ? skorItem(sk, a) - skorItem(sk, b) : null;
  return dariTemplat(k, `kegiatan:${id}`, t, token, flag, nilai, urutanDomain(def.domain) * 100 + def.no);
}

function sorotanSensori(k: Konteks): Sorotan | null {
  const s = k.set.skala.sensori;
  const pasangan = SENSORI.map((d) => ({ d, b: k.input.sebelum.sensori[d.id], a: k.input.sesudah.sensori[d.id] }))
    .filter((x): x is { d: typeof x.d; b: Level; a: Level } => ada(x.b) && ada(x.a));
  if (!pasangan.length) return null;
  const nilai = rata(pasangan.map((x) => skorItem(s, x.a) - skorItem(s, x.b)));
  const seragam = pasangan.length === SENSORI.length && pasangan.every((x) => x.b === pasangan[0]!.b && x.a === pasangan[0]!.a);
  const urutan = urutanDomain('sensori') * 100;
  if (seragam) {
    const { b, a } = pasangan[0]!;
    return dariTemplat(k, 'sensori', SOROTAN_SENSORI.seragam, {
      sebelum: b, sesudah: a, kategoriSebelum: s.level[b].kategori, kategoriSesudah: s.level[a].kategori,
    }, {}, nilai, urutan);
  }
  const naik = pasangan.filter((x) => selisihPerbaikan(s, x.b, x.a) > 0).map((x) => x.d.nama);
  return dariTemplat(k, 'sensori', SOROTAN_SENSORI.campuran, { daftar: naik.length ? gabungDaftar(naik) : undefined }, {}, nilai, urutan);
}

function sorotanRefleks(k: Konteks): Sorotan | null {
  const s = k.set.skala.refleks;
  const pasangan = REFLEKS_IDS.map((id) => ({ b: k.input.sebelum.refleks[id], a: k.input.sesudah.refleks[id] }))
    .filter((x): x is { b: Level; a: Level } => ada(x.b) && ada(x.a));
  if (!pasangan.length) return null;
  const jumlah = pasangan.filter((x) => selisihPerbaikan(s, x.b, x.a) > 0).length;
  return dariTemplat(k, 'refleks', SOROTAN_REFLEKS, { jumlah, total: REFLEKS_IDS.length }, {},
    rata(pasangan.map((x) => skorItem(s, x.a) - skorItem(s, x.b))), urutanDomain('refleks') * 100);
}

function sorotanProgram(k: Konteks, bab: 1 | 2 | 3): Sorotan | null {
  const sb = k.skor.bab.find((x) => x.bab === bab);
  if (!sb || sb.awalBulat === null || sb.akhirBulat === null) return null;
  return dariTemplat(k, `program:b${bab}`, SOROTAN_PROGRAM, { namaBab: sb.nama, awal: sb.awalBulat, akhir: sb.akhirBulat }, {},
    (sb.akhir ?? 0) - (sb.awal ?? 0), urutanDomain('akuatik') * 100 + bab);
}

/** Builds one candidate by id ('kegiatan:<id>', 'sensori', 'refleks', 'program:b1'…). */
export function buatSorotan(k: Konteks, id: string): Sorotan | null {
  if (id.startsWith('kegiatan:')) return sorotanKegiatan(k, id.slice(9) as KegiatanId);
  if (id === 'sensori') return sorotanSensori(k);
  if (id === 'refleks') return sorotanRefleks(k);
  const m = /^program:b([123])$/.exec(id);
  if (m) return sorotanProgram(k, Number(m[1]) as 1 | 2 | 3);
  throw new Error(`sorotan tidak dikenal: "${id}"`);
}

export const ID_SOROTAN: readonly string[] = [...KEGIATAN.map((x) => `kegiatan:${x.id}`), 'sensori', 'refleks', 'program:b1', 'program:b2', 'program:b3'];

/** Every candidate with a positive improvement, best first. */
export function peringkatSorotan(k: Konteks): Sorotan[] {
  return ID_SOROTAN.map((id) => buatSorotan(k, id))
    .filter((x): x is Sorotan => !!x && x.nilai !== null && x.nilai > 0)
    .sort((a, b) => (b.nilai! - a.nilai!) || a.urutan - b.urutan);
}

export function pilihSorotan(k: Konteks, n = 3): Sorotan[] {
  const pilihan = k.input.narasi?.sorotan;
  if (pilihan?.length) {
    return pilihan.map((id) => {
      const s = buatSorotan(k, id);
      if (!s) throw new Error(`sorotan "${id}" tidak dapat dibuat dari data (nilai evaluasi lanjutan kosong)`);
      return s;
    });
  }
  return peringkatSorotan(k).slice(0, n);
}

