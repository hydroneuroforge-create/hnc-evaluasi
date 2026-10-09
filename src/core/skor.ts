// Scoring (PLAN.md §7), driven entirely by the scale definitions.
// - item score 0–100 via skorItem() (direction from the scale); 'tdo' and null are excluded;
// - a domain score at time t is the mean of the items OBSERVED at t (no imputation), coverage is stored;
// - a domain with zero observed items is null and excluded from the overall score at that t;
// - overall = mean of the non-null domains; displayed integers are Math.round; displayed Δ = round(after) − round(before).
import { BAB_PROGRAM, semuaItemProgram } from './master/program.ts';
import { DOMAIN, type DomainId } from './master/domain.ts';
import { membaik, peringkat, selisihPerbaikan, skorItem, type DefinisiSkala, type SetSkala } from './skala.ts';
import { formatBulan, formatTanggal } from './tanggal.ts';
import {
  REFLEKS_IDS, SENSORI_IDS,
  type Asesmen, type LaporanInput, type Level, type NilaiKegiatan, type ProgramItemDef,
} from './types.ts';

export interface Cakupan { teramati: number; total: number }

export interface SkorDomainWaktu { skor: number | null; cakupan: Cakupan }

export interface SkorDomain {
  id: DomainId;
  nama: string;
  namaSingkat: string;
  awal: number | null;
  akhir: number | null;
  awalBulat: number | null;
  akhirBulat: number | null;
  /** round(akhir) − round(awal); null when either is null. */
  selisih: number | null;
  cakupanAwal: Cakupan;
  cakupanAkhir: Cakupan;
  /** BEFORE coverage below AFTER coverage -> radar label gets '*'. */
  bertanda: boolean;
}

export interface SkorBab {
  bab: 1 | 2 | 3;
  nama: string;
  namaInggris: string;
  /** Chapter % = mean of the given items' scores. */
  awal: number | null;
  akhir: number | null;
  awalBulat: number | null;
  akhirBulat: number | null;
  diberikanAwal: number;
  /** Items given at AFTER. */
  diberikan: number;
  total: number;
  /** 'n dari N aktivitas sudah diberikan' */
  teksDiberikan: string;
  /** Every item given and every AFTER value >= 3 (rank). */
  tuntas: boolean;
}

export interface TitikTren { urutan: number; tanggal: string; tanggalTeks: string; label: string; skor: number | null; skorBulat: number | null }

export interface HasilSkor {
  domain: SkorDomain[];
  keseluruhan: { awal: number | null; akhir: number | null; awalBulat: number | null; akhirBulat: number | null; selisih: number | null };
  bab: SkorBab[];
  /** D10: the first chapter that is not yet tuntas (the last one when all are). */
  posisiSaatIni: { bab: 1 | 2 | 3; nama: string; semuaTuntas: boolean };
  tren: TitikTren[];
  /** true when any domain is `bertanda` -> print CATATAN_CAKUPAN. */
  perluCatatanCakupan: boolean;
}

export const CATATAN_CAKUPAN =
  '* Beberapa aspek belum dapat diobservasi pada evaluasi awal; skor awal dihitung dari aspek yang dapat diobservasi saja.';

export type StatusItem = 'meningkat' | 'stabil' | 'perluPenguatan' | 'baruTeramati' | 'belumDiberikan' | 'tidakTeramati';

const rata = (xs: number[]): number | null => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const bulat = (x: number | null): number | null => (x === null ? null : Math.round(x));
const nilaiAda = (v: NilaiKegiatan | Level | null | undefined): v is Level => typeof v === 'number';

/** Item status from the item's own BEFORE/AFTER pair only. */
export function statusItem(s: DefinisiSkala, sebelum: NilaiKegiatan | Level | null | undefined, sesudah: NilaiKegiatan | Level | null | undefined, area?: 'program'): StatusItem {
  if (!nilaiAda(sesudah)) return area === 'program' ? 'belumDiberikan' : 'tidakTeramati';
  if (!nilaiAda(sebelum)) return 'baruTeramati';
  const d = selisihPerbaikan(s, sebelum, sesudah);
  return d > 0 ? 'meningkat' : d === 0 ? 'stabil' : 'perluPenguatan';
}

/**
 * 'membaik' as used by evidence conditions: improved, or BEFORE not observed and AFTER rank >= 3.
 */
export function itemMembaik(s: DefinisiSkala, sebelum: NilaiKegiatan | Level | null | undefined, sesudah: NilaiKegiatan | Level | null | undefined): boolean {
  if (!nilaiAda(sesudah)) return false;
  if (!nilaiAda(sebelum)) return peringkat(s, sesudah) >= 3;
  return membaik(s, sebelum, sesudah);
}

