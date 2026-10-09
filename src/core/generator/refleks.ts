// Reflex 'Gambaran Perkembangan' paragraphs (PLAN.md §6.2) and the CNS Summary (§6.3).
import {
  AWALAN_FRASA, BANK_REFLEKS, PEMBUKA_UMUM, PENGANTAR_GAMBARAN, PENUTUP_TERBAIK, PENUTUP_UMUM, type KelasPerubahan,
} from '../bank/refleks.ts';
import { gabungDaftarRingkasan, RINGKASAN_REFLEKS } from '../bank/ringkasan-refleks.ts';
import { REFLEKS, refleksDef } from '../master/refleks.ts';
import { adalahTerbaik, kataArah, labelLevel, selisihPerbaikan, terbaik } from '../skala.ts';
import { semuaSyarat } from '../syarat.ts';
import { gabungDaftar, gabungKalimat } from '../teks.ts';
import type { BlokRefleks, Level, Paragraf, RefleksId } from '../types.ts';
import { isi, isiCatatan, keParagraf, type Konteks, type Potongan } from './konteks.ts';

export function kelasPerubahan(k: Konteks, id: RefleksId): KelasPerubahan | null {
  const b = k.input.sebelum.refleks[id];
  const a = k.input.sesudah.refleks[id];
  if (typeof b !== 'number' || typeof a !== 'number') return null;
  const s = k.set.skala.refleks;
  const d = selisihPerbaikan(s, b, a);
  if (d >= 3) return 'membaik3';
  if (d === 2) return 'membaik2';
  if (d === 1) return 'membaik1';
  if (d === 0) return adalahTerbaik(s, a) ? 'tetapTerbaik' : 'tetapBelum';
  return 'memburuk';
}

const membaik = (c: KelasPerubahan | null): boolean => c === 'membaik1' || c === 'membaik2' || c === 'membaik3';

export interface GambaranRefleks { id: RefleksId; judul: string; kelas: KelasPerubahan; paragraf: Paragraf }

export function gambaranRefleks(k: Konteks, id: RefleksId): GambaranRefleks | null {
  const kelas = kelasPerubahan(k, id);
  if (!kelas || kelas === 'tetapTerbaik') return null;
  const def = refleksDef(id);
  const bank = BANK_REFLEKS[id];
  const s = k.set.skala.refleks;
  const b = k.input.sebelum.refleks[id] as Level;
  const a = k.input.sesudah.refleks[id] as Level;
  const terbaikSesudah = adalahTerbaik(s, a);
  const narasi = k.input.narasi?.refleks?.[id];
  const sembunyi = new Set<BlokRefleks>(narasi?.sembunyikan ?? []);
  const token = { nama: def.namaKalimat, sebelum: b, sesudah: a, kataArah: kataArah(s) };
  const flag = { bukanTerbaik: !terbaikSesudah, terbaik: terbaikSesudah };
  const kode = `refleks.${id}`;
  const bagian: Potongan[] = [];

  // pembuka
  const khusus = bank.pembuka?.[kelas];
  const pakaiKhusus = khusus && (!terbaikSesudah || bank.pembukaSaatTerbaik);
  bagian.push(isi(k, `${kode}.pembuka`, pakaiKhusus ? khusus : PEMBUKA_UMUM[kelas], token, flag));

  if (membaik(kelas)) {
    if (bank.keterangan) bagian.push(isi(k, `${kode}.keterangan`, bank.keterangan, token, flag));
    if (!sembunyi.has('bukti')) {
      if (bank.bukti && semuaSyarat(bank.bukti.syarat, k.syarat)) {
        bagian.push(isi(k, `${kode}.bukti`, bank.bukti.teks, token, flag));
      } else {
        const aktif = bank.frasa.filter((f) => semuaSyarat(f.syarat, k.syarat)).map((f) => isi(k, `${kode}.frasa`, f.teks, token, flag));
        if (aktif.length) {
          const daftar = gabungDaftar(aktif.map((x) => x.markup), 'serta');
          bagian.push({ ...isi(k, `${kode}.frasaBukti`, AWALAN_FRASA, { ...token, daftar }, flag), sumber: 'BARU' });
        }
      }
    }
  }
  if (narasi?.catatan) bagian.push(isiCatatan(k, `${kode}.catatan`, narasi.catatan));
  if (!terbaikSesudah && bank.manfaat && !sembunyi.has('manfaat')) bagian.push(isi(k, `${kode}.manfaat`, bank.manfaat, token, flag));
  if (membaik(kelas) && bank.saran && !sembunyi.has('saran')) bagian.push(isi(k, `${kode}.saran`, bank.saran, token, flag));
  if (membaik(kelas) && !sembunyi.has('penutup')) {
    const tb = terbaikSesudah ? PENUTUP_TERBAIK : bank.penutup ?? PENUTUP_UMUM;
    bagian.push(isi(k, `${kode}.penutup`, tb, token, flag));
  }
  return { id, judul: def.judulGambaran, kelas, paragraf: keParagraf(`gambaran.${id}`, bagian, gabungKalimat) };
}

export function pengantarGambaran(k: Konteks): Paragraf {
  return keParagraf('gambaran.pengantar', [isi(k, 'gambaran.pengantar', PENGANTAR_GAMBARAN)], gabungKalimat);
}

/** Summary paragraphs: P1 (best at both), P2 (improved), optional P3 (unchanged below best / declined). */
export function ringkasanRefleks(k: Konteks): Paragraf[] {
  const s = k.set.skala.refleks;
  const hasil: Paragraf[] = [];
  const kelas = REFLEKS.map((r) => ({ r, c: kelasPerubahan(k, r.id) }));
  const tetap = kelas.filter((x) => x.c === 'tetapTerbaik');
  if (tetap.length) {
    const t = terbaik(s);
    hasil.push(keParagraf('ringkasanRefleks.tetapTerbaik', [isi(k, 'ringkasanRefleks.tetapTerbaik', RINGKASAN_REFLEKS.tetapTerbaik, {
      daftar: gabungDaftar(tetap.map((x) => x.r.namaRingkasan)),
      terbaik: t,
      labelTerbaik: s.labelDiRingkasan ? labelLevel(s, t) : undefined,
    })], gabungKalimat));
  }
  const naik = kelas.filter((x) => membaik(x.c));
  if (naik.length) {
    const items = naik.map((x) => isi(k, 'ringkasanRefleks.item', RINGKASAN_REFLEKS.item, {
      nama: x.r.namaRingkasan, sebelum: k.input.sebelum.refleks[x.r.id], sesudah: k.input.sesudah.refleks[x.r.id],
    }).markup);
    hasil.push(keParagraf('ringkasanRefleks.membaik', [isi(k, 'ringkasanRefleks.membaik', RINGKASAN_REFLEKS.membaik, { daftar: gabungDaftarRingkasan(items) })], gabungKalimat));
  }
  const lain = kelas.filter((x) => x.c === 'tetapBelum' || x.c === 'memburuk').map((x) => isi(k, `ringkasanRefleks.${x.c}`,
    x.c === 'tetapBelum' ? RINGKASAN_REFLEKS.tetapBelum : RINGKASAN_REFLEKS.memburuk,
    { nama: x.r.namaRingkasan, sebelum: k.input.sebelum.refleks[x.r.id], sesudah: k.input.sesudah.refleks[x.r.id] }));
  if (lain.length) hasil.push(keParagraf('ringkasanRefleks.lain', lain, gabungKalimat));
  return hasil;
}
