import { useEffect, useState } from 'react';
import { FormAnak, ProfilAnak } from './layar/Anak.tsx';
import { Beranda } from './layar/Beranda.tsx';
import { FormEvaluasi } from './layar/Evaluasi.tsx';
import { BuatLaporan, LihatLaporan } from './layar/Laporan.tsx';
import { Pengaturan, SpandukCadangan } from './layar/Pengaturan.tsx';
import { GerbangKunci } from './layar/Kunci.tsx';
import { Tombol, useRute, WadahToast } from './ui.tsx';

export const standalone = (): boolean =>
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

function PanduanPasang({ lanjut }: { lanjut: () => void }) {
  return (
    <div className="min-h-dvh aman-atas aman-bawah aman-x flex flex-col">
      <div className="mx-auto max-w-md flex-1 flex flex-col justify-center gap-5 py-6">
        <img src={`${import.meta.env.BASE_URL}ikon-192.png`} alt="" className="size-20 rounded-[22px] shadow-md mx-auto" />
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-navy">HNC Evaluasi</h1>
          <p className="text-lembut mt-1">Pasang aplikasi di iPhone agar bisa dipakai tanpa internet.</p>
        </div>
        <ol className="kartu p-5 space-y-4 text-[16px]">
          <li className="flex gap-3"><b className="size-8 shrink-0 rounded-full bg-latar-teal text-petrol grid place-items-center">1</b><span>Buka halaman ini di <b>Safari</b>.</span></li>
          <li className="flex gap-3"><b className="size-8 shrink-0 rounded-full bg-latar-teal text-petrol grid place-items-center">2</b><span>Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas).</span></li>
          <li className="flex gap-3"><b className="size-8 shrink-0 rounded-full bg-latar-teal text-petrol grid place-items-center">3</b><span>Pilih <b>Tambahkan ke Layar Utama</b>, lalu buka “HNC Evaluasi” dari layar utama.</span></li>
        </ol>
        <p className="text-[14px] text-lembut bg-latar-teal rounded-2xl p-4">Data tersimpan <b>di dalam aplikasi yang terpasang</b>. Data di tab Safari terpisah dan tidak ikut pindah ke aplikasi.</p>
        <Tombol varian="halus" onClick={lanjut}>Lanjutkan di browser</Tombol>
      </div>
    </div>
  );
}

function PromptVersi() {
  const [perbarui, setPerbarui] = useState<null | (() => void)>(null);
  useEffect(() => {
    const f = (e: Event) => setPerbarui(() => (e as CustomEvent<() => void>).detail);
    addEventListener('hnc:versi-baru', f);
    return () => removeEventListener('hnc:versi-baru', f);
  }, []);
  if (!perbarui) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 aman-atas aman-x">
      <div className="mx-auto max-w-md mt-2 flex items-center gap-3 rounded-2xl bg-navy text-white px-4 py-2 shadow-lg">
        <span className="flex-1 text-[15px]">Versi baru tersedia</span>
        <button className="min-h-11 px-3 font-semibold text-aqua" onClick={perbarui}>Muat ulang</button>
      </div>
    </div>
  );
}

function Rute() {
  const r = useRute();
  const [a, b, c] = r;
  if (a === 'anak' && b === 'baru') return <FormAnak />;
  if (a === 'anak' && b && c === 'ubah') return <FormAnak id={b} />;
  if (a === 'anak' && b) return <ProfilAnak id={b} />;
  if (a === 'evaluasi' && b) return <FormEvaluasi id={b} />;
  if (a === 'laporan' && b === 'baru' && c) return <BuatLaporan evaluasiId={c} />;
  if (a === 'laporan' && b) return <LihatLaporan id={b} />;
  if (a === 'pengaturan') return <Pengaturan />;
  return <Beranda spanduk={<SpandukCadangan />} />;
}

export function App() {
  const [diBrowser, setDiBrowser] = useState(() => standalone() || sessionStorage.getItem('hnc:browser') === '1');
  return (
    <>
      <PromptVersi />
      {diBrowser ? <GerbangKunci><Rute /></GerbangKunci> : <PanduanPasang lanjut={() => { sessionStorage.setItem('hnc:browser', '1'); setDiBrowser(true); }} />}
      <WadahToast />
    </>
  );
}
