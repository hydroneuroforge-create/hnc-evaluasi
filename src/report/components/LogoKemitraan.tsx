// Co-branding row for partner children (anak.mitraYasi): HNC lockup → thin divider → YASI logo, centred where the
// HNC logo alone would sit. The outer box keeps the HNC logo's height, so the taller YASI logo overflows it
// symmetrically and everything below stays exactly where it is without the partner logo.
import { Image, View } from '@react-pdf/renderer';
import { WARNA } from '../theme.ts';

export const RASIO_LOGO_YASI = 800 / 609; // assets/logo-yasi.png

export function LogoKemitraan({ lockup, lebar, tinggi, yasi, skala = 1.25 }: { lockup: string; lebar: number; tinggi: number; yasi: string; skala?: number }) {
  return (
    <View style={{ height: tinggi, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Image src={lockup} style={{ width: lebar, height: tinggi }} />
      <View style={{ width: 0.75, height: 0.8 * tinggi, backgroundColor: WARNA.garis, marginHorizontal: 0.25 * tinggi }} />
      <Image src={yasi} style={{ height: skala * tinggi, width: skala * tinggi * RASIO_LOGO_YASI }} />
    </View>
  );
}
