// PIN gate: set + confirm on first run, lock on cold start and after 5 minutes in the background, growing
// delay after wrong attempts. First run continues with the (skippable) activation-code screen.
import { useEffect, useState, type ReactNode } from 'react';
import { bacaPengaturan, tulisPengaturan } from '../db.ts';
import { buatHashPin, cocokPin, type HashPin } from '../kripto.ts';
import { Tombol } from '../ui.tsx';
import { aktifkan } from './Pengaturan.tsx';

const LATAR_MAKS_MS = 5 * 60 * 1000;
interface Gagal { jumlah: number; sampai: number }
const jedaUntuk = (n: number): number => (n < 3 ? 0 : Math.min(15 * 60, 5 * 2 ** (n - 3)) * 1000);

export function PapanPin({ judul, sub, onSelesai, galat, nonaktifHingga = 0 }: { judul: string; sub?: string; onSelesai: (pin: string) => void; galat?: string; nonaktifHingga?: number }) {
  const [pin, setPin] = useState('');
  const [sekarang, setSekarang] = useState(Date.now());
  useEffect(() => { if (nonaktifHingga <= Date.now()) return; const h = setInterval(() => setSekarang(Date.now()), 500); return () => clearInterval(h); }, [nonaktifHingga]);
  useEffect(() => { setPin(''); }, [judul, galat]);
  const tunggu = Math.max(0, Math.ceil((nonaktifHingga - sekarang) / 1000));
  const tekan = (d: string) => {
    if (tunggu) return;
    const p = (pin + d).slice(0, 6);
    setPin(p);
    if (p.length === 6) setTimeout(() => onSelesai(p), 120);
  };
  return (
    <div className="min-h-dvh aman-atas aman-bawah aman-x flex flex-col items-center justify-center gap-6 bg-latar">
      <img src={`${import.meta.env.BASE_URL}ikon-192.png`} alt="" className="size-16 rounded-[18px] shadow" />
      <div className="text-center">
        <h1 className="text-[21px] font-bold text-navy">{judul}</h1>
        {sub ? <p className="text-lembut text-[15px] mt-1 max-w-xs">{sub}</p> : null}
      </div>
      <div className="flex gap-3" aria-label={`${pin.length} dari 6 angka`}>
        {Array.from({ length: 6 }, (_, i) => <span key={i} className={`size-3.5 rounded-full ${i < pin.length ? 'bg-petrol' : 'bg-garis'}`} />)}
      </div>
      <p className="min-h-6 text-[14px] text-[#9b3b2f] text-center">{tunggu ? `Terlalu banyak percobaan. Coba lagi dalam ${tunggu} detik.` : galat}</p>
      <div className="grid grid-cols-3 gap-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) => d ? (
          <button key={i} type="button" aria-label={d === '⌫' ? 'Hapus' : d} disabled={!!tunggu}
            onClick={() => (d === '⌫' ? setPin(pin.slice(0, -1)) : tekan(d))}
            className="size-[72px] rounded-full bg-white text-[26px] font-semibold text-navy shadow-sm active:bg-latar-teal disabled:opacity-40">{d}</button>
        ) : <span key={i} />)}
      </div>
    </div>
  );
}

function SetelPin({ selesai }: { selesai: () => void }) {
  const [pertama, setPertama] = useState<string | null>(null);
  const [galat, setGalat] = useState('');
  return (
    <PapanPin judul={pertama ? 'Ulangi PIN' : 'Buat PIN 6 angka'} sub={pertama ? 'Masukkan PIN yang sama sekali lagi.' : 'PIN melindungi data anak di iPhone ini. Jangan sampai lupa.'} galat={galat}
      onSelesai={async (p) => {
        if (!pertama) { setPertama(p); setGalat(''); return; }
        if (p !== pertama) { setPertama(null); setGalat('PIN tidak sama. Silakan ulangi.'); return; }
        await tulisPengaturan('pin', await buatHashPin(p));
        selesai();
      }} />
  );
}

