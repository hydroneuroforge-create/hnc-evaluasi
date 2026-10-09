// siapkanLaporan(input) -> LaporanSiap: the ONLY object the renderer reads. Every string, number, label,
// chart datum and paragraph is prepared here; the renderer does no clinical logic.
import { APA_ARTINYA, JUDUL_APA_ARTINYA } from './bank/apa-artinya.ts';
import { CARA_MEMBACA, KETERANGAN_SKALA, LABEL_PROGRAM_INDIVIDUAL, LABEL_WAKTU, LABEL_ZONA, STATUS } from './bank/cara-membaca.ts';
import { GLOSARIUM } from './bank/glosarium.ts';
import { BANK_KEGIATAN, TEKS_TDO_KARTU_AWAL, TEKS_TDO_KARTU_LANJUTAN } from './bank/kegiatan.ts';
import type { KategoriPerkembangan } from './bank/kesimpulan.ts';
import type { KelasPerubahan } from './bank/refleks.ts';
import { buatKonteks, type Konteks } from './generator/konteks.ts';
import { teksKegiatanSebelum, teksKegiatanSesudah, type VarianKegiatan } from './generator/kegiatan.ts';
import { buatKesimpulan, buatRingkasanOrtu, buatTarget, pilihRekomendasi, type KesimpulanSiap, type RingkasanOrtuSiap, type TargetSiap } from './generator/kesimpulan.ts';
import { gambaranRefleks, kelasPerubahan, pengantarGambaran, ringkasanRefleks, type GambaranRefleks } from './generator/refleks.ts';
import { pilihSorotan } from './generator/sorotan.ts';
import { kalimatKontak, KLINIK, type Penandatangan, type ProfilKlinik } from './klinik.ts';
import { KEGIATAN } from './master/kegiatan.ts';
import { BAB_PROGRAM, namaItemProgram } from './master/program.ts';
import { REFLEKS } from './master/refleks.ts';
import { SENSORI } from './master/sensori.ts';
import { periksaNama, type TemuanNama } from './nama.ts';
import {
  ambilSetSkala, labelLegenda, labelLevel, peringkat, semuaNaik, urutanLegenda, urutanSumbu, zonaLevel,
  type DefinisiSkala, type SetSkala, type SkalaId, type Zona,
} from './skala.ts';
import { CATATAN_CAKUPAN, statusItem, type HasilSkor, type StatusItem } from './skor.ts';
import { formatPeriode, formatTanggal, formatTanggalPanjang, formatUsia, hitungUsia, parseIso } from './tanggal.ts';
import { buatParagraf, keRuns, teksPolos } from './teks.ts';
import type { KegiatanId, LaporanInput, Level, NilaiKegiatan, OpsiSiapkan, Paragraf, RefleksId, Run, SensoriId } from './types.ts';
import { validasiInput } from './validasi.ts';

// --- view-model types ------------------------------------------------------------------------------------
export interface NilaiTampil {
  /** Raw value in the selected scale convention; null = not observed / not given. */
  nilai: Level | null;
  /** Rank 1 (least) … 4 (most developed); drives chart position. */
  peringkat: Level | null;
  label: string | null;
  zona: Zona | null;
}

export interface StatusTampil { kode: StatusItem; label: string }

export interface KartuKegiatan {
  id: KegiatanId;
  no: number;
  nama: Run[];
  domain: string;
  status: StatusTampil;
  sebelum: NilaiTampil & { tdo: boolean; teksTdo?: string; paragraf: Paragraf };
  sesudah: NilaiTampil & { tdo: boolean; teksTdo?: string; paragraf: Paragraf; varian: VarianKegiatan };
}

export interface CalloutTdo { paragraf: Paragraf; nomor: number[]; teksNomor: string }

export interface BarisSensori {
  id: SensoriId; no: number; nama: string;
  sebelum: NilaiTampil; sesudah: NilaiTampil; status: StatusTampil;
  kategoriSebelum: string | null; kategoriSesudah: string | null;
  apaArtinya: Paragraf | null;
}

export interface BarisRefleks {
  id: RefleksId; no: number; nama: Run[];
  sebelum: NilaiTampil; sesudah: NilaiTampil; status: StatusTampil; kelas: KelasPerubahan | null;
}

