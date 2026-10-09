// Evaluation form: stepper Info → Kegiatan → Sensori → Refleks → Program → Ringkasan. Every change autosaves.
// Options (slots, add-ons, notes) are rendered generically from the core master definitions.
import { useEffect, useRef, useState } from 'react';
import {
  bank, BAB_PROGRAM, KEGIATAN, labelLevel, LEVELS, REFLEKS, SENSORI, SET_SKALA_DEFAULT, semuaItemProgram, tambahanKegiatan, teksPolos,
  type KegiatanId, type KegiatanNilai, type Level, type NilaiKegiatan, type ProgramItemDef,
} from '../../../src/core/index.ts';
import { ambilAnak, ambilEvaluasi, evaluasiAnak, hapus, idBaru, simpan, type Anak, type AsesmenDraf, type Evaluasi } from '../db.ts';
import { hariIni, kekuranganAsesmen, tanggalTampil } from '../logika.ts';
import { Isian, Kartu, keRute, Layar, Segmen, toast, Tombol } from '../ui.tsx';

const LANGKAH = ['Info', 'Kegiatan', 'Sensori', 'Refleks', 'Program', 'Ringkasan'] as const;
const S = SET_SKALA_DEFAULT.skala;
const BELUM = 'belum' as const;

export function FormEvaluasi({ id }: { id: string }) {
  const [ev, setEv] = useState<Evaluasi | null>(null);
  const [anak, setAnak] = useState<Anak | null>(null);
  const [lalu, setLalu] = useState<Evaluasi | null>(null);
  const [langkah, setLangkah] = useState(0);
  const atas = useRef<HTMLDivElement>(null);
  const evRef = useRef<Evaluasi | null>(null);
  const anakRef = useRef<Anak | null>(null);

  useEffect(() => {
    void (async () => {
      const e = await ambilEvaluasi(id);
      if (!e) return;
      setEv(e);
      setAnak((await ambilAnak(e.anakId)) ?? null);
      const semua = (await evaluasiAnak(e.anakId)).filter((x) => x.id !== e.id && x.status === 'selesai' && x.asesmen.tanggal <= e.asesmen.tanggal);
      setLalu(semua[semua.length - 1] ?? null);
    })();
  }, [id]);
  useEffect(() => { window.scrollTo(0, 0); }, [langkah]);
  if (!ev || !anak) return null;

  // Refs hold the latest values so rapid taps never build on a stale render.
  evRef.current ??= ev;
  anakRef.current ??= anak;
  const ubah = (f: (a: AsesmenDraf) => AsesmenDraf) => {
    const lama = evRef.current!;
    const baru = { ...lama, asesmen: f(structuredClone(lama.asesmen)), diubah: Date.now() };
    evRef.current = baru;
    setEv(baru);
    void simpan('evaluasi', baru);
  };
  const ubahAnak = (p: Partial<Anak>) => { const b = { ...anakRef.current!, ...p }; anakRef.current = b; setAnak(b); void simpan('anak', b); };
  const a = ev.asesmen;
  const p = lalu?.asesmen;

  const salinSebelumnya = () => {
    if (!p) return;
    if (!confirm('Salin semua nilai dari evaluasi sebelumnya? Nilai yang sudah diisi akan ditimpa.')) return;
    ubah((x) => ({ ...structuredClone(p), tanggal: x.tanggal, ...(p.alasanTdo ? { alasanTdo: p.alasanTdo } : {}) }));
    toast('Nilai evaluasi sebelumnya disalin.');
  };

  const isi = (() => {
    switch (LANGKAH[langkah]) {
      case 'Info': return (
        <>
          <Kartu className="space-y-4">
            <p className="text-[15px] text-lembut">Evaluasi {ev.jenis === 'awal' ? 'Awal' : 'Lanjutan'} untuk <b className="text-navy">{anak.namaLengkap}</b>.</p>
            <Isian label="Tanggal evaluasi" type="date" value={a.tanggal} max={hariIni()} onChange={(e) => ubah((x) => ({ ...x, tanggal: e.target.value }))} />
            <p className="text-[13px] text-samar">Tanggal lampau diperbolehkan. Semua isian tersimpan otomatis.</p>
          </Kartu>
          {p ? (
            <Kartu>
              <p className="text-[15px]">Evaluasi sebelumnya: <b>{tanggalTampil(p.tanggal)}</b>. Nilainya tampil sebagai petunjuk “lalu”.</p>
              <Tombol varian="kedua" className="w-full mt-3" onClick={salinSebelumnya}>Salin nilai evaluasi sebelumnya</Tombol>
            </Kartu>
          ) : null}
        </>
      );
      case 'Kegiatan': return (
        <>
          {KEGIATAN.map((d) => <ItemKegiatan key={d.id} id={d.id} no={d.no} nama={teksPolos(d.nama)} nilai={a.kegiatan[d.id]} lalu={p?.kegiatan[d.id]?.level}
            onUbah={(v) => ubah((x) => { if (v) x.kegiatan[d.id] = v; else delete x.kegiatan[d.id]; return x; })} />)}
          {Object.values(a.kegiatan).some((v) => v?.level === 'tdo') ? (
            <Kartu><Isian label="Alasan ‘tidak dapat diobservasi’ (opsional)" value={a.alasanTdo ?? ''} placeholder="mis. kondisi Ananda kurang fit"
              onChange={(e) => ubah((x) => { if (e.target.value) x.alasanTdo = e.target.value; else delete x.alasanTdo; return x; })} /></Kartu>
          ) : null}
        </>
      );
      case 'Sensori': return SENSORI.map((d) => (
        <Kartu key={d.id}>
          <p className="font-bold text-navy">{d.no}. {d.nama}</p>
          <p className="text-[13px] text-lembut mb-2">{d.namaIndonesia}</p>
          <Segmen pilihan={[...LEVELS].reverse().map((v) => ({ nilai: v, label: '★'.repeat(v), sub: S.sensori.level[v].label }))} nilai={a.sensori[d.id]} petunjuk={p?.sensori[d.id]}
            onPilih={(v) => ubah((x) => ({ ...x, sensori: { ...x.sensori, [d.id]: x.sensori[d.id] === v ? null : v } }))} />
        </Kartu>
      ));
      case 'Refleks': return REFLEKS.map((d) => (
        <Kartu key={d.id}>
          <p className="font-bold text-navy mb-2">{d.no}. {teksPolos(d.namaTabel)}</p>
          <Segmen pilihan={[...LEVELS].reverse().map((v) => ({ nilai: v, label: String(v), sub: labelLevel(S.refleks, v) }))} nilai={a.refleks[d.id]} petunjuk={p?.refleks[d.id]}
            onPilih={(v) => ubah((x) => ({ ...x, refleks: { ...x.refleks, [d.id]: x.refleks[d.id] === v ? null : v } }))} />
        </Kartu>
      ));
      case 'Program': return <LangkahProgram anak={anak} a={a} p={p} ubah={ubah} ubahAnak={ubahAnak} />;
      default: {
        const kurang = kekuranganAsesmen(a);
        const terisi = (o: Record<string, unknown>) => Object.values(o).filter((v) => v !== null && v !== undefined).length;
        return (
          <Kartu className="space-y-2">
            <p className="text-[15px]">Tanggal: <b>{tanggalTampil(a.tanggal)}</b></p>
            <p className="text-[15px]">Kegiatan: <b>{terisi(a.kegiatan)}/{KEGIATAN.length}</b> · Sensori: <b>{terisi(a.sensori)}/3</b> · Refleks: <b>{terisi(a.refleks)}/10</b> · Program: <b>{terisi(a.program)}</b> dinilai</p>
            {kurang.length ? <p className="text-[15px] text-[#9b3b2f]">Belum lengkap: {kurang.join(', ')}.</p> : <p className="text-[15px] text-aksen font-semibold">Siap diselesaikan.</p>}
            <p className="text-[13px] text-samar">Sensori/refleks yang kosong dicatat sebagai “tidak dinilai”; program yang kosong sebagai “Belum diberikan”.</p>
            <Tombol className="w-full" disabled={!!kurang.length} onClick={async () => {
              const b = { ...ev, status: 'selesai' as const, diubah: Date.now() };
              await simpan('evaluasi', b);
              toast('Evaluasi selesai disimpan.');
              keRute(ev.jenis === 'lanjutan' && lalu ? `/laporan/baru/${ev.id}` : `/anak/${anak.id}`);
            }}>{ev.status === 'selesai' ? 'Simpan perubahan' : 'Selesaikan evaluasi'}{ev.jenis === 'lanjutan' && lalu ? ' & buat laporan' : ''}</Tombol>
            <Tombol varian="bahaya" className="w-full" onClick={async () => { if (confirm('Hapus evaluasi ini?')) { await hapus('evaluasi', ev.id); keRute(`/anak/${anak.id}`); } }}>Hapus evaluasi</Tombol>
          </Kartu>
        );
      }
    }
  })();

  return (
    <Layar judul={`Evaluasi ${ev.jenis === 'awal' ? 'Awal' : 'Lanjutan'}`} kembali={`/anak/${anak.id}`}
      bawah={<>
        <Tombol varian="halus" className="flex-1" disabled={langkah === 0} onClick={() => setLangkah(langkah - 1)}>Kembali</Tombol>
        <Tombol className="flex-1" disabled={langkah === LANGKAH.length - 1} onClick={() => setLangkah(langkah + 1)}>Lanjut</Tombol>
      </>}>
      <div ref={atas} className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
        {LANGKAH.map((l, i) => (
          <button key={l} onClick={() => setLangkah(i)} className={`shrink-0 min-h-11 px-3.5 rounded-full text-[14px] font-semibold ${i === langkah ? 'bg-petrol text-white' : 'bg-white text-lembut border border-garis'}`}>{i + 1}. {l}</button>
        ))}
      </div>
      {isi}
    </Layar>
  );
}

