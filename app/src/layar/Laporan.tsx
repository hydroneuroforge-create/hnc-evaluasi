// Report: options + narrative review (every generated paragraph editable via stable-id overrides) -> PDF in the
// browser -> share. The full input is frozen in the report record so it re-renders identically later.
import { useEffect, useMemo, useRef, useState } from 'react';
import { bank, daftarParagraf, formatPeriodeBulan, KEGIATAN, periodeBulan, siapkanLaporan, teksPolos, type LaporanInput, type Paragraf } from '../../../src/core/index.ts';
import {
  ambilAnak, ambilEvaluasi, ambilLaporan, evaluasiAnak, hapus, idBaru, sesiAnak, simpan, tulisPengaturan,
  type Anak, type Evaluasi, type Laporan, type Sesi,
} from '../db.ts';
import { buatInput, evaluasiSelesai, hariIni, namaBerkas, tanggalTampil, terapkanMitra, type OpsiLaporan } from '../logika.ts';
import { catatNomor, konteksKlinik, nomorBerikutnya } from '../pengaturan.ts';
import { bagikanBerkas, Isian, Kartu, keRute, Layar, PilihBulan, toast, Tombol, unduhBerkas } from '../ui.tsx';

const muatPdf = () => import('../pdf.ts');

const GRUP: [string, string][] = [
  ['ringkasOrtu', 'Ringkasan untuk orang tua'], ['sorotan', 'Sorotan perkembangan'], ['kesimpulan', 'Kesimpulan'],
  ['rekomendasi', 'Rekomendasi'], ['target', 'Target'], ['kegiatan', 'Kegiatan evaluasi'], ['apaArtinya', 'Sistem sensorik – apa artinya'],
  ['ringkasanRefleks', 'Ringkasan refleks'], ['gambaran', 'Gambaran perkembangan refleks'],
];

function labelParagraf(id: string): string {
  const [g, a, b] = id.split('.');
  if (g === 'kegiatan') return `${teksPolos(KEGIATAN.find((k) => k.id === a)?.nama ?? a ?? '')} – ${b === 'sebelum' ? 'Evaluasi Awal' : 'Evaluasi Lanjutan'}`;
  return [a, b].filter(Boolean).join(' · ').replace(/^kegiatan:/, '') || g!;
}

interface Konteks { anak: Anak; ev: Evaluasi; semua: Evaluasi[]; sesi: Sesi[] }

