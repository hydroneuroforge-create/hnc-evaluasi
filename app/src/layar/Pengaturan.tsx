import { useEffect, useRef, useState } from 'react';
import { buatCadangan, periksaCadangan, pulihkan, tandaiTercadang, type Cadangan, type Ringkasan } from '../cadangan.ts';
import { bacaPengaturan, semuaAnak, tulisPengaturan } from '../db.ts';
import { bukaAktivasi, buatHashPin, cocokPin, type HashPin, type PaketAktivasi } from '../kripto.ts';
import { KLINIK_BAWAAN, tanggalTampil, hariIni, type Klinik } from '../logika.ts';
import { bacaAktivasi, bacaKlinik, bacaMulaiNomor, tulisMulaiNomor, type Aktivasi } from '../pengaturan.ts';
import { bagikanBerkas, Isian, Kartu, Layar, toast, Tombol, useData } from '../ui.tsx';

const HARI = 24 * 60 * 60 * 1000;

/** Decrypts the bundled payload with the code; returns an error message or null on success. */
export async function aktifkan(kode: string): Promise<string | null> {
  let paket: PaketAktivasi;
  try { paket = (await (await fetch(`${import.meta.env.BASE_URL}aktivasi.json`)).json()) as PaketAktivasi; } catch { return 'Berkas aktivasi tidak dapat dimuat.'; }
  try {
    const isi = await bukaAktivasi(paket, kode);
    const a: Aktivasi = { ttd: isi.ttd, str: isi.str, diaktifkan: Date.now() };
    await tulisPengaturan('aktivasi', a);
    return null;
  } catch { return 'Kode aktivasi tidak cocok. Periksa kembali huruf dan angkanya.'; }
}

/** Banner on Beranda: after a new report, or when the last backup is older than 7 days. */
export function SpandukCadangan() {
  const [d] = useData(async () => ({ t: await bacaPengaturan<number>('terakhirCadangan'), perlu: await bacaPengaturan<boolean>('perluCadangan'), ada: (await semuaAnak()).length > 0 }), []);
  if (!d?.ada) return null;
  const lama = !d.t || Date.now() - d.t > 7 * HARI;
  if (!d.perlu && !lama) return null;
  return (
    <div className="rounded-2xl bg-[#F6EBD3] text-[#5c4410] p-4 flex items-center gap-3">
      <span className="flex-1 text-[14px]">{d.perlu ? 'Ada laporan baru. ' : ''}{d.t ? `Cadangan terakhir ${tanggalTampil(hariIni(new Date(d.t)))}.` : 'Data belum pernah dicadangkan.'}</span>
      <Tombol varian="halus" className="!min-h-11 !px-3 text-[14px]" onClick={() => void cadangkanSekarang()}>Cadangkan</Tombol>
    </div>
  );
}

async function cadangkanSekarang(): Promise<void> {
  const { bytes, nama } = await buatCadangan();
  await bagikanBerkas(bytes, nama, 'application/json');
  await tandaiTercadang();
  toast('Cadangan dibuat. Simpan berkasnya di iCloud Drive (Simpan ke File).');
}

