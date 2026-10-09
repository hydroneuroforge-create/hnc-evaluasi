import { useEffect, useState } from 'react';
import {
  ambilAnak, asesmenKosong, evaluasiAnak, hapus, hapusAnak, idBaru, laporanAnak, sesiAnak, simpan,
  type Anak, type Evaluasi,
} from '../db.ts';
import { DIAGNOSA_SARAN, hariIni, SESI_EVALUASI, sesiSejakEvaluasi, tanggalTampil, usiaTampil } from '../logika.ts';
import { Isian, Kartu, keRute, Layar, Lencana, toast, Tombol, useData } from '../ui.tsx';
import { catatSesiHariIni } from './Beranda.tsx';

const kosong = (): Anak => ({
  id: idBaru(), namaLengkap: '', namaPanggilan: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'L', diagnosa: '', programIndividual: [], dibuat: Date.now(),
});

export function FormAnak({ id }: { id?: string }) {
  const [a, setA] = useState<Anak | null>(id ? null : kosong());
  useEffect(() => { if (id) void ambilAnak(id).then((x) => setA(x ?? kosong())); }, [id]);
  if (!a) return null;
  const set = (p: Partial<Anak>) => setA({ ...a, ...p });
  const lengkap = a.namaLengkap.trim() && a.namaPanggilan.trim() && a.tempatLahir.trim() && a.tanggalLahir && a.diagnosa.trim();
  const simpanAnak = async () => {
    await simpan('anak', { ...a, namaLengkap: a.namaLengkap.trim(), namaPanggilan: a.namaPanggilan.trim() });
    toast('Data anak disimpan.');
    keRute(`/anak/${a.id}`);
  };
  return (
    <Layar judul={id ? 'Ubah data anak' : 'Anak baru'} kembali="" bawah={<Tombol className="flex-1" disabled={!lengkap} onClick={() => void simpanAnak()}>Simpan</Tombol>}>
      <Kartu className="space-y-4">
        <Isian label="Nama lengkap" value={a.namaLengkap} onChange={(e) => set({ namaLengkap: e.target.value })} autoComplete="off" />
        <Isian label="Nama panggilan" value={a.namaPanggilan} onChange={(e) => set({ namaPanggilan: e.target.value })} autoComplete="off" />
        <div className="grid grid-cols-2 gap-3">
          <Isian label="Tempat lahir" value={a.tempatLahir} onChange={(e) => set({ tempatLahir: e.target.value })} />
          <Isian label="Tanggal lahir" type="date" value={a.tanggalLahir} max={hariIni()} onChange={(e) => set({ tanggalLahir: e.target.value })} />
        </div>
        <div>
          <span className="label">Jenis kelamin</span>
          <div className="grid grid-cols-2 gap-2">
            {(['L', 'P'] as const).map((j) => (
              <button key={j} type="button" onClick={() => set({ jenisKelamin: j })}
                className={`min-h-12 rounded-xl border font-semibold ${a.jenisKelamin === j ? 'bg-petrol text-white border-petrol' : 'bg-white border-garis'}`}>{j === 'L' ? 'Laki-laki' : 'Perempuan'}</button>
            ))}
          </div>
        </div>
        <div>
          <Isian label="Diagnosa" value={a.diagnosa} onChange={(e) => set({ diagnosa: e.target.value })} placeholder="Ketik atau pilih di bawah" />
          <div className="flex flex-wrap gap-2 mt-2">
            {DIAGNOSA_SARAN.map((d) => (
              <button key={d} type="button" className="min-h-11 px-3 rounded-full bg-latar-teal text-petrol-tua text-[14px] font-medium"
                onClick={() => set({ diagnosa: a.diagnosa.trim() ? `${a.diagnosa.trim()}, ${d}` : d })}>{d}</button>
            ))}
          </div>
        </div>
      </Kartu>
      {id ? (
        <Tombol varian="bahaya" className="w-full" onClick={async () => {
          if (!confirm(`Hapus ${a.namaLengkap} beserta semua sesi, evaluasi dan laporannya? Ini tidak dapat dibatalkan.`)) return;
          await hapusAnak(a.id); keRute('/');
        }}>Hapus anak</Tombol>
      ) : null}
    </Layar>
  );
}

