// Page shell for every section except the cover: A4 page with the fixed kop, optional banner and footer.
import { Page, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import type { LaporanSiap } from '../../core/index.ts';
import type { AsetRender } from '../aset.ts';
import { BARIS, FONT, HALAMAN, UKURAN, WARNA } from '../theme.ts';
import { Footer } from './Footer.tsx';
import { Kop } from './Kop.tsx';

/** Props shared by every section component. */
export interface PropsBagian {
  siap: LaporanSiap;
  aset: AsetRender;
  /** Optional banner printed on every page, e.g. 'CONTOH – data fiktif'. */
  spanduk?: string;
}

export const gayaHalaman = {
  fontFamily: FONT,
  fontSize: UKURAN.isi,
  lineHeight: BARIS,
  color: WARNA.teks,
  backgroundColor: WARNA.putih,
} as const;

/** Banner strip (fixed); used on content pages and the cover. */
export function Spanduk({ teks, top }: { teks: string; top: number }) {
  return (
    <View
      fixed
      style={{
        position: 'absolute', top, left: HALAMAN.sisi, right: HALAMAN.sisi,
        backgroundColor: '#FCEEDC', borderRadius: 3, paddingVertical: 2.5,
      }}
    >
      <Text style={{ fontSize: 7, fontWeight: 700, color: '#8A5A1E', textAlign: 'center', letterSpacing: 1.2 }}>{teks}</Text>
    </View>
  );
}

export function HalamanIsi({ siap, aset, spanduk, bookmark, children }: PropsBagian & { bookmark: string; children: ReactNode }) {
  return (
    <Page
      size="A4"
      wrap
      bookmark={{ title: bookmark, fit: true }}
      style={{
        ...gayaHalaman,
        paddingTop: HALAMAN.atas + (spanduk ? 20 : 0),
        paddingBottom: HALAMAN.bawah + 8,
        paddingHorizontal: HALAMAN.sisi,
      }}
    >
      <Kop siap={siap} logoMark={aset.logoMark} />
      {spanduk ? <Spanduk teks={spanduk} top={HALAMAN.atas - 8} /> : null}
      <Footer nomor={siap.meta.nomor} />
      {children}
    </Page>
  );
}