export interface ItemProgramTampil {
  id: string; no: number; posisi?: string; aktivitas: string; namaLengkap: string; targetRefleks: string; manfaat?: string;
  individual: boolean; catatanFisioterapis?: string;
  sebelum: NilaiTampil; sesudah: NilaiTampil; status: StatusTampil;
}

export interface BabProgramTampil {
  bab: 1 | 2 | 3; nama: string; namaInggris: string; judul: string;
  kolomManfaat: boolean; kolomAktivitas: string; kolomTarget: string;
  skor: HasilSkor['bab'][number];
  posisiSaatIni: boolean;
  item: ItemProgramTampil[];
}

export interface LegendaSkala { skala: SkalaId; judul: string; baris: { nilai: Level; label: string; zona: Zona; paragraf: Paragraf }[] }

export interface LaporanSiap {
  meta: {
    judul: string; penulis: string; pembuat: string; produser: string; bahasa: 'id';
    nomor: string; tempat: string; tanggal: string; tanggalIso: string; setSkala: 'A' | 'B';
  };
  klinik: ProfilKlinik & { kalimatKontak: string };
  /** Scale definitions: charts read direction, axis order, labels and zones from here. */
  skala: SetSkala;
  sumbu: Record<SkalaId, Level[]>;
  anak: {
    namaLengkap: string; namaPanggilan: string; sapaan: string; sapaanLengkap: string;
    tempatTanggalLahir: string; jenisKelamin: string; usia: string; diagnosa: Run[];
  };
  periode: { awal: string; akhir: string; awalPanjang: string; akhirPanjang: string; teks: string };
  jumlahSesi: number;
  jumlahSesiTeks: string;
  label: { sebelum: string; sesudah: string; programIndividual: string };
  skor: HasilSkor;
  kategori: KategoriPerkembangan;
  ringkasan: RingkasanOrtuSiap;
  caraMembaca: {
    satuAturan: boolean;
    aturan: string;
    penjelasan: Paragraf;
    skala: { id: SkalaId; judul: string; arah: string; tampilan: string; legenda: LegendaSkala }[];
    dikecualikan: Paragraf; warna: Paragraf; skor: Paragraf;
    status: { kode: StatusItem; label: string; keterangan: string }[];
    zona: { zona: Zona; label: string }[];
  };
  kegiatan: { calloutSebelum: CalloutTdo | null; calloutSesudah: CalloutTdo | null; kartu: KartuKegiatan[] };
  sensori: { baris: BarisSensori[]; legenda: LegendaSkala; judulApaArtinya: string };
  refleks: { baris: BarisRefleks[]; legenda: LegendaSkala; ringkasan: Paragraf[]; pengantar: Paragraf; gambaran: GambaranRefleks[] };
  program: { legenda: LegendaSkala; bab: BabProgramTampil[]; posisiSaatIni: HasilSkor['posisiSaatIni']; adaIndividual: boolean };
  tren: { titik: HasilSkor['tren']; domain: HasilSkor['domain']; sesiPerBulan: { bulan: string; label: string; jumlah: number }[] | null };
  kesimpulan: KesimpulanSiap;
  target: TargetSiap;
  glosarium: { istilah: Run[]; definisi: Paragraf }[];
  pengesahan: {
    tempatTanggal: Paragraf;
    penandatangan: (Penandatangan & { strTeks?: string })[];
    kontak: string;
  };
  catatanKaki: { cakupan: string | null };
  asumsi: string[];
  peringatan: string[];
}

// --- helpers ------------------------------------------------------------------------------------------------
const ada = (v: unknown): v is Level => typeof v === 'number';

function tampil(s: DefinisiSkala, v: NilaiKegiatan | Level | null | undefined, labelKhusus?: (v: Level) => string): NilaiTampil {
  if (!ada(v)) return { nilai: null, peringkat: null, label: null, zona: null };
  return { nilai: v, peringkat: peringkat(s, v), label: labelKhusus ? labelKhusus(v) : labelLevel(s, v), zona: zonaLevel(s, v) };
}