/** New report from a finished Evaluasi Lanjutan. */
export function BuatLaporan({ evaluasiId }: { evaluasiId: string }) {
  const [k, setK] = useState<Konteks | null>(null);
  const [opsi, setOpsi] = useState<(Omit<OpsiLaporan, 'periode'> & { periode: { awal?: string; akhir?: string } }) | null>(null);
  const idLaporan = useRef(idBaru());
  useEffect(() => {
    void (async () => {
      const ev = await ambilEvaluasi(evaluasiId);
      if (!ev) return;
      const anak = (await ambilAnak(ev.anakId))!;
      const semua = await evaluasiAnak(ev.anakId);
      const sesi = await sesiAnak(ev.anakId);
      const sebelum = evaluasiSelesai(semua).filter((e) => e.id !== ev.id && e.asesmen.tanggal <= ev.asesmen.tanggal).pop();
      const tanggal = hariIni();
      setK({ anak, ev, semua, sesi });
      setOpsi({ nomor: await nomorBerikutnya(tanggal), tanggal, periode: { awal: anak.bergabungSejak ?? sebelum?.asesmen.tanggal.slice(0, 7) ?? ev.asesmen.tanggal.slice(0, 7), akhir: ev.asesmen.tanggal.slice(0, 7) }, kondisiAwal: [], teks: {} });
    })();
  }, [evaluasiId]);

  const [klinik, setKlinik] = useState<Awaited<ReturnType<typeof konteksKlinik>> | null>(null);
  useEffect(() => { void konteksKlinik().then(setKlinik); }, []);

  const { input, galat } = useMemo<{ input: LaporanInput | null; galat: string }>(() => {
    if (!k || !opsi || !klinik) return { input: null, galat: '' };
    const { awal, akhir } = opsi.periode;
    if (!awal || !akhir) return { input: null, galat: 'Lengkapi bulan dan tahun periode di laporan.' };
    if (awal > akhir) return { input: null, galat: 'Awal periode tidak boleh setelah akhir periode.' };
    try { return { input: buatInput(k.anak, k.semua, k.ev, k.sesi, { ...opsi, periode: { awal, akhir } }, klinik.klinik), galat: '' }; } catch (e) { return { input: null, galat: (e as Error).message }; }
  }, [k, opsi, klinik]);

  if (!k || !opsi) return null;
  const simpanLaporan = async (inp: LaporanInput): Promise<Laporan> => {
    const l: Laporan = { id: idLaporan.current, anakId: k.anak.id, evaluasiId: k.ev.id, nomor: inp.laporan.nomor, tanggal: inp.laporan.tanggal, input: inp, dibuat: Date.now() };
    await simpan('laporan', l);
    await catatNomor(l.nomor);
    await tulisPengaturan('perluCadangan', true);
    return l;
  };

  return (
    <Layar judul="Buat laporan" kembali={`/anak/${k.anak.id}`}>
      <Kartu className="space-y-4">
        <p className="text-[15px] text-lembut">Membandingkan evaluasi sebelumnya dengan evaluasi <b className="text-navy">{tanggalTampil(k.ev.asesmen.tanggal)}</b> untuk <b className="text-navy">{k.anak.namaLengkap}</b>.</p>
        <Isian label="Nomor laporan" value={opsi.nomor} onChange={(e) => setOpsi({ ...opsi, nomor: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Isian label="Tanggal laporan" type="date" value={opsi.tanggal} onChange={async (e) => {
            const t = e.target.value; if (!t) return;
            const otomatis = opsi.nomor === (await nomorBerikutnya(opsi.tanggal));
            setOpsi({ ...opsi, tanggal: t, ...(otomatis ? { nomor: await nomorBerikutnya(t) } : {}) });
          }} />
        </div>
        <div className="space-y-3">
          <span className="label">Periode di laporan</span>
          <PilihBulan label="Dari" nilai={opsi.periode.awal} onUbah={(awal) => setOpsi({ ...opsi, periode: { ...opsi.periode, awal } })} />
          <PilihBulan label="Sampai" nilai={opsi.periode.akhir} onUbah={(akhir) => setOpsi({ ...opsi, periode: { ...opsi.periode, akhir } })} />
          {opsi.periode.awal && opsi.periode.akhir && opsi.periode.awal <= opsi.periode.akhir
            ? <p className="text-[15px] text-navy" data-pratinjau-periode>Tertulis di laporan: <b>{formatPeriodeBulan(opsi.periode.awal, opsi.periode.akhir)}</b></p>
            : <p className="text-[14px] text-[#9b3b2f]">Periode belum lengkap atau awal setelah akhir.</p>}
        </div>
        <div>
          <span className="label">Kondisi awal Ananda (opsional)</span>
          {bank.KONDISI_AWAL.map((x) => {
            const on = opsi.kondisiAwal.includes(x.id);
            return (
              <label key={x.id} className="flex items-center gap-3 min-h-11">
                <input type="checkbox" className="size-5 accent-[#24546C]" checked={on} onChange={() => setOpsi({ ...opsi, kondisiAwal: on ? opsi.kondisiAwal.filter((y) => y !== x.id) : bank.KONDISI_AWAL.map((y) => y.id).filter((y) => y === x.id || opsi.kondisiAwal.includes(y)) })} />
                <span className="text-[15px]">{x.label}</span>
              </label>
            );
          })}
        </div>
        {klinik && !klinik.aktif ? <p className="text-[13px] text-[#7A5A12] bg-[#F6EBD3] rounded-xl p-3">Aplikasi belum diaktifkan: baris tanda tangan dan STR akan kosong. Aktifkan di Pengaturan.</p> : null}
      </Kartu>
      {galat ? <Kartu><p className="text-[#9b3b2f]">{galat}</p></Kartu> : null}
      {input ? <TinjauNarasi input={input} teks={opsi.teks} onTeks={(teks) => setOpsi({ ...opsi, teks })} /> : null}
      {input ? <PembuatPdf input={input} anak={k.anak} ttd={klinik?.ttd ?? {}} sebelumRender={simpanLaporan} /> : null}
    </Layar>
  );
}

/** Narrative review: every generated paragraph, editable; overrides keyed by stable paragraph id. */
function TinjauNarasi({ input, teks, onTeks }: { input: LaporanInput; teks: Record<string, string>; onTeks: (t: Record<string, string>) => void }) {
  const hasil = useMemo(() => {
    try { return { paragraf: daftarParagraf(siapkanLaporan({ ...input, teks: {} })), galat: '' }; } catch (e) { return { paragraf: [] as Paragraf[], galat: (e as Error).message }; }
  }, [input.anak, input.sebelum, input.sesudah, input.narasi, input.laporan]);
  if (hasil.galat) return <Kartu><p className="text-[#9b3b2f] whitespace-pre-wrap text-[14px]">{hasil.galat}</p></Kartu>;
  return (
    <Kartu className="space-y-2">
      <h2 className="font-bold text-navy text-[16px]">Tinjau narasi</h2>
      <p className="text-[14px] text-lembut">Semua teks otomatis bisa diubah. **tebal** dan _miring_ dipertahankan. Teks yang diubah ditandai titik hijau.</p>
      {GRUP.map(([g, judul]) => {
        const xs = hasil.paragraf.filter((p) => p.id.split(/[.:]/)[0] === g);
        if (!xs.length) return null;
        const diubah = xs.filter((p) => teks[p.id] !== undefined).length;
        return (
          <details key={g} className="rounded-xl border border-garis bg-latar/50">
            <summary className="min-h-12 px-4 flex items-center font-semibold text-petrol-tua cursor-pointer">{judul}<span className="ml-auto text-[13px] text-samar">{diubah ? `${diubah} diubah · ` : ''}{xs.length}</span></summary>
            <div className="p-3 space-y-4">
              {xs.map((p) => <EditorParagraf key={p.id} p={p} nilai={teks[p.id]} onUbah={(v) => {
                const t = { ...teks }; if (v === undefined) delete t[p.id]; else t[p.id] = v; onTeks(t);
              }} />)}
            </div>
          </details>
        );
      })}
    </Kartu>
  );
}

function EditorParagraf({ p, nilai, onUbah }: { p: Paragraf; nilai: string | undefined; onUbah: (v: string | undefined) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const isi = nilai ?? p.markup;
  const bungkus = (tanda: string) => {
    const el = ref.current; if (!el) return;
    const [a, b] = [el.selectionStart, el.selectionEnd];
    const v = `${isi.slice(0, a)}${tanda}${isi.slice(a, b)}${tanda}${isi.slice(b)}`;
    onUbah(v === p.markup ? undefined : v);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + tanda.length, b + tanda.length); });
  };
  return (
    <div data-paragraf={p.id}>
      <div className="flex items-center gap-2 mb-1">
        {nilai !== undefined ? <span className="size-2 rounded-full bg-aksen" aria-label="diubah" /> : null}
        <span className="text-[13px] font-semibold text-lembut flex-1 truncate">{labelParagraf(p.id)}</span>
        <button type="button" className="size-11 rounded-lg bg-white border border-garis font-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => bungkus('**')} aria-label="Tebal">B</button>
        <button type="button" className="size-11 rounded-lg bg-white border border-garis italic font-serif" onMouseDown={(e) => e.preventDefault()} onClick={() => bungkus('_')} aria-label="Miring">I</button>
      </div>
      <textarea ref={ref} className="isian min-h-28 text-[15px] leading-relaxed" value={isi} onChange={(e) => onUbah(e.target.value === p.markup ? undefined : e.target.value)} />
      {nilai !== undefined ? <button className="min-h-11 text-[13px] font-semibold text-petrol" onClick={() => onUbah(undefined)}>Kembalikan ke teks otomatis</button> : null}
    </div>
  );
}

/** Generates the PDF (progress), then offers Share / Open (iOS needs a fresh tap for the share sheet). */
function PembuatPdf({ input, anak, ttd, sebelumRender, labelTombol = 'Buat PDF laporan' }: {
  input: LaporanInput; anak: Anak; ttd: Record<string, string>; sebelumRender?: (i: LaporanInput) => Promise<Laporan>; labelTombol?: string;
}) {
  const [tahap, setTahap] = useState<'siap' | 'proses' | 'selesai'>('siap');
  const [pdf, setPdf] = useState<Uint8Array | null>(null);
  const [galat, setGalat] = useState('');
  const nama = namaBerkas('Laporan', anak.namaPanggilan, input.laporan.tanggal);
  const buat = async () => {
    setGalat(''); setTahap('proses');
    try {
      siapkanLaporan(input); // validates (incl. name guard) before saving
      const l = sebelumRender ? await sebelumRender(input) : null;
      const m = await muatPdf();
      const bytes = await m.buatPdfLaporan(input, ttd);
      setPdf(bytes); setTahap('selesai');
      if (l) { history.replaceState(null, '', `#/laporan/${l.id}`); toast('Laporan tersimpan. Jangan lupa mencadangkan data.'); }
    } catch (e) { setGalat((e as Error).message); setTahap('siap'); }
  };
  return (
    <Kartu className="space-y-3" >
      {tahap === 'proses' ? (
        <div role="progressbar" aria-label="Membuat PDF">
          <p className="text-[15px] font-semibold text-navy mb-2">Membuat PDF… (sekitar 10–30 detik)</p>
          <div className="h-2 rounded-full bg-latar overflow-hidden"><div className="h-full w-1/3 bg-aqua rounded-full animate-[geser_1.2s_ease-in-out_infinite]" /></div>
          <style>{'@keyframes geser{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}'}</style>
        </div>
      ) : null}
      {tahap !== 'proses' ? <Tombol className="w-full" onClick={() => void buat()}>{tahap === 'selesai' ? 'Buat ulang PDF' : labelTombol}</Tombol> : null}
      {pdf ? (
        <div className="space-y-2" data-pdf-bytes={pdf.length}>
          <p className="text-[14px] text-lembut">{nama} · {(pdf.length / 1024 / 1024).toFixed(2)} MB</p>
          <div className="grid grid-cols-2 gap-3">
            <Tombol varian="kedua" onClick={() => void bagikanBerkas(pdf, nama)}>Bagikan</Tombol>
            <Tombol varian="halus" onClick={() => unduhBerkas(pdf, nama)}>Buka / Unduh</Tombol>
          </div>
        </div>
      ) : null}
      {galat ? <p className="text-[#9b3b2f] text-[14px] whitespace-pre-wrap">{galat}</p> : null}
    </Kartu>
  );
}

/** Existing report: re-render from the frozen input, edit texts, certificate. */
export function LihatLaporan({ id }: { id: string }) {
  const [l, setL] = useState<Laporan | null>(null);
  const [anak, setAnak] = useState<Anak | null>(null);
  const [ttd, setTtd] = useState<Record<string, string>>({});
  const [ubahTeks, setUbahTeks] = useState(false);
  useEffect(() => {
    void (async () => {
      const x = await ambilLaporan(id); if (!x) return;
      setL(x); setAnak((await ambilAnak(x.anakId)) ?? null); setTtd((await konteksKlinik()).ttd);
    })();
  }, [id]);
  if (!l || !anak) return null;
  const setTeks = (teks: Record<string, string>) => { const b = { ...l, input: { ...l.input, teks } }; setL(b); void simpan('laporan', b); };
  return (
    <Layar judul="Laporan" kembali={`/anak/${anak.id}`}>
      <Kartu>
        <p className="font-bold text-navy text-[17px]">{l.nomor}</p>
        <p className="text-lembut text-[15px]">{anak.namaLengkap} · {tanggalTampil(l.tanggal)} · {formatPeriodeBulan(periodeBulan(l.input).awal, periodeBulan(l.input).akhir)}</p>
        <p className="text-[13px] text-samar mt-1">Isi laporan dibekukan saat dibuat, sehingga PDF yang dibuat ulang tetap sama.</p>
        {anak.mitraYasi ? <p className="text-[13px] text-samar mt-1">Logo YASI ditampilkan di sampul, lembar pengesahan dan sertifikat (atur di data anak).</p> : null}
      </Kartu>
      <PembuatPdf input={terapkanMitra(l.input, anak)} anak={anak} ttd={ttd} labelTombol="Buka PDF laporan" />
      <Tombol varian="halus" className="w-full" onClick={() => setUbahTeks(!ubahTeks)}>{ubahTeks ? 'Selesai mengubah teks' : 'Ubah teks laporan'}</Tombol>
      {ubahTeks ? <TinjauNarasi input={l.input} teks={l.input.teks ?? {}} onTeks={setTeks} /> : null}
      <SertifikatKartu l={l} anak={anak} ttd={ttd} onSimpan={(s) => { const b = { ...l, sertifikat: s }; setL(b); void simpan('laporan', b); }} />
      <Tombol varian="bahaya" className="w-full" onClick={async () => { if (confirm('Hapus laporan ini? Evaluasinya tetap tersimpan.')) { await hapus('laporan', l.id); keRute(`/anak/${anak.id}`); } }}>Hapus laporan</Tombol>
    </Layar>
  );
}

function saranPencapaian(l: Laporan): string {
  try {
    const judul = daftarParagraf(siapkanLaporan(l.input)).filter((p) => /^sorotan\..*\.judul$/.test(p.id)).map((p) => teksPolos(p.markup).replace(/[.:]$/, '').toLowerCase());
    const daftar = judul.length > 1 ? `${judul.slice(0, -1).join(', ')} dan ${judul[judul.length - 1]}` : judul[0] ?? 'kemampuannya';
    return `menunjukkan perkembangan pada ${daftar} selama program hidroterapi`;
  } catch { return 'menunjukkan perkembangan yang membanggakan selama program hidroterapi'; }
}

function SertifikatKartu({ l, anak, ttd, onSimpan }: { l: Laporan; anak: Anak; ttd: Record<string, string>; onSimpan: (s: NonNullable<Laporan['sertifikat']>) => void }) {
  const s = l.sertifikat ?? { pencapaian: saranPencapaian(l), tanggal: l.tanggal };
  const [proses, setProses] = useState<'' | 'a4' | 'sosial'>('');
  const [hasil, setHasil] = useState<{ varian: 'a4' | 'sosial'; pdf: Uint8Array } | null>(null);
  const [galat, setGalat] = useState('');
  const buat = async (varian: 'a4' | 'sosial') => {
    setProses(varian); setGalat('');
    try {
      const input: LaporanInput = { ...terapkanMitra(l.input, anak), sertifikat: { pencapaian: s.pencapaian, tanggal: s.tanggal, tempat: l.input.laporan.tempat } };
      setHasil({ varian, pdf: await (await muatPdf()).buatPdfSertifikat(input, ttd, varian) });
    } catch (e) { setGalat((e as Error).message); }
    setProses('');
  };
  const nama = hasil ? namaBerkas('Sertifikat', anak.namaPanggilan, s.tanggal, hasil.varian === 'sosial' ? '-sosial' : '') : '';
  return (
    <Kartu className="space-y-3">
      <h2 className="font-bold text-navy text-[16px]">Sertifikat pencapaian</h2>
      <label className="block"><span className="label">“atas keberhasilannya …”</span>
        <textarea className="isian min-h-24" value={s.pencapaian} onChange={(e) => onSimpan({ ...s, pencapaian: e.target.value })} />
      </label>
      <Isian label="Tanggal sertifikat" type="date" value={s.tanggal} onChange={(e) => e.target.value && onSimpan({ ...s, tanggal: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Tombol varian="kedua" disabled={!!proses || !s.pencapaian.trim()} onClick={() => void buat('a4')}>{proses === 'a4' ? 'Membuat…' : 'A4 (cetak)'}</Tombol>
        <Tombol varian="kedua" disabled={!!proses || !s.pencapaian.trim()} onClick={() => void buat('sosial')}>{proses === 'sosial' ? 'Membuat…' : 'Versi sosial'}</Tombol>
      </div>
      <p className="text-[13px] text-samar">Versi A4 memakai tanda tangan asli. Versi sosial tanpa tanda tangan (hanya nama & peran), aman untuk dibagikan.</p>
      {hasil ? (
        <div className="grid grid-cols-2 gap-3">
          <Tombol onClick={() => void bagikanBerkas(hasil.pdf, nama)}>Bagikan</Tombol>
          <Tombol varian="halus" onClick={() => unduhBerkas(hasil.pdf, nama)}>Buka / Unduh</Tombol>
        </div>
      ) : null}
      {galat ? <p className="text-[#9b3b2f] text-[14px]">{galat}</p> : null}
    </Kartu>
  );
}