function ItemKegiatan({ id, no, nama, nilai, lalu, onUbah }: { id: KegiatanId; no: number; nama: string; nilai?: KegiatanNilai; lalu?: NilaiKegiatan; onUbah: (v: KegiatanNilai | undefined) => void }) {
  const [buka, setBuka] = useState(false);
  const def = KEGIATAN.find((k) => k.id === id)!;
  const tambahan = tambahanKegiatan(id);
  const lv = bank.BANK_KEGIATAN[id].level;
  const pilihan: { nilai: NilaiKegiatan; label: string; sub?: string }[] = [...[...LEVELS].reverse().map((v) => ({ nilai: v as NilaiKegiatan, label: String(v), sub: lv[v as Level].label })), { nilai: 'tdo', label: '—', sub: 'Tidak dapat diobservasi' }];
  const set = (p: Partial<KegiatanNilai>) => onUbah({ level: nilai?.level ?? 1, ...nilai, ...p });
  const jumlahOpsi = Object.keys(nilai?.slot ?? {}).length + (nilai?.tambahan?.length ?? 0) + (nilai?.catatan ? 1 : 0);
  return (
    <Kartu>
      <p className="font-bold text-navy mb-2">{no}. {nama}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {pilihan.map((o) => {
          const aktif = nilai?.level === o.nilai;
          return (
            <button key={String(o.nilai)} type="button" onClick={() => (aktif ? onUbah(undefined) : set({ level: o.nilai }))}
              className={`relative min-h-16 rounded-xl px-1 py-1.5 text-center leading-tight border ${aktif ? 'bg-petrol border-petrol text-white' : 'bg-white border-garis active:bg-latar'}`}>
              <span className="block text-[17px] font-bold">{o.label}</span>
              <span className={`block text-[10px] mt-0.5 ${aktif ? 'text-white/85' : 'text-lembut'}`}>{o.sub}</span>
              {lalu === o.nilai ? <span className={`absolute top-0.5 right-1 text-[9px] font-semibold ${aktif ? 'text-aqua' : 'text-teal'}`}>lalu</span> : null}
            </button>
          );
        })}
      </div>
      {nilai ? (
        <button className="mt-2 min-h-11 text-[14px] font-semibold text-petrol" onClick={() => setBuka(!buka)}>
          {buka ? 'Tutup detail' : `Detail & catatan${jumlahOpsi ? ` (${jumlahOpsi})` : ''}`}
        </button>
      ) : null}
      {nilai && buka ? (
        <div className="space-y-3 mt-1">
          {def.slot.map((s) => (
            <label key={s.id} className="block">
              <span className="label">{s.label}</span>
              {s.pilihan ? (
                <select className="isian" value={nilai.slot?.[s.id] ?? ''} onChange={(e) => {
                  const slot = { ...nilai.slot }; if (e.target.value) slot[s.id] = e.target.value; else delete slot[s.id];
                  set({ slot });
                }}>
                  <option value="">—</option>
                  {s.pilihan.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              ) : (
                <input className="isian" value={nilai.slot?.[s.id] ?? ''} placeholder={s.contoh ? `mis. ${s.contoh}` : ''} onChange={(e) => {
                  const slot = { ...nilai.slot }; if (e.target.value) slot[s.id] = e.target.value; else delete slot[s.id];
                  set({ slot });
                }} />
              )}
            </label>
          ))}
          {tambahan.map((t) => {
            const on = nilai.tambahan?.includes(t.id) ?? false;
            return (
              <label key={t.id} className="flex items-center gap-3 min-h-11">
                <input type="checkbox" className="size-5 accent-[#24546C]" checked={on} onChange={() => {
                  const xs = on ? (nilai.tambahan ?? []).filter((x) => x !== t.id) : [...(nilai.tambahan ?? []), t.id];
                  set({ tambahan: tambahan.map((d) => d.id).filter((x) => xs.includes(x)) });
                }} />
                <span className="text-[15px]">{t.label}</span>
              </label>
            );
          })}
          <label className="block"><span className="label">Catatan terapis (opsional)</span>
            <textarea className="isian min-h-20" value={nilai.catatan ?? ''} onChange={(e) => { const { catatan: _, ...r } = nilai; onUbah(e.target.value ? { ...r, catatan: e.target.value } : r); }} />
          </label>
        </div>
      ) : null}
    </Kartu>
  );
}

function LangkahProgram({ anak, a, p, ubah, ubahAnak }: { anak: Anak; a: AsesmenDraf; p?: AsesmenDraf; ubah: (f: (a: AsesmenDraf) => AsesmenDraf) => void; ubahAnak: (x: Partial<Anak>) => void }) {
  const [baru, setBaru] = useState<{ aktivitas: string; bab: 1 | 2 | 3; targetRefleks: string; manfaat: string } | null>(null);
  const item = semuaItemProgram(anak.programIndividual);
  const tambah = () => {
    if (!baru?.aktivitas.trim()) return;
    const no = Math.max(0, ...item.filter((x) => x.bab === baru.bab).map((x) => x.no)) + 1;
    const d: ProgramItemDef = { id: `individual.${idBaru().slice(0, 8)}`, bab: baru.bab, no, aktivitas: baru.aktivitas.trim(), targetRefleks: baru.targetRefleks.trim() || '–', ...(baru.manfaat.trim() ? { manfaat: baru.manfaat.trim() } : {}), individual: true };
    ubahAnak({ programIndividual: [...anak.programIndividual, d] });
    setBaru(null);
    toast('Program Individual ditambahkan. Aktivitas ini juga muncul di evaluasi berikutnya.');
  };
  return (
    <>
      {BAB_PROGRAM.map((b) => (
        <div key={b.bab} className="space-y-3">
          <h2 className="font-bold text-petrol-tua text-[15px] pt-2">Chapter {b.bab}: {b.nama}</h2>
          {item.filter((x) => x.bab === b.bab).map((it) => {
            const v = a.program[it.id];
            const pv = p?.program[it.id];
            return (
              <Kartu key={it.id}>
                <p className="font-semibold text-navy mb-0.5">{it.no}. {it.posisi ? `${it.posisi} ` : ''}{it.aktivitas}</p>
                {it.individual ? <span className="inline-block mb-1 rounded-full bg-[#F6EBD3] text-[#7A5A12] text-[11px] font-semibold px-2 py-0.5">Program Individual</span> : null}
                <p className="text-[12px] text-lembut italic mb-2">{it.targetRefleks}</p>
                <Segmen pilihan={[...[...LEVELS].reverse().map((n) => ({ nilai: n as Level | typeof BELUM, label: String(n), sub: labelLevel(S.program, n) })), { nilai: BELUM, label: '–', sub: 'Belum diberikan' }]}
                  nilai={v === undefined ? undefined : v === null ? BELUM : v} petunjuk={pv === undefined ? undefined : pv === null ? BELUM : pv}
                  onPilih={(n) => ubah((x) => ({ ...x, program: { ...x.program, [it.id]: n === BELUM ? null : n } }))} />
                {it.individual ? (
                  <button className="mt-2 min-h-11 text-[13px] text-[#9b3b2f]" onClick={() => {
                    if (!confirm('Hapus aktivitas Program Individual ini dari profil anak? (Laporan yang sudah dibuat tidak berubah.)')) return;
                    ubahAnak({ programIndividual: anak.programIndividual.filter((x) => x.id !== it.id) });
                    ubah((x) => { const { [it.id]: _, ...r } = x.program; return { ...x, program: r }; });
                  }}>Hapus aktivitas</button>
                ) : null}
              </Kartu>
            );
          })}
        </div>
      ))}
      <Kartu className="space-y-3">
        <h2 className="font-bold text-navy">Program Individual</h2>
        <p className="text-[14px] text-lembut">Gerakan khusus untuk {anak.namaPanggilan}. Tampil dengan lencana “Program Individual” di laporan dan terbawa ke evaluasi berikutnya.</p>
        {baru ? (
          <>
            <Isian label="Nama aktivitas" value={baru.aktivitas} onChange={(e) => setBaru({ ...baru, aktivitas: e.target.value })} />
            <label className="block"><span className="label">Chapter</span>
              <select className="isian" value={baru.bab} onChange={(e) => setBaru({ ...baru, bab: Number(e.target.value) as 1 | 2 | 3 })}>
                {BAB_PROGRAM.map((b) => <option key={b.bab} value={b.bab}>Chapter {b.bab}: {b.nama}</option>)}
              </select>
            </label>
            <Isian label="Target refleks" value={baru.targetRefleks} placeholder="mis. TLR, Moro Reflex" onChange={(e) => setBaru({ ...baru, targetRefleks: e.target.value })} />
            <label className="block"><span className="label">Manfaat</span><textarea className="isian min-h-20" value={baru.manfaat} onChange={(e) => setBaru({ ...baru, manfaat: e.target.value })} /></label>
            <div className="flex gap-3"><Tombol varian="halus" className="flex-1" onClick={() => setBaru(null)}>Batal</Tombol><Tombol className="flex-1" disabled={!baru.aktivitas.trim()} onClick={tambah}>Tambah</Tombol></div>
          </>
        ) : <Tombol varian="kedua" className="w-full" onClick={() => setBaru({ aktivitas: '', bab: 2, targetRefleks: '', manfaat: '' })}>+ Tambah aktivitas individual</Tombol>}
      </Kartu>
    </>
  );
}