const status = (kode: StatusItem): StatusTampil => ({ kode, label: STATUS[kode].label });

function legenda(s: DefinisiSkala, judul: string, pola: (v: Level, label: string, teks: string) => string): LegendaSkala {
  return {
    skala: s.id, judul,
    baris: urutanLegenda(s).map((v) => {
      const lv = s.level[v];
      const tb = lv.legenda;
      return { nilai: v, label: lv.label, zona: lv.zona, paragraf: buatParagraf(`legenda.${s.id}.${v}`, pola(v, lv.label, tb?.teks ?? ''), tb?.sumber ?? 'BARU') };
    }),
  };
}

/** '4, 5, 10–14' */
function rentangNomor(xs: number[]): string {
  const hasil: string[] = [];
  for (let i = 0; i < xs.length; i++) {
    let j = i;
    while (j + 1 < xs.length && xs[j + 1] === xs[j]! + 1) j++;
    hasil.push(j - i >= 2 ? `${xs[i]}–${xs[j]}` : j > i ? `${xs[i]}, ${xs[j]}` : `${xs[i]}`);
    i = j;
  }
  return hasil.join(', ');
}

function sesiPerBulan(sesi: LaporanInput['sesi']): LaporanSiap['tren']['sesiPerBulan'] {
  if (!sesi?.length) return null;
  const peta = new Map<string, number>();
  for (const s of sesi) {
    const t = parseIso(s.tanggal);
    const kunci = `${t.tahun}-${String(t.bulan).padStart(2, '0')}`;
    peta.set(kunci, (peta.get(kunci) ?? 0) + 1);
  }
  const kunci = [...peta.keys()].sort();
  const [awal, akhir] = [kunci[0]!, kunci[kunci.length - 1]!];
  const hasil: { bulan: string; label: string; jumlah: number }[] = [];
  let [y, m] = awal.split('-').map(Number) as [number, number];
  for (;;) {
    const k = `${y}-${String(m).padStart(2, '0')}`;
    hasil.push({ bulan: k, label: formatTanggal(`${k}-01`).replace(/^1 /, ''), jumlah: peta.get(k) ?? 0 });
    if (k === akhir) break;
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return hasil;
}

// --- main ---------------------------------------------------------------------------------------------------
export function siapkanLaporan(input: LaporanInput, opsi: OpsiSiapkan = {}): LaporanSiap {
  const ketat = opsi.ketat ?? true;
  const peringatan: string[] = [];
  const galat = validasiInput(input);
  if (galat.length) {
    if (ketat) throw new Error(`Data laporan tidak valid:\n- ${galat.join('\n- ')}`);
    peringatan.push(...galat);
  }

  const set = ambilSetSkala(input.opsi?.setSkala);
  const k: Konteks = buatKonteks(input, set);
  const { kegiatan: sk, sensori: ss, refleks: sr, program: sp } = set.skala;
  const anak = input.anak;

  // Kegiatan
  const kartu: KartuKegiatan[] = KEGIATAN.map((d) => {
    const b = input.sebelum.kegiatan[d.id]?.level;
    const a = input.sesudah.kegiatan[d.id]?.level;
    const label = (v: Level) => BANK_KEGIATAN[d.id].level[v].label;
    const tb = teksKegiatanSebelum(k, d.id);
    const ta = teksKegiatanSesudah(k, d.id);
    return {
      id: d.id, no: d.no, nama: keRuns(d.nama), domain: d.domain,
      status: status(statusItem(sk, b, a)),
      sebelum: { ...tampil(sk, b, label), tdo: tb.tdo, ...(tb.tdo ? { teksTdo: TEKS_TDO_KARTU_AWAL } : {}), paragraf: tb.paragraf },
      sesudah: { ...tampil(sk, a, label), tdo: ta.tdo, ...(ta.tdo ? { teksTdo: TEKS_TDO_KARTU_LANJUTAN } : {}), paragraf: ta.paragraf, varian: ta.varian },
    };
  });
  const callout = (w: 'sebelum' | 'sesudah'): CalloutTdo | null => {
    const xs = kartu.filter((x) => x[w].tdo);
    if (!xs.length) return null;
    const nomor = xs.map((x) => x.no);
    return { paragraf: xs[0]![w].paragraf, nomor, teksNomor: `berlaku untuk kegiatan no. ${rentangNomor(nomor)}` };
  };

  // Sensori
  const sensori: BarisSensori[] = SENSORI.map((d) => {
    const b = input.sebelum.sensori[d.id];
    const a = input.sesudah.sensori[d.id];
    const arti = ada(a) ? APA_ARTINYA[d.id][peringkat(ss, a)] : null;
    return {
      id: d.id, no: d.no, nama: d.nama, sebelum: tampil(ss, b), sesudah: tampil(ss, a), status: status(statusItem(ss, b, a)),
      kategoriSebelum: ada(b) ? ss.level[b].kategori ?? null : null,
      kategoriSesudah: ada(a) ? ss.level[a].kategori ?? null : null,
      apaArtinya: arti ? buatParagraf(`apaArtinya.${d.id}`, arti.teks, arti.sumber) : null,
    };
  });

  // Refleks
  const refleks: BarisRefleks[] = REFLEKS.map((d) => {
    const b = input.sebelum.refleks[d.id];
    const a = input.sesudah.refleks[d.id];
    return { id: d.id, no: d.no, nama: keRuns(d.namaTabel), sebelum: tampil(sr, b), sesudah: tampil(sr, a), status: status(statusItem(sr, b, a)), kelas: kelasPerubahan(k, d.id) };
  });
  const gambaran = REFLEKS.map((d) => gambaranRefleks(k, d.id)).filter((g): g is GambaranRefleks => !!g);

  // Program
  const bab: BabProgramTampil[] = BAB_PROGRAM.map((b) => ({
    bab: b.bab, nama: b.nama, namaInggris: b.namaInggris, judul: `Chapter ${b.bab}: ${b.nama} (${b.namaInggris})`,
    kolomManfaat: b.kolomManfaat, kolomAktivitas: b.kolomAktivitas, kolomTarget: b.kolomTarget,
    skor: k.skor.bab.find((x) => x.bab === b.bab)!,
    posisiSaatIni: k.skor.posisiSaatIni.bab === b.bab,
    item: k.itemProgram.filter((x) => x.bab === b.bab).map((it) => {
      const vb = input.sebelum.program[it.id];
      const va = input.sesudah.program[it.id];
      return {
        id: it.id, no: it.no, ...(it.posisi ? { posisi: it.posisi } : {}), aktivitas: it.aktivitas, namaLengkap: namaItemProgram(it),
        targetRefleks: it.targetRefleks, ...(it.manfaat ? { manfaat: it.manfaat } : {}),
        individual: !!it.individual, ...(it.catatanFisioterapis ? { catatanFisioterapis: it.catatanFisioterapis } : {}),
        sebelum: tampil(sp, vb), sesudah: tampil(sp, va), status: status(statusItem(sp, vb, va, 'program')),
      };
    }),
  }));

  // Narratives
  const sorotan = pilihSorotan(k);
  const rekomendasi = pilihRekomendasi(k);
  const kesimpulan = buatKesimpulan(k, sorotan, rekomendasi);
  const ringkasan = buatRingkasanOrtu(k, sorotan, rekomendasi);
  const target = buatTarget(k);

  // Cara Membaca
  const satu = semuaNaik(set);
  const legKegiatan = legenda(sk, 'Kegiatan Evaluasi', (v, label, teks) => `**${labelLegenda(sk, v)}** ${label}. ${teks}`);
  const legSensori = legenda(ss, 'Sistem Sensorik', (v, _l, teks) => `**${labelLegenda(ss, v)}** ${teks}`);
  const legRefleks = legenda(sr, 'Refleks Primitif', (v, _l, teks) => `**${labelLegenda(sr, v)}** ${teks}`);
  const legProgram = legenda(sp, 'Program Hidroterapi', (v, label, teks) => `**${labelLegenda(sp, v)} ${label}** – ${teks}`);
  const legBySkala: Record<SkalaId, LegendaSkala> = { kegiatan: legKegiatan, sensori: legSensori, refleks: legRefleks, program: legProgram };
  const p = (id: string, tb: { teks: string; sumber: 'DOKUMEN' | 'BARU' }) => buatParagraf(id, tb.teks, tb.sumber);

  const KL = input.klinik ?? KLINIK;
  const pengesahanPenandatangan = KL.penandatangan.map((x) => ({ ...x, ...(x.str ? { strTeks: `STR: ${x.str}` } : {}) }));

  const siap: LaporanSiap = {
    meta: {
      judul: `Laporan Perkembangan Hidroterapi – ${anak.namaLengkap}`,
      penulis: KL.nama, pembuat: KL.aplikasi, produser: KLINIK.aplikasi, bahasa: 'id',
      nomor: input.laporan.nomor, tempat: input.laporan.tempat,
      tanggal: formatTanggal(input.laporan.tanggal), tanggalIso: input.laporan.tanggal, setSkala: set.id,
    },
    klinik: { ...KL, kalimatKontak: kalimatKontak(KL) },
    skala: set,
    sumbu: { kegiatan: urutanSumbu(sk), sensori: urutanSumbu(ss), refleks: urutanSumbu(sr), program: urutanSumbu(sp) },
    anak: {
      namaLengkap: anak.namaLengkap, namaPanggilan: anak.namaPanggilan,
      sapaan: k.nama.anandaPanggilan, sapaanLengkap: k.nama.anandaLengkap,
      tempatTanggalLahir: `${anak.tempatLahir}, ${formatTanggal(anak.tanggalLahir)}`,
      jenisKelamin: anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      usia: formatUsia(hitungUsia(anak.tanggalLahir, input.sesudah.tanggal)),
      diagnosa: keRuns(anak.diagnosa),
    },
    periode: {
      awal: formatTanggal(input.sebelum.tanggal), akhir: formatTanggal(input.sesudah.tanggal),
      awalPanjang: formatTanggalPanjang(input.sebelum.tanggal), akhirPanjang: formatTanggalPanjang(input.sesudah.tanggal),
      teks: formatPeriode(input.sebelum.tanggal, input.sesudah.tanggal),
    },
    jumlahSesi: input.laporan.jumlahSesi,
    jumlahSesiTeks: `${input.laporan.jumlahSesi} sesi`,
    label: { ...LABEL_WAKTU, programIndividual: LABEL_PROGRAM_INDIVIDUAL },
    skor: k.skor,
    kategori: kesimpulan.kategori,
    ringkasan,
    caraMembaca: {
      satuAturan: satu,
      aturan: (satu ? CARA_MEMBACA.aturanSatu : CARA_MEMBACA.aturanCampuran).teks,
      penjelasan: p('caraMembaca.penjelasan', satu ? CARA_MEMBACA.penjelasanSatu : CARA_MEMBACA.penjelasanCampuran),
      skala: (['kegiatan', 'sensori', 'refleks', 'program'] as const).map((id) => ({
        id, judul: KETERANGAN_SKALA[id].judul,
        arah: (set.skala[id].arah === 'naik' ? CARA_MEMBACA.arahNaik : CARA_MEMBACA.arahTurun).teks,
        tampilan: KETERANGAN_SKALA[id].tampilan.teks,
        legenda: legBySkala[id],
      })),
      dikecualikan: p('caraMembaca.dikecualikan', CARA_MEMBACA.dikecualikan),
      warna: p('caraMembaca.warna', CARA_MEMBACA.warna),
      skor: p('caraMembaca.skor', CARA_MEMBACA.skor),
      status: (Object.keys(STATUS) as StatusItem[]).map((kode) => ({ kode, label: STATUS[kode].label, keterangan: STATUS[kode].keterangan.teks })),
      zona: (['z4', 'z3', 'z2', 'z1'] as const).map((z) => ({ zona: z, label: LABEL_ZONA[z] })),
    },
    kegiatan: { calloutSebelum: callout('sebelum'), calloutSesudah: callout('sesudah'), kartu },
    sensori: { baris: sensori, legenda: legSensori, judulApaArtinya: JUDUL_APA_ARTINYA },
    refleks: { baris: refleks, legenda: legRefleks, ringkasan: ringkasanRefleks(k), pengantar: pengantarGambaran(k), gambaran },
    program: { legenda: legProgram, bab, posisiSaatIni: k.skor.posisiSaatIni, adaIndividual: k.itemProgram.some((x) => x.individual) },
    tren: { titik: k.skor.tren, domain: k.skor.domain, sesiPerBulan: sesiPerBulan(input.sesi) },
    kesimpulan,
    target,
    glosarium: GLOSARIUM.map((g, i) => ({ istilah: keRuns(g.istilah), definisi: buatParagraf(`glosarium.${i}`, g.definisi.teks, g.definisi.sumber) })),
    pengesahan: {
      tempatTanggal: buatParagraf('pengesahan.tanggal', `**${input.laporan.tempat}, ${formatTanggal(input.laporan.tanggal)}**`, 'DOKUMEN'),
      penandatangan: pengesahanPenandatangan,
      kontak: kalimatKontak(KL),
    },
    catatanKaki: { cakupan: k.skor.perluCatatanCakupan ? CATATAN_CAKUPAN : null },
    asumsi: [...(input.asumsi ?? [])],
    peringatan,
  };

  terapkanTeks(siap, input.teks);

  // Name guard over every generated text.
  const temuan = kumpulkanTeks(siap).flatMap((t) => periksaNama(t, anak));
  if (temuan.length) {
    const pesan = temuan.map((t: TemuanNama) => `nama tidak dikenal "Ananda ${t.kata}" … ${t.konteks} …`);
    if (ketat) throw new Error(`Pemeriksaan nama gagal:\n- ${pesan.join('\n- ')}`);
    peringatan.push(...pesan);
  }
  return siap;
}

const adalahParagraf = (o: Record<string, unknown>): o is Paragraf & Record<string, unknown> =>
  typeof o.id === 'string' && typeof o.markup === 'string' && Array.isArray(o.runs);

function jelajahParagraf(x: unknown, f: (p: Paragraf) => void): void {
  if (Array.isArray(x)) { x.forEach((y) => jelajahParagraf(y, f)); return; }
  if (!x || typeof x !== 'object') return;
  const o = x as Record<string, unknown>;
  if (adalahParagraf(o)) { f(o); return; }
  for (const [kk, v] of Object.entries(o)) if (kk !== 'skala') jelajahParagraf(v, f);
}

/** Applies therapist overrides (stable paragraph id -> markup) in place, after generation. */
export function terapkanTeks(siap: LaporanSiap, teks: Record<string, string> | undefined): void {
  if (!teks || !Object.keys(teks).length) return;
  jelajahParagraf(siap, (p) => {
    const baru = teks[p.id];
    if (baru === undefined) return;
    p.markup = baru;
    p.runs = keRuns(baru);
    p.sumber = 'INPUT';
  });
}

/** Every paragraph of the view model, unique by id, in document order (for the review/edit screen). */
export function daftarParagraf(siap: LaporanSiap): Paragraf[] {
  const hasil = new Map<string, Paragraf>();
  jelajahParagraf(siap, (p) => { if (!hasil.has(p.id)) hasil.set(p.id, p); });
  return [...hasil.values()];
}

/** Every human-readable text of the view model (for guards and checks). */
export function kumpulkanTeks(siap: LaporanSiap): string[] {
  const hasil: string[] = [];
  const jelajah = (x: unknown): void => {
    if (typeof x === 'string') { hasil.push(x); return; }
    if (Array.isArray(x)) { x.forEach(jelajah); return; }
    if (x && typeof x === 'object') {
      const o = x as Record<string, unknown>;
      if (typeof o.markup === 'string' && Array.isArray(o.runs)) { hasil.push(o.markup); return; }
      if (typeof o.teks === 'string' && Object.keys(o).every((kk) => kk === 'teks' || kk === 'tebal' || kk === 'miring')) { hasil.push(o.teks); return; }
      for (const [kk, v] of Object.entries(o)) if (kk !== 'skala') jelajah(v);
    }
  };
  jelajah({ ...siap, skala: undefined });
  return hasil;
}

/** Plain text of a paragraph (handy for previews/tests). */
export const teksParagraf = (p: Paragraf): string => teksPolos(p.markup);
