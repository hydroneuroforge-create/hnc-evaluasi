// Kegiatan narratives (PLAN.md §6.1).
import { BANK_KEGIATAN, besaranUntuk, TEKS_TDO, teksTambahan, VARIAN_UMUM } from '../bank/kegiatan.ts';
import { tambahanKegiatan } from '../master/kegiatan.ts';
import { selisihPerbaikan } from '../skala.ts';
import { gabungKalimat, kecilAwal } from '../teks.ts';
import type { Asesmen, KegiatanId, Paragraf, TeksBank } from '../types.ts';
import { isi, isiCatatan, keParagraf, type Konteks, type Potongan, type Token } from './konteks.ts';

export type VarianKegiatan = 'tdo' | 'sebelum' | 'tanpaSebelum' | 'naik' | 'sama' | 'turun';

export interface TeksKegiatan { paragraf: Paragraf; tdo: boolean; varian: VarianKegiatan; spesifik: boolean }

const tokenSlot = (a: Asesmen, id: KegiatanId): Token => ({ ...(a.kegiatan[id]?.slot ?? {}) });

function bagianTdo(k: Konteks, id: string, a: Asesmen): Potongan {
  return isi(k, `${id}.tdo`, TEKS_TDO, { alasanTdo: a.alasanTdo });
}

/** Add-ons selected in `a` (definition order), then the free-text note. */
function bagianTambahan(k: Konteks, id: KegiatanId, a: Asesmen, token: Token, flag: Record<string, boolean>): Potongan[] {
  const nilai = a.kegiatan[id];
  const dipilih = new Set(nilai?.tambahan ?? []);
  const hasil: Potongan[] = [];
  for (const t of tambahanKegiatan(id)) {
    if (!dipilih.has(t.id)) continue;
    const tb = teksTambahan(id, t.id);
    if (!tb) throw new Error(`kegiatan ${id}: kalimat tambahan "${t.id}" tidak ada di bank`);
    hasil.push(isi(k, `${id}.tambahan.${t.id}`, tb, token, flag));
  }
  if (nilai?.catatan) hasil.push(isiCatatan(k, `${id}.catatan`, nilai.catatan));
  return hasil;
}

export function teksKegiatanSebelum(k: Konteks, id: KegiatanId): TeksKegiatan {
  const a = k.input.sebelum;
  const v = a.kegiatan[id]?.level;
  if (v === undefined || v === 'tdo') {
    return { paragraf: keParagraf(`kegiatan.${id}.sebelum`, [bagianTdo(k, id, a)], gabungKalimat), tdo: true, varian: 'tdo', spesifik: false };
  }
  const token = { ...tokenSlot(a, id) };
  const inti = isi(k, `${id}.L${v}.sebelum`, BANK_KEGIATAN[id].level[v].sebelum, token);
  return {
    paragraf: keParagraf(`kegiatan.${id}.sebelum`, [inti, ...bagianTambahan(k, id, a, token, {})], gabungKalimat),
    tdo: false, varian: 'sebelum', spesifik: true,
  };
}

/** Flags available to AFTER templates: selected add-ons + derived '<kegiatan>Membaik'. */
function flagSesudah(k: Konteks, id: KegiatanId): Record<string, boolean> {
  const f: Record<string, boolean> = {};
  for (const t of k.input.sesudah.kegiatan[id]?.tambahan ?? []) f[t] = true;
  const sk = k.set.skala.kegiatan;
  for (const [kid, nilai] of Object.entries(k.input.sesudah.kegiatan)) {
    const b = k.input.sebelum.kegiatan[kid as KegiatanId]?.level;
    if (typeof b === 'number' && typeof nilai.level === 'number') f[`${kid}Membaik`] = selisihPerbaikan(sk, b, nilai.level) > 0;
  }
  return f;
}

export function teksKegiatanSesudah(k: Konteks, id: KegiatanId): TeksKegiatan {
  const a = k.input.sesudah;
  const nilai = a.kegiatan[id];
  const v = nilai?.level;
  if (v === undefined || v === 'tdo') {
    return { paragraf: keParagraf(`kegiatan.${id}.sesudah`, [bagianTdo(k, id, a)], gabungKalimat), tdo: true, varian: 'tdo', spesifik: false };
  }
  const L = BANK_KEGIATAN[id].level;
  const lv = L[v];
  const b = k.input.sebelum.kegiatan[id]?.level;
  const flag = flagSesudah(k, id);
  const token: Token = { ...tokenSlot(a, id) };
  const kode = `${id}.L${v}`;
  const inti = (): Potongan => isi(k, `${kode}.sesudah`, lv.sesudah ?? lv.sebelum, token, flag);

  let utama: Potongan;
  let varian: VarianKegiatan;
  let spesifik = true;
  if (b === undefined || b === 'tdo') {
    varian = 'tanpaSebelum';
    utama = lv.sesudahTanpaSebelum ? isi(k, `${kode}.sesudahTanpaSebelum`, lv.sesudahTanpaSebelum, token, flag) : inti();
  } else {
    const d = selisihPerbaikan(k.set.skala.kegiatan, b, v);
    token.ringkasSebelum = L[b].ringkas;
    token.besaran = besaranUntuk(d);
    const pakai = (tb: TeksBank | undefined, umum: TeksBank, nama: string): Potongan => {
      if (tb) return isi(k, `${kode}.${nama}`, tb, token, flag);
      spesifik = false;
      const i = inti();
      const isiInti = nama === 'sesudahNaik' ? kecilAwal(i.markup) : i.markup;
      const u = isi(k, `${kode}.${nama}.umum`, umum, { ...token, inti: isiInti }, flag);
      return { markup: u.markup, sumber: i.sumber === umum.sumber ? umum.sumber : 'CAMPURAN' };
    };
    if (d > 0) { varian = 'naik'; utama = pakai(lv.sesudahNaik, VARIAN_UMUM.naik, 'sesudahNaik'); }
    else if (d === 0) { varian = 'sama'; utama = pakai(lv.sesudahSama, VARIAN_UMUM.sama, 'sesudahSama'); }
    else { varian = 'turun'; utama = pakai(lv.sesudahTurun, VARIAN_UMUM.turun, 'sesudahTurun'); }
  }
  return {
    paragraf: keParagraf(`kegiatan.${id}.sesudah`, [utama, ...bagianTambahan(k, id, a, token, flag)], gabungKalimat),
    tdo: false, varian, spesifik,
  };
}