function AktivasiAwal({ selesai }: { selesai: () => void }) {
  const [kode, setKode] = useState('');
  const [status, setStatus] = useState('');
  const [proses, setProses] = useState(false);
  return (
    <div className="min-h-dvh aman-atas aman-bawah aman-x flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md kartu p-6 space-y-4">
        <h1 className="text-[21px] font-bold text-navy">Masukkan kode aktivasi</h1>
        <p className="text-[15px] text-lembut">Kode aktivasi membuka tanda tangan dan nomor STR untuk laporan. Bisa dilewati dan diisi nanti di Pengaturan; sampai saat itu baris tanda tangan dibiarkan kosong.</p>
        <input className="isian tracking-widest uppercase" placeholder="XXXX-XXXX-XXXX-XXXX-XX" value={kode} autoCapitalize="characters" autoComplete="off" spellCheck={false} onChange={(e) => setKode(e.target.value)} />
        {status ? <p className="text-[14px] text-[#9b3b2f]">{status}</p> : null}
        <Tombol className="w-full" disabled={proses || kode.replace(/[^a-z0-9]/gi, '').length < 18} onClick={async () => {
          setProses(true); setStatus('');
          const r = await aktifkan(kode);
          setProses(false);
          if (r) setStatus(r); else selesai();
        }}>{proses ? 'Memeriksa…' : 'Aktifkan'}</Tombol>
        <Tombol varian="halus" className="w-full" onClick={async () => { await tulisPengaturan('aktivasiDilewati', true); selesai(); }}>Lewati dulu</Tombol>
      </div>
    </div>
  );
}

export function GerbangKunci({ children }: { children: ReactNode }) {
  const [tahap, setTahap] = useState<'muat' | 'setel' | 'kunci' | 'aktivasi' | 'buka'>('muat');
  const [galat, setGalat] = useState('');
  const [gagal, setGagal] = useState<Gagal>({ jumlah: 0, sampai: 0 });

  const lanjutSetelahPin = async () => {
    const [akt, lewat] = await Promise.all([bacaPengaturan('aktivasi'), bacaPengaturan('aktivasiDilewati')]);
    setTahap(akt || lewat ? 'buka' : 'aktivasi');
  };
  useEffect(() => {
    void (async () => {
      const pin = await bacaPengaturan<HashPin>('pin');
      setGagal((await bacaPengaturan<Gagal>('pinGagal')) ?? { jumlah: 0, sampai: 0 });
      setTahap(pin ? 'kunci' : 'setel');
    })();
  }, []);
  useEffect(() => {
    let tersembunyi = 0;
    const f = () => {
      if (document.visibilityState === 'hidden') tersembunyi = Date.now();
      else if (tersembunyi && Date.now() - tersembunyi > LATAR_MAKS_MS) setTahap((t) => (t === 'buka' ? 'kunci' : t));
    };
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);

  if (tahap === 'muat') return null;
  if (tahap === 'setel') return <SetelPin selesai={() => void lanjutSetelahPin()} />;
  if (tahap === 'aktivasi') return <AktivasiAwal selesai={() => setTahap('buka')} />;
  if (tahap === 'kunci') return (
    <PapanPin judul="Masukkan PIN" galat={galat} nonaktifHingga={gagal.sampai} onSelesai={async (p) => {
      const h = await bacaPengaturan<HashPin>('pin');
      if (h && (await cocokPin(p, h))) {
        const nol = { jumlah: 0, sampai: 0 };
        setGagal(nol); await tulisPengaturan('pinGagal', nol); setGalat('');
        await lanjutSetelahPin();
        return;
      }
      const jumlah = gagal.jumlah + 1;
      const g = { jumlah, sampai: Date.now() + jedaUntuk(jumlah) };
      setGagal(g); await tulisPengaturan('pinGagal', g);
      setGalat(`PIN salah (${jumlah}×).`);
    }} />
  );
  return <>{children}</>;
}
