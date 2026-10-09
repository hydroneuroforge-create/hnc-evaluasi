// The A4 report document (PLAN.md §8). Consumes only LaporanSiap (from siapkanLaporan) and AsetRender.
// `bagian` renders a subset of the sections (in canonical order); `spanduk` prints a banner on every page.
import { Document } from '@react-pdf/renderer';
import type { ComponentType } from 'react';
import type { LaporanSiap } from '../core/index.ts';
import type { AsetRender } from './aset.ts';
import type { PropsBagian } from './components/Halaman.tsx';
import { CaraMembaca } from './sections/CaraMembaca.tsx';
import { Glosarium } from './sections/Glosarium.tsx';
import { Kegiatan } from './sections/Kegiatan.tsx';
import { Kesimpulan } from './sections/Kesimpulan.tsx';
import { Pengesahan } from './sections/Pengesahan.tsx';
import { Program } from './sections/Program.tsx';
import { Ringkasan } from './sections/Ringkasan.tsx';
import { Sampul } from './sections/Sampul.tsx';
import { SarafPusat } from './sections/SarafPusat.tsx';
import { Sensori } from './sections/Sensori.tsx';
import { Tren } from './sections/Tren.tsx';

export const BAGIAN = [
  'sampul', 'ringkasan', 'caraMembaca', 'kegiatan', 'sensori', 'sarafPusat', 'program', 'tren', 'kesimpulan', 'glosarium', 'pengesahan',
] as const;
export type BagianId = (typeof BAGIAN)[number];

const KOMPONEN: Record<BagianId, ComponentType<PropsBagian & { nomor?: number }>> = {
  sampul: Sampul, ringkasan: Ringkasan, caraMembaca: CaraMembaca, kegiatan: Kegiatan, sensori: Sensori, sarafPusat: SarafPusat,
  program: Program, tren: Tren, kesimpulan: Kesimpulan, glosarium: Glosarium, pengesahan: Pengesahan,
};

export interface LaporanDocumentProps {
  siap: LaporanSiap;
  aset: AsetRender;
  /** Subset of sections to render (canonical order is kept). Default: all. */
  bagian?: readonly BagianId[];
  /** Banner on every page, e.g. 'CONTOH – data fiktif'. */
  spanduk?: string;
}

export function LaporanDocument({ siap, aset, bagian, spanduk }: LaporanDocumentProps) {
  const pilih = new Set<BagianId>(bagian ?? BAGIAN);
  const daftar = BAGIAN.filter((b) => pilih.has(b));
  let nomor = 0;
  return (
    <Document
      title={siap.meta.judul}
      author={siap.meta.penulis}
      creator={siap.meta.pembuat}
      producer={siap.meta.produser}
      language={siap.meta.bahasa}
      subject="Laporan Perkembangan Hidroterapi"
      pageMode="useOutlines"
    >
      {daftar.map((id) => {
        const K = KOMPONEN[id];
        const n = id === 'sampul' ? undefined : ++nomor;
        return <K key={id} siap={siap} aset={aset} {...(spanduk ? { spanduk } : {})} {...(n !== undefined ? { nomor: n } : {})} />;
      })}
    </Document>
  );
}