/** Domain scores of one assessment. */
export function skorAsesmen(a: Asesmen, set: SetSkala, itemProgram: readonly ProgramItemDef[]): Record<DomainId, SkorDomainWaktu> {
  const sk = set.skala;
  const hasil = {} as Record<DomainId, SkorDomainWaktu>;
  for (const d of DOMAIN) {
    let nilai: number[] = [];
    let total = 0;
    if (d.kegiatan) {
      total = d.kegiatan.length;
      nilai = d.kegiatan.map((id) => a.kegiatan[id]?.level).filter(nilaiAda).map((v) => skorItem(sk.kegiatan, v));
    } else if (d.area === 'sensori') {
      total = SENSORI_IDS.length;
      nilai = SENSORI_IDS.map((id) => a.sensori[id]).filter(nilaiAda).map((v) => skorItem(sk.sensori, v));
    } else if (d.area === 'refleks') {
      total = REFLEKS_IDS.length;
      nilai = REFLEKS_IDS.map((id) => a.refleks[id]).filter(nilaiAda).map((v) => skorItem(sk.refleks, v));
    } else {
      total = itemProgram.length;
      nilai = itemProgram.map((it) => a.program[it.id]).filter(nilaiAda).map((v) => skorItem(sk.program, v));
    }
    hasil[d.id] = { skor: rata(nilai), cakupan: { teramati: nilai.length, total } };
  }
  return hasil;
}

/** Overall score of one assessment = mean of its non-null domain scores. */
export function skorKeseluruhan(per: Record<DomainId, SkorDomainWaktu>): number | null {
  return rata(Object.values(per).map((d) => d.skor).filter((x): x is number => x !== null));
}

export function hitungSkor(input: LaporanInput, set: SetSkala): HasilSkor {
  const itemProgram = semuaItemProgram(input.programTambahan);
  const awal = skorAsesmen(input.sebelum, set, itemProgram);
  const akhir = skorAsesmen(input.sesudah, set, itemProgram);

  const domain: SkorDomain[] = DOMAIN.map((d) => {
    const a = awal[d.id];
    const b = akhir[d.id];
    const awalBulat = bulat(a.skor);
    const akhirBulat = bulat(b.skor);
    return {
      id: d.id, nama: d.nama, namaSingkat: d.namaSingkat,
      awal: a.skor, akhir: b.skor, awalBulat, akhirBulat,
      selisih: awalBulat !== null && akhirBulat !== null ? akhirBulat - awalBulat : null,
      cakupanAwal: a.cakupan, cakupanAkhir: b.cakupan,
      bertanda: a.cakupan.teramati < b.cakupan.teramati,
    };
  });

  const kAwal = skorKeseluruhan(awal);
  const kAkhir = skorKeseluruhan(akhir);
  const kAwalBulat = bulat(kAwal);
  const kAkhirBulat = bulat(kAkhir);

  const sp = set.skala.program;
  const bab: SkorBab[] = BAB_PROGRAM.map((b) => {
    const items = itemProgram.filter((i) => i.bab === b.bab);
    const nilaiAwal = items.map((i) => input.sebelum.program[i.id]).filter(nilaiAda);
    const nilaiAkhir = items.map((i) => input.sesudah.program[i.id]).filter(nilaiAda);
    const sAwal = rata(nilaiAwal.map((v) => skorItem(sp, v)));
    const sAkhir = rata(nilaiAkhir.map((v) => skorItem(sp, v)));
    const tuntas = nilaiAkhir.length === items.length && nilaiAkhir.every((v) => peringkat(sp, v) >= 3);
    return {
      bab: b.bab, nama: b.nama, namaInggris: b.namaInggris,
      awal: sAwal, akhir: sAkhir, awalBulat: bulat(sAwal), akhirBulat: bulat(sAkhir),
      diberikanAwal: nilaiAwal.length, diberikan: nilaiAkhir.length, total: items.length,
      teksDiberikan: `${nilaiAkhir.length} dari ${items.length} aktivitas sudah diberikan`,
      tuntas,
    };
  });
  const belumTuntas = bab.find((b) => !b.tuntas);
  const posisi = belumTuntas ?? bab[bab.length - 1]!;

  const semuaAsesmen = [...(input.riwayat ?? []), input.sebelum, input.sesudah];
  const tren: TitikTren[] = semuaAsesmen.map((a, i) => {
    const s = skorKeseluruhan(skorAsesmen(a, set, itemProgram));
    return { urutan: i + 1, tanggal: a.tanggal, tanggalTeks: formatTanggal(a.tanggal), label: formatBulan(a.tanggal), skor: s, skorBulat: bulat(s) };
  });

  return {
    domain,
    keseluruhan: {
      awal: kAwal, akhir: kAkhir, awalBulat: kAwalBulat, akhirBulat: kAkhirBulat,
      selisih: kAwalBulat !== null && kAkhirBulat !== null ? kAkhirBulat - kAwalBulat : null,
    },
    bab,
    posisiSaatIni: { bab: posisi.bab, nama: posisi.nama, semuaTuntas: !belumTuntas },
    tren,
    perluCatatanCakupan: domain.some((d) => d.bertanda),
  };
}

