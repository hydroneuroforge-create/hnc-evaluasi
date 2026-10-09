// Input validation: returns readable (Indonesian) error messages; an empty list means valid.
import { KONDISI_AWAL } from './bank/kesimpulan.ts';
import { rekomendasiDef } from './bank/rekomendasi.ts';
import { ID_SOROTAN } from './generator/sorotan.ts';
import { kegiatanDef, tambahanKegiatan } from './master/kegiatan.ts';
import { semuaItemProgram } from './master/program.ts';
import { bulanValid, isoValid } from './tanggal.ts';
import { KEGIATAN_IDS, REFLEKS_IDS, SENSORI_IDS, type LaporanInput } from './types.ts';

const BLOK = new Set(['manfaat', 'saran', 'penutup', 'bukti']);
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isLevel = (x: unknown) => x === 1 || x === 2 || x === 3 || x === 4;
const isTeks = (x: unknown) => typeof x === 'string' && x.trim() !== '';

export function validasiInput(input: unknown): string[] {
  const e: string[] = [];
  if (!isObj(input)) return ['input harus berupa objek'];
  const x = input as Partial<LaporanInput> & Record<string, unknown>;
  if (x.versi !== 1) e.push('versi harus 1');
  if (x.opsi !== undefined) {
    if (!isObj(x.opsi)) e.push('opsi harus berupa objek');
    else {
      if (x.opsi.setSkala !== undefined && x.opsi.setSkala !== 'A' && x.opsi.setSkala !== 'B') e.push('opsi.setSkala harus "A" atau "B"');
      if (x.opsi.maksRekomendasi !== undefined && !(Number.isInteger(x.opsi.maksRekomendasi) && x.opsi.maksRekomendasi >= 1)) e.push('opsi.maksRekomendasi harus bilangan bulat ≥ 1');
    }
  }

  const l = x.laporan;
  if (!isObj(l)) e.push('laporan wajib diisi');
  else {
    if (!isTeks(l.nomor)) e.push('laporan.nomor wajib diisi');
    if (!isTeks(l.tempat)) e.push('laporan.tempat wajib diisi');
    if (typeof l.tanggal !== 'string' || !isoValid(l.tanggal)) e.push(`laporan.tanggal tidak valid: "${String(l.tanggal)}"`);
    if (l.jumlahSesi !== undefined && !(Number.isInteger(l.jumlahSesi) && (l.jumlahSesi as number) >= 0)) e.push('laporan.jumlahSesi harus bilangan bulat ≥ 0');
    if (l.periode !== undefined) {
      const p = l.periode as { awal?: unknown; akhir?: unknown };
      if (!isObj(p) || typeof p.awal !== 'string' || typeof p.akhir !== 'string' || !bulanValid(p.awal) || !bulanValid(p.akhir)) e.push('laporan.periode harus { awal, akhir } berformat YYYY-MM');
      else if (p.awal > p.akhir) e.push('laporan.periode.awal tidak boleh setelah akhir');
    }
    if (!isObj(l.evaluasiBerikutnya) || !(Number.isInteger(l.evaluasiBerikutnya.setelahSesi) && (l.evaluasiBerikutnya.setelahSesi as number) >= 1)) {
      e.push('laporan.evaluasiBerikutnya.setelahSesi harus bilangan bulat ≥ 1');
    }
  }

  const a = x.anak;
  if (!isObj(a)) e.push('anak wajib diisi');
  else {
    for (const f of ['namaLengkap', 'namaPanggilan', 'tempatLahir', 'diagnosa'] as const) if (!isTeks(a[f])) e.push(`anak.${f} wajib diisi`);
    if (typeof a.tanggalLahir !== 'string' || !isoValid(a.tanggalLahir)) e.push(`anak.tanggalLahir tidak valid: "${String(a.tanggalLahir)}"`);
    if (a.jenisKelamin !== 'L' && a.jenisKelamin !== 'P') e.push('anak.jenisKelamin harus "L" atau "P"');
    if (a.mitraYasi !== undefined && typeof a.mitraYasi !== 'boolean') e.push('anak.mitraYasi harus true atau false');
  }

  const tambahanProgram = Array.isArray(x.programTambahan) ? x.programTambahan : [];
  if (x.programTambahan !== undefined && !Array.isArray(x.programTambahan)) e.push('programTambahan harus berupa daftar');
  for (const [i, p] of tambahanProgram.entries()) {
    if (!isObj(p) || !isTeks(p.id) || !isTeks(p.aktivitas) || ![1, 2, 3].includes(p.bab as number) || !Number.isInteger(p.no)) {
      e.push(`programTambahan[${i}] harus memiliki id, bab (1–3), no, dan aktivitas`);
    }
  }
  const idProgram = new Set(semuaItemProgram(tambahanProgram.filter(isObj) as never).map((p) => p.id));
  if (idProgram.size !== semuaItemProgram().length + tambahanProgram.length) e.push('id programTambahan bentrok dengan id lain');

  const cekAsesmen = (nama: string, s: unknown) => {
    if (!isObj(s)) { e.push(`${nama} wajib diisi`); return; }
    if (typeof s.tanggal !== 'string' || !isoValid(s.tanggal)) e.push(`${nama}.tanggal tidak valid: "${String(s.tanggal)}"`);
    const kg = s.kegiatan;
    if (!isObj(kg)) e.push(`${nama}.kegiatan wajib diisi`);
    else {
      for (const id of Object.keys(kg)) if (!(KEGIATAN_IDS as readonly string[]).includes(id)) e.push(`${nama}.kegiatan: id tidak dikenal "${id}"`);
      for (const id of KEGIATAN_IDS) {
        const v = kg[id];
        if (!isObj(v)) { e.push(`${nama}.kegiatan.${id} wajib diisi`); continue; }
        if (!(isLevel(v.level) || v.level === 'tdo')) e.push(`${nama}.kegiatan.${id}.level harus 1–4 atau "tdo"`);
        if (v.slot !== undefined) {
          if (!isObj(v.slot)) e.push(`${nama}.kegiatan.${id}.slot harus berupa objek`);
          else for (const [sid, sv] of Object.entries(v.slot)) {
            if (!kegiatanDef(id).slot.some((d) => d.id === sid)) e.push(`${nama}.kegiatan.${id}.slot: isian tidak dikenal "${sid}"`);
            if (typeof sv !== 'string') e.push(`${nama}.kegiatan.${id}.slot.${sid} harus teks`);
          }
        }
        if (v.tambahan !== undefined) {
          if (!Array.isArray(v.tambahan)) e.push(`${nama}.kegiatan.${id}.tambahan harus berupa daftar`);
          else for (const t of v.tambahan) if (!tambahanKegiatan(id).some((d) => d.id === t)) e.push(`${nama}.kegiatan.${id}.tambahan: kalimat tidak dikenal "${String(t)}"`);
        }
        if (v.catatan !== undefined && typeof v.catatan !== 'string') e.push(`${nama}.kegiatan.${id}.catatan harus teks`);
      }
    }
    const cekNilai = (grup: 'sensori' | 'refleks', ids: readonly string[]) => {
      const g = s[grup];
      if (!isObj(g)) { e.push(`${nama}.${grup} wajib diisi`); return; }
      for (const id of Object.keys(g)) if (!ids.includes(id)) e.push(`${nama}.${grup}: id tidak dikenal "${id}"`);
      for (const id of ids) if (!(id in g) || !(g[id] === null || isLevel(g[id]))) e.push(`${nama}.${grup}.${id} harus 1–4 atau null`);
    };
    cekNilai('sensori', SENSORI_IDS);
    cekNilai('refleks', REFLEKS_IDS);
    const pr = s.program;
    if (!isObj(pr)) e.push(`${nama}.program wajib diisi`);
    else for (const [id, v] of Object.entries(pr)) {
      if (!idProgram.has(id)) e.push(`${nama}.program: id tidak dikenal "${id}"`);
      if (!(v === null || isLevel(v))) e.push(`${nama}.program.${id} harus 1–4 atau null`);
    }
  };
  cekAsesmen('sebelum', x.sebelum);
  cekAsesmen('sesudah', x.sesudah);
  if (x.riwayat !== undefined) {
    if (!Array.isArray(x.riwayat)) e.push('riwayat harus berupa daftar');
    else x.riwayat.forEach((r, i) => cekAsesmen(`riwayat[${i}]`, r));
  }
  if (x.sesi !== undefined) {
    if (!Array.isArray(x.sesi)) e.push('sesi harus berupa daftar');
    else x.sesi.forEach((s, i) => { if (!isObj(s) || typeof s.tanggal !== 'string' || !isoValid(s.tanggal)) e.push(`sesi[${i}].tanggal tidak valid`); });
  }

  const n = x.narasi;
  if (n !== undefined) {
    if (!isObj(n)) e.push('narasi harus berupa objek');
    else {
      for (const id of (n.kondisiAwal as unknown[] | undefined) ?? []) if (!KONDISI_AWAL.some((k) => k.id === id)) e.push(`narasi.kondisiAwal: id tidak dikenal "${String(id)}"`);
      for (const id of (n.sorotan as unknown[] | undefined) ?? []) if (!ID_SOROTAN.includes(id as string)) e.push(`narasi.sorotan: id tidak dikenal "${String(id)}"`);
      for (const f of ['rekomendasi', 'rekomendasiNonaktif'] as const) {
        for (const id of (n[f] as unknown[] | undefined) ?? []) if (!rekomendasiDef(id as string)) e.push(`narasi.${f}: id tidak dikenal "${String(id)}"`);
      }
      if (n.refleks !== undefined) {
        if (!isObj(n.refleks)) e.push('narasi.refleks harus berupa objek');
        else for (const [id, v] of Object.entries(n.refleks)) {
          if (!(REFLEKS_IDS as readonly string[]).includes(id)) e.push(`narasi.refleks: id tidak dikenal "${id}"`);
          if (!isObj(v)) { e.push(`narasi.refleks.${id} harus berupa objek`); continue; }
          if (v.catatan !== undefined && typeof v.catatan !== 'string') e.push(`narasi.refleks.${id}.catatan harus teks`);
          for (const b of (v.sembunyikan as unknown[] | undefined) ?? []) if (!BLOK.has(b as string)) e.push(`narasi.refleks.${id}.sembunyikan: bagian tidak dikenal "${String(b)}"`);
        }
      }
    }
  }

  const sf = x.sertifikat;
  if (sf !== undefined) {
    if (!isObj(sf) || !isTeks(sf.pencapaian) || !isTeks(sf.tempat) || typeof sf.tanggal !== 'string' || !isoValid(sf.tanggal)) {
      e.push('sertifikat harus memiliki pencapaian, tempat, dan tanggal yang valid');
    }
  }
  return e;
}
