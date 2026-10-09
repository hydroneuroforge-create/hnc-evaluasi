// Shared UI pieces: navigation (hash routes), header, buttons, segmented control, toast, sharing.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { NAMA_BULAN } from '../../src/core/index.ts';
import { dengarPerubahan } from './db.ts';

// --- routing -------------------------------------------------------------------------------------------------
export const keRute = (r: string): void => { location.hash = r; };
export function useRute(): string[] {
  const baca = () => (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
  const [r, setR] = useState(baca);
  useEffect(() => {
    const f = () => { setR(baca()); window.scrollTo(0, 0); };
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return r;
}

/** Loads data and reloads after any DB write. */
export function useData<T>(muat: () => Promise<T>, deps: unknown[]): [T | undefined, () => void] {
  const [d, setD] = useState<T>();
  const [n, setN] = useState(0);
  const ulang = useCallback(() => setN((x) => x + 1), []);
  useEffect(() => dengarPerubahan(ulang), [ulang]);
  useEffect(() => {
    let aktif = true;
    muat().then((x) => { if (aktif) setD(x); }, (e) => console.error(e));
    return () => { aktif = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);
  return [d, ulang];
}

// --- toast -------------------------------------------------------------------------------------------------
type Toast = { teks: string; aksi?: { label: string; f: () => void } };
let setToastGlobal: ((t: Toast | null) => void) | null = null;
export function toast(teks: string, aksi?: Toast['aksi']): void { setToastGlobal?.({ teks, ...(aksi ? { aksi } : {}) }); }
export function WadahToast() {
  const [t, setT] = useState<Toast | null>(null);
  useEffect(() => { setToastGlobal = setT; return () => { setToastGlobal = null; }; }, []);
  useEffect(() => { if (!t) return; const h = setTimeout(() => setT(null), 5000); return () => clearTimeout(h); }, [t]);
  if (!t) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 aman-bawah aman-x pointer-events-none" role="status">
      <div className="mx-auto max-w-md pointer-events-auto flex items-center gap-3 rounded-2xl bg-navy text-white px-4 py-3 shadow-lg">
        <span className="flex-1 text-[15px]">{t.teks}</span>
        {t.aksi ? <button className="min-h-11 px-3 font-semibold text-aqua" onClick={() => { t.aksi!.f(); setT(null); }}>{t.aksi.label}</button> : null}
      </div>
    </div>
  );
}

// --- layout ------------------------------------------------------------------------------------------------
export function Layar({ judul, kembali, kanan, children, bawah }: { judul: ReactNode; kembali?: string; kanan?: ReactNode; children: ReactNode; bawah?: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 bg-latar/90 backdrop-blur aman-atas aman-x border-b border-garis/60">
        <div className="mx-auto max-w-xl flex items-center gap-2 min-h-12 pb-2">
          {kembali !== undefined ? (
            <button aria-label="Kembali" className="-ml-2 size-11 grid place-items-center rounded-full text-petrol active:bg-latar-teal" onClick={() => (kembali ? keRute(kembali) : history.back())}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          ) : null}
          <h1 className="flex-1 text-[19px] font-bold text-navy truncate">{judul}</h1>
          {kanan}
        </div>
      </header>
      <main className="flex-1 aman-x pt-4 pb-28"><div className="mx-auto max-w-xl space-y-4">{children}</div></main>
      {bawah ? (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur border-t border-garis aman-x aman-bawah pt-3">
          <div className="mx-auto max-w-xl flex gap-3">{bawah}</div>
        </div>
      ) : null}
    </div>
  );
}

type Varian = 'utama' | 'kedua' | 'halus' | 'bahaya';
const GAYA: Record<Varian, string> = {
  utama: 'bg-petrol text-white active:bg-petrol-tua shadow-sm',
  kedua: 'bg-latar-teal text-petrol-tua active:bg-[#d8eaec]',
  halus: 'bg-white text-petrol border border-garis active:bg-latar',
  bahaya: 'bg-white text-[#9b3b2f] border border-[#ecd2cc] active:bg-[#fbf1ef]',
};
export function Tombol({ varian = 'utama', className = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { varian?: Varian }) {
  return <button {...p} className={`min-h-12 px-5 rounded-2xl font-semibold text-[16px] disabled:opacity-40 transition-colors ${GAYA[varian]} ${className}`} />;
}

export function Kartu({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return onClick
    ? <button onClick={onClick} className={`kartu w-full text-left p-4 active:bg-latar ${className}`}>{children}</button>
    : <section className={`kartu p-4 ${className}`}>{children}</section>;
}

export function Lencana({ children, warna = 'teal' }: { children: ReactNode; warna?: 'teal' | 'emas' | 'abu' }) {
  const c = { teal: 'bg-[#D5EAE7] text-[#1C5450]', emas: 'bg-[#F6EBD3] text-[#7A5A12]', abu: 'bg-latar text-lembut' }[warna];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${c}`}>{children}</span>;
}

export function Isian({ label, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block"><span className="label">{label}</span><input {...p} className="isian" /></label>;
}

/** Month (Januari–Desember) + year picker; emits 'YYYY-MM', or undefined while incomplete/empty. */
export function PilihBulan({ label, nilai, onUbah, petunjuk }: { label: string; nilai: string | undefined; onUbah: (ym: string | undefined) => void; petunjuk?: ReactNode }) {
  const [b, setB] = useState(nilai ? String(Number(nilai.slice(5, 7))) : '');
  const [t, setT] = useState(nilai ? nilai.slice(0, 4) : '');
  useEffect(() => { if (nilai) { setB(String(Number(nilai.slice(5, 7)))); setT(nilai.slice(0, 4)); } }, [nilai]);
  const ubah = (bb: string, tt: string) => {
    setB(bb); setT(tt);
    onUbah(bb && /^\d{4}$/.test(tt) ? `${tt}-${bb.padStart(2, '0')}` : undefined);
  };
  return (
    <div>
      <span className="label">{label}</span>
      <div className="grid grid-cols-[1fr_6.5rem] gap-2">
        <select className="isian" aria-label={`${label} bulan`} value={b} onChange={(e) => ubah(e.target.value, t)}>
          <option value="">Bulan</option>
          {NAMA_BULAN.map((n, i) => <option key={n} value={String(i + 1)}>{n}</option>)}
        </select>
        <input className="isian" aria-label={`${label} tahun`} inputMode="numeric" maxLength={4} placeholder="Tahun" value={t} onChange={(e) => ubah(b, e.target.value.replace(/\D/g, ''))} />
      </div>
      {petunjuk}
    </div>
  );
}

/** Segmented 1–4 control plus optional special status. */
export function Segmen<T extends string | number>({ pilihan, nilai, onPilih, petunjuk }: {
  pilihan: { nilai: T; label: string; sub?: string }[]; nilai: T | null | undefined; onPilih: (v: T) => void; petunjuk?: T | null;
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(pilihan.length, 4)}, minmax(0, 1fr))` }}>
      {pilihan.map((p) => {
        const aktif = p.nilai === nilai;
        return (
          <button key={String(p.nilai)} type="button" onClick={() => onPilih(p.nilai)}
            className={`relative min-h-14 rounded-xl px-1.5 py-2 text-center leading-tight border transition-colors ${aktif ? 'bg-petrol border-petrol text-white' : 'bg-white border-garis text-teks active:bg-latar'}`}>
            <span className="block text-[17px] font-bold">{p.label}</span>
            {p.sub ? <span className={`block text-[11px] mt-0.5 ${aktif ? 'text-white/85' : 'text-lembut'}`}>{p.sub}</span> : null}
            {petunjuk === p.nilai ? <span className={`absolute top-1 right-1.5 text-[10px] font-semibold ${aktif ? 'text-aqua' : 'text-teal'}`}>lalu</span> : null}
          </button>
        );
      })}
    </div>
  );
}

// --- files ---------------------------------------------------------------------------------------------------
/** Share a PDF through the iOS share sheet; fall back to download/open. Must run inside a tap handler. */
export async function bagikanBerkas(bytes: Uint8Array, nama: string, mime = 'application/pdf'): Promise<void> {
  const berkas = new File([bytes as BlobPart], nama, { type: mime });
  if (navigator.canShare?.({ files: [berkas] })) {
    try { await navigator.share({ files: [berkas], title: nama }); return; } catch (e) { if ((e as Error).name === 'AbortError') return; }
  }
  unduhBerkas(bytes, nama, mime);
}
export function unduhBerkas(bytes: Uint8Array, nama: string, mime = 'application/pdf'): void {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = nama; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
