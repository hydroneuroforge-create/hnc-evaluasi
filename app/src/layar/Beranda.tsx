import { useState } from 'react';
import { hapus, idBaru, semuaAnak, semuaEvaluasi, semuaSesi, simpan, type Anak, type Evaluasi, type Sesi } from '../db.ts';
import { hariIni, SESI_EVALUASI, sesiSejakEvaluasi, sudahEnamBulan, usiaTampil } from '../logika.ts';
import { Kartu, keRute, Layar, Lencana, toast, Tombol, useData } from '../ui.tsx';

export async function catatSesiHariIni(anak: Anak): Promise<void> {
  const s: Sesi = { id: idBaru(), anakId: anak.id, tanggal: hariIni(), dibuat: Date.now() };
  await simpan('sesi', s);
  toast(`Sesi hari ini dicatat untuk ${anak.namaPanggilan}.`, { label: 'Urungkan', f: () => void hapus('sesi', s.id) });
}

export function Beranda({ spanduk }: { spanduk?: React.ReactNode }) {
  const [cari, setCari] = useState('');
  const [data] = useData(async () => ({ anak: await semuaAnak(), sesi: await semuaSesi(), evaluasi: await semuaEvaluasi() }), []);
  const q = cari.trim().toLowerCase();
  const daftar = (data?.anak ?? []).filter((a) => !q || `${a.namaLengkap} ${a.namaPanggilan} ${a.diagnosa}`.toLowerCase().includes(q));

  return (
    <Layar
      judul={<span className="flex items-center gap-2"><img src={`${import.meta.env.BASE_URL}logo-kecil.png`} alt="" className="h-7 w-auto" />HNC Evaluasi</span>}
      kanan={<button aria-label="Pengaturan" className="size-11 grid place-items-center rounded-full text-petrol active:bg-latar-teal" onClick={() => keRute('/pengaturan')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
      </button>}
      bawah={<Tombol className="flex-1" onClick={() => keRute('/anak/baru')}>+ Anak</Tombol>}
    >
      {spanduk}
      <input type="search" className="isian" placeholder="Cari nama atau diagnosa…" value={cari} onChange={(e) => setCari(e.target.value)} aria-label="Cari anak" />
      {data && !data.anak.length ? (
        <Kartu className="text-center py-10">
          <p className="text-[17px] font-semibold text-navy">Selamat datang 👋</p>
          <p className="text-lembut mt-1">Mulai dengan menambahkan data anak pertama.</p>
        </Kartu>
      ) : null}
      {daftar.map((a) => <KartuAnak key={a.id} anak={a} sesi={data!.sesi.filter((s) => s.anakId === a.id)} evaluasi={data!.evaluasi.filter((e) => e.anakId === a.id)} />)}
    </Layar>
  );
}

function KartuAnak({ anak, sesi, evaluasi }: { anak: Anak; sesi: Sesi[]; evaluasi: Evaluasi[] }) {
  const n = sesiSejakEvaluasi(sesi, evaluasi);
  return (
    <div className="kartu p-4">
      <button className="w-full text-left" onClick={() => keRute(`/anak/${anak.id}`)}>
        <div className="flex items-start gap-3">
          <div className="size-12 shrink-0 rounded-full bg-latar-teal text-petrol grid place-items-center text-[18px] font-bold">{anak.namaPanggilan.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold text-navy truncate">{anak.namaLengkap}</p>
            <p className="text-[14px] text-lembut truncate">{usiaTampil(anak.tanggalLahir)} · {anak.diagnosa || '–'}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[14px] text-teks">Sesi sejak evaluasi terakhir: <b>{n}/{SESI_EVALUASI}</b></span>
          {n >= SESI_EVALUASI ? <Lencana>Siap evaluasi</Lencana> : null}
          {sudahEnamBulan(evaluasi) ? <Lencana warna="emas">Sudah 6 bulan</Lencana> : null}
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-latar overflow-hidden"><div className="h-full bg-aqua rounded-full" style={{ width: `${Math.min(100, (n / SESI_EVALUASI) * 100)}%` }} /></div>
      </button>
      <Tombol varian="kedua" className="w-full mt-3" onClick={() => void catatSesiHariIni(anak)}>✓ Catat sesi hari ini</Tombol>
    </div>
  );
}
