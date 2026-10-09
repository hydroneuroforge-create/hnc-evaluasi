// Co-branding row for partner children (anak.mitraYasi): HNC lockup → thin divider → YASI logo, centred where the
// HNC logo alone would sit. assets/logo-yasi.png is a horizontal lockup with the same ink/height ratio as the HNC
// lockup, so both images get the same box height and sit on one line; nothing overflows the HNC logo's height.
import { Image, View } from '@react-pdf/renderer';
import { WARNA } from '../theme.ts';

export const RASIO_LOGO_YASI = 500 / 179; // assets/logo-yasi.png

export function LogoKemitraan({ lockup, lebar, tinggi, yasi }: { lockup: string; lebar: number; tinggi: number; yasi: string }) {
  return (
    <View style={{ height: tinggi, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Image src={lockup} style={{ width: lebar, height: tinggi }} />
      <View style={{ width: 0.75, height: 0.7 * tinggi, backgroundColor: WARNA.garis, marginHorizontal: 0.2 * tinggi }} />
      <Image src={yasi} style={{ height: tinggi, width: tinggi * RASIO_LOGO_YASI }} />
    </View>
  );
}