export function Pengaturan() {
  const [k, setK] = useState<Klinik | null>(null);
  const [akt, setAkt] = useState<Aktivasi | undefined>();
  const [mulai, setMulai] = useState(1);
  const [kode, setKode] = useState('');
  const [pesanAkt, setPesanAkt] = useState('');
  const [pin, setPin] = useState({ lama: '', baru: '', ulang: '' });
  const [pesanPin, setPesanPin] = useState('');
  const [pulih, setPulih] = useState<{ c: Cadangan; r: Ringkasan } | null>(null);
  const [terakhir, setTerakhir] = useState<number | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [online, setOnline] = useState(navigator.onLine);

  const muat = async () => {
    setK(await bacaKlinik()); setAkt(await bacaAktivasi()); setMulai(await bacaMulaiNomor()); setTerakhir(await bacaPengaturan<number>('terakhirCadangan'));
  };
  useEffect(() => { void muat(); const f = () => setOnline(navigator.onLine); addEventListener('online', f); addEventListener('offline', f); return () => { removeEventListener('online', f); removeEventListener('offline', f); }; }, []);
  if (!k) return null;
  const setKl = (p: Partial<Klinik>) => setK({ ...k, ...p });
  const pinValid = (x: string) => /^\d{6}$/.test(x);

  return (
    <Layar judul="Pengaturan" kembali="/">
      <Kartu className="space-y-3">
        <h2 className="font-bold text-navy text-[16px]">Cadangan data</h2>
        <p className="text-[14px] text-lembut">Cadangan terakhir: <b>{terakhir ? tanggalTampil(hariIni(new Date(terakhir))) : 'belum pernah'}</b>. Simpan berkas cadangan di iCloud Drive. Tanda tangan dan PDF tidak ikut dicadangkan.</p>
        <Tombol className="w-full" onClick={async () => { await cadangkanSekarang(); await muat(); }}>Cadangkan sekarang</Tombol>
        <Tombol varian="halus" className="w-full" onClick={() => fileRef.current?.click()}>Pulihkan dari cadangan…</Tombol>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; e.target.value = '';
          if (!f) return;
          try { const { c, ringkasan } = periksaCadangan(await f.text()); setPulih({ c, r: ringkasan }); } catch (er) { toast((er as Error).message); }
        }} />
        {pulih ? (
          <div className="rounded-xl bg-latar-teal p-4 space-y-3" data-ringkasan-pulih>
            <p className="text-[15px]">Cadangan {tanggalTampil(pulih.r.dibuat.slice(0, 10))}: <b>{pulih.r.anak}</b> anak, <b>{pulih.r.sesi}</b> sesi, <b>{pulih.r.evaluasi}</b> evaluasi, <b>{pulih.r.laporan}</b> laporan.</p>
            <p className="text-[14px] text-[#9b3b2f]">Semua data di aplikasi ini akan diganti dengan isi cadangan.</p>
            <div className="flex gap-3">
              <Tombol varian="halus" className="flex-1" onClick={() => setPulih(null)}>Batal</Tombol>
              <Tombol className="flex-1" onClick={async () => { await pulihkan(pulih.c); setPulih(null); toast('Data berhasil dipulihkan.'); await muat(); }}>Ganti semua</Tombol>
            </div>
          </div>
        ) : null}
      </Kartu>

      <Kartu className="space-y-3">
        <h2 className="font-bold text-navy text-[16px]">Aktivasi</h2>
        {akt ? <p className="text-[15px] text-aksen font-semibold">✓ Aktif sejak {tanggalTampil(hariIni(new Date(akt.diaktifkan)))} — tanda tangan & STR tersedia.</p>
          : <p className="text-[15px] text-lembut">Belum aktif. Baris tanda tangan dan STR di laporan masih kosong.</p>}
        <input className="isian tracking-widest uppercase" placeholder="XXXX-XXXX-XXXX-XXXX-XX" value={kode} autoCapitalize="characters" autoComplete="off" spellCheck={false} onChange={(e) => setKode(e.target.value)} aria-label="Kode aktivasi" />
        {pesanAkt ? <p className="text-[14px] text-[#9b3b2f]">{pesanAkt}</p> : null}
        <Tombol varian="kedua" className="w-full" disabled={kode.replace(/[^a-z0-9]/gi, '').length < 18} onClick={async () => {
          setPesanAkt('Memeriksa…'); const r = await aktifkan(kode); setPesanAkt(r ?? ''); if (!r) { setKode(''); toast('Aplikasi aktif.'); await muat(); }
        }}>{akt ? 'Aktifkan ulang' : 'Aktifkan'}</Tombol>
      </Kartu>

      <Kartu className="space-y-3">
        <h2 className="font-bold text-navy text-[16px]">Profil klinik</h2>
        <Isian label="Nama klinik" value={k.nama} onChange={(e) => setKl({ nama: e.target.value })} />
        <label className="block"><span className="label">Alamat</span><textarea className="isian min-h-20" value={k.alamat} onChange={(e) => setKl({ alamat: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <Isian label="WhatsApp" value={k.wa} onChange={(e) => setKl({ wa: e.target.value })} />
          <Isian label="Instagram" value={k.ig} onChange={(e) => setKl({ ig: e.target.value })} />
        </div>
        <Isian label="Penanda tangan 1 – nama" value={k.fisioterapis.nama} onChange={(e) => setKl({ fisioterapis: { ...k.fisioterapis, nama: e.target.value } })} />
        <Isian label="Penanda tangan 1 – peran" value={k.fisioterapis.peran} onChange={(e) => setKl({ fisioterapis: { ...k.fisioterapis, peran: e.target.value } })} />
        <Isian label="Penanda tangan 2 – nama" value={k.terapis.nama} onChange={(e) => setKl({ terapis: { ...k.terapis, nama: e.target.value } })} />
        <Isian label="Penanda tangan 2 – peran" value={k.terapis.peran} onChange={(e) => setKl({ terapis: { ...k.terapis, peran: e.target.value } })} />
        <div className="grid grid-cols-2 gap-3">
          <Tombol varian="halus" onClick={() => setK(KLINIK_BAWAAN)}>Isi bawaan</Tombol>
          <Tombol onClick={async () => { await tulisPengaturan('klinik', k); toast('Profil klinik disimpan.'); }}>Simpan</Tombol>
        </div>
      </Kartu>

      <Kartu className="space-y-3">
        <h2 className="font-bold text-navy text-[16px]">Nomor laporan</h2>
        <p className="text-[14px] text-lembut">Format HNC/EV/tahun/bulan/urut. Urutan bertambah otomatis per tahun.</p>
        <div className="flex gap-3 items-end">
          <div className="flex-1"><Isian label="Mulai dari nomor urut" type="number" inputMode="numeric" min={1} value={mulai} onChange={(e) => setMulai(Math.max(1, Number(e.target.value) || 1))} /></div>
          <Tombol varian="kedua" onClick={async () => { await tulisMulaiNomor(mulai); toast('Nomor awal disimpan.'); }}>Simpan</Tombol>
        </div>
      </Kartu>

      <Kartu className="space-y-3">
        <h2 className="font-bold text-navy text-[16px]">Ganti PIN</h2>
        {(['lama', 'baru', 'ulang'] as const).map((f) => (
          <Isian key={f} label={{ lama: 'PIN lama', baru: 'PIN baru (6 angka)', ulang: 'Ulangi PIN baru' }[f]} type="password" inputMode="numeric" maxLength={6} autoComplete="off"
            value={pin[f]} onChange={(e) => setPin({ ...pin, [f]: e.target.value.replace(/\D/g, '') })} />
        ))}
        {pesanPin ? <p className="text-[14px] text-[#9b3b2f]">{pesanPin}</p> : null}
        <Tombol varian="kedua" className="w-full" disabled={!pinValid(pin.lama) || !pinValid(pin.baru) || pin.baru !== pin.ulang} onClick={async () => {
          const h = await bacaPengaturan<HashPin>('pin');
          if (!h || !(await cocokPin(pin.lama, h))) { setPesanPin('PIN lama salah.'); return; }
          await tulisPengaturan('pin', await buatHashPin(pin.baru));
          setPin({ lama: '', baru: '', ulang: '' }); setPesanPin(''); toast('PIN diganti.');
        }}>Ganti PIN</Tombol>
      </Kartu>

      <Kartu className="space-y-2">
        <h2 className="font-bold text-navy text-[16px]">Tentang aplikasi</h2>
        <p className="text-[14px]">Versi {__VERSI__} · {online ? 'Online' : 'Offline'} · {navigator.serviceWorker?.controller ? 'siap dipakai tanpa internet' : 'mode offline belum siap (buka sekali lagi saat online)'}</p>
      </Kartu>

      <Kartu className="space-y-2 text-[14px] text-lembut">
        <h2 className="font-bold text-navy text-[16px]">Bantuan</h2>
        <p><b>Alur kerja:</b> tambah anak → catat setiap sesi → Evaluasi Awal → setelah 24 sesi, Evaluasi Lanjutan → Buat laporan → Bagikan PDF ke WhatsApp.</p>
        <p><b>Data</b> hanya tersimpan di iPhone ini, tidak dikirim ke internet. Cadangkan secara rutin ke iCloud Drive.</p>
        <p><b>Lupa PIN?</b> Data tidak bisa dibuka tanpa PIN. Hapus aplikasi, pasang ulang, lalu pulihkan dari cadangan.</p>
      </Kartu>
    </Layar>
  );
}