export function ProfilAnak({ id }: { id: string }) {
  const [d] = useData(async () => ({ anak: await ambilAnak(id), sesi: await sesiAnak(id), evaluasi: await evaluasiAnak(id), laporan: await laporanAnak(id) }), [id]);
  const [tglSesi, setTglSesi] = useState(hariIni());
  const [semuaSesi, setSemuaSesi] = useState(false);
  if (!d) return null;
  const { anak, sesi, evaluasi, laporan } = d;
  if (!anak) return <Layar judul="Tidak ditemukan" kembali="/"><p>Data anak tidak ditemukan.</p></Layar>;
  const n = sesiSejakEvaluasi(sesi, evaluasi);
  const adaSelesai = evaluasi.some((e) => e.status === 'selesai');

  const mulaiEvaluasi = async (jenis: Evaluasi['jenis']) => {
    const draf = evaluasi.find((e) => e.status === 'draf' && e.jenis === jenis);
    if (draf) return keRute(`/evaluasi/${draf.id}`);
    if (jenis === 'lanjutan' && n < SESI_EVALUASI && !confirm(`Baru ${n} dari ${SESI_EVALUASI} sesi sejak evaluasi terakhir. Evaluasi ulang dianjurkan setelah ${SESI_EVALUASI} sesi. Tetap lanjutkan?`)) return;
    if (jenis === 'lanjutan' && !adaSelesai && !confirm('Belum ada evaluasi yang selesai untuk dibandingkan. Tetap buat evaluasi lanjutan?')) return;
    const e: Evaluasi = { id: idBaru(), anakId: id, jenis, status: 'draf', asesmen: asesmenKosong(hariIni()), diubah: Date.now() };
    await simpan('evaluasi', e);
    keRute(`/evaluasi/${e.id}`);
  };

  const tampilSesi = semuaSesi ? [...sesi].reverse() : [...sesi].reverse().slice(0, 8);
  return (
    <Layar judul={anak.namaPanggilan} kembali="/" kanan={<button className="min-h-11 px-3 text-petrol font-semibold" onClick={() => keRute(`/anak/${id}/ubah`)}>Ubah</button>}>
      <Kartu>
        <p className="text-[19px] font-bold text-navy">{anak.namaLengkap}</p>
        <p className="text-lembut text-[15px] mt-0.5">{anak.tempatLahir}, {tanggalTampil(anak.tanggalLahir)} · {usiaTampil(anak.tanggalLahir)} · {anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
        <p className="text-[15px] mt-1">{anak.diagnosa}</p>
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-[14px]">Sesi sejak evaluasi terakhir: <b>{n}/{SESI_EVALUASI}</b></span>
          {n >= SESI_EVALUASI ? <Lencana>Siap evaluasi</Lencana> : null}
        </div>
      </Kartu>

      <div className="grid grid-cols-2 gap-3">
        <Tombol varian={adaSelesai ? 'halus' : 'utama'} onClick={() => void mulaiEvaluasi('awal')}>Evaluasi Awal</Tombol>
        <Tombol varian={adaSelesai ? 'utama' : 'halus'} onClick={() => void mulaiEvaluasi('lanjutan')}>Evaluasi Lanjutan</Tombol>
      </div>

      <Kartu>
        <h2 className="font-bold text-navy text-[16px] mb-2">Evaluasi</h2>
        {!evaluasi.length ? <p className="text-lembut text-[15px]">Belum ada evaluasi.</p> : null}
        <ul className="divide-y divide-garis">
          {[...evaluasi].reverse().map((e) => {
            const lap = laporan.find((l) => l.evaluasiId === e.id);
            return (
              <li key={e.id} className="py-2 flex items-center gap-2">
                <button className="flex-1 text-left min-h-11" onClick={() => keRute(`/evaluasi/${e.id}`)}>
                  <span className="font-semibold">Evaluasi {e.jenis === 'awal' ? 'Awal' : 'Lanjutan'}</span>
                  <span className="block text-[14px] text-lembut">{tanggalTampil(e.asesmen.tanggal)} · {e.status === 'draf' ? 'Draf' : 'Selesai'}</span>
                </button>
                {e.status === 'selesai' && e.jenis === 'lanjutan' ? (
                  <Tombol varian="kedua" className="!px-3 text-[14px]" onClick={() => keRute(lap ? `/laporan/${lap.id}` : `/laporan/baru/${e.id}`)}>{lap ? 'Laporan' : 'Buat laporan'}</Tombol>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Kartu>

      {laporan.length ? (
        <Kartu>
          <h2 className="font-bold text-navy text-[16px] mb-2">Laporan</h2>
          <ul className="divide-y divide-garis">
            {laporan.map((l) => (
              <li key={l.id}><button className="w-full text-left py-2 min-h-11" onClick={() => keRute(`/laporan/${l.id}`)}>
                <span className="font-semibold">{l.nomor}</span><span className="block text-[14px] text-lembut">{tanggalTampil(l.tanggal)}</span>
              </button></li>
            ))}
          </ul>
        </Kartu>
      ) : null}

      <Kartu>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-navy text-[16px]">Sesi terapi ({sesi.length})</h2>
        </div>
        <Tombol varian="kedua" className="w-full" onClick={() => void catatSesiHariIni(anak)}>+ Catat sesi hari ini</Tombol>
        <div className="flex gap-2 mt-3">
          <input type="date" className="isian flex-1" value={tglSesi} max={hariIni()} onChange={(e) => setTglSesi(e.target.value)} aria-label="Tanggal sesi" />
          <Tombol varian="halus" disabled={!tglSesi} onClick={async () => { await simpan('sesi', { id: idBaru(), anakId: id, tanggal: tglSesi, dibuat: Date.now() }); toast(`Sesi ${tanggalTampil(tglSesi)} ditambahkan.`); }}>Tambah</Tombol>
        </div>
        <ul className="divide-y divide-garis mt-2">
          {tampilSesi.map((s) => (
            <li key={s.id} className="flex items-center py-1.5">
              <span className="flex-1 text-[15px]">{tanggalTampil(s.tanggal)}</span>
              <button className="min-h-11 px-3 text-[14px] text-[#9b3b2f]" onClick={() => { if (confirm(`Hapus sesi ${tanggalTampil(s.tanggal)}?`)) void hapus('sesi', s.id); }}>Hapus</button>
            </li>
          ))}
        </ul>
        {sesi.length > 8 ? <button className="min-h-11 text-petrol font-semibold text-[14px]" onClick={() => setSemuaSesi(!semuaSesi)}>{semuaSesi ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${sesi.length})`}</button> : null}
      </Kartu>
    </Layar>
  );
}
