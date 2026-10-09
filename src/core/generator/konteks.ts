// Shared generation context: input, scale set, name tokens, AFTER slots (dotted tokens) and scores.
import { KEGIATAN } from '../master/kegiatan.ts';
import { semuaItemProgram } from '../master/program.ts';
import { tokenNama } from '../nama.ts';
import { hitungSkor, type HasilSkor } from '../skor.ts';
import type { SetSkala } from '../skala.ts';
import type { KonteksSyarat } from '../syarat.ts';
import { buatParagraf, gabungSumber, isiTemplat } from '../teks.ts';
import type { LaporanInput, Paragraf, ProgramItemDef, SumberTeks, TeksBank } from '../types.ts';

export interface Konteks {
  input: LaporanInput;
  set: SetSkala;
  itemProgram: ProgramItemDef[];
  nama: ReturnType<typeof tokenNama>;
  /** '<kegiatan>.<slot>' -> value, from the AFTER assessment. */
  slotSesudah: Record<string, string>;
  syarat: KonteksSyarat;
  skor: HasilSkor;
}

export function buatKonteks(input: LaporanInput, set: SetSkala): Konteks {
  const itemProgram = semuaItemProgram(input.programTambahan);
  const slotSesudah: Record<string, string> = {};
  for (const k of KEGIATAN) {
    for (const [s, v] of Object.entries(input.sesudah.kegiatan[k.id]?.slot ?? {})) slotSesudah[`${k.id}.${s}`] = v;
  }
  return {
    input, set, itemProgram, slotSesudah,
    nama: tokenNama(input.anak),
    syarat: { input, set, itemProgram },
    skor: hitungSkor(input, set),
  };
}

export type Token = Record<string, string | number | undefined | null>;

/** A generated piece: markup + provenance. */
export interface Potongan { markup: string; sumber: SumberTeks | 'INPUT' | 'CAMPURAN' }

/** Fills a bank text with the context's base tokens (names, dotted AFTER slots) plus extra tokens/flags. */
export function isi(k: Konteks, id: string, tb: TeksBank, token: Token = {}, flag: Record<string, boolean | undefined> = {}): Potongan {
  return { markup: isiTemplat(id, tb.teks, { token: { ...k.slotSesudah, ...k.nama, ...token }, flag }), sumber: tb.sumber };
}

/** Fills therapist free text (name tokens allowed). */
export function isiCatatan(k: Konteks, id: string, teks: string): Potongan {
  return { markup: isiTemplat(id, teks, { token: { ...k.slotSesudah, ...k.nama } }), sumber: 'INPUT' };
}

export function keParagraf(id: string, bagian: Potongan[], gabung: (xs: string[]) => string): Paragraf {
  return buatParagraf(id, gabung(bagian.map((b) => b.markup)), gabungSumber(bagian.map((b) => b.sumber)));
}
