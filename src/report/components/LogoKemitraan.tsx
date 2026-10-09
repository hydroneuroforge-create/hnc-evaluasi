// Co-branding row for partner children (anak.mitraYasi): HNC lockup → thin divider → YASI logo, centred where the
// HNC logo alone would sit. assets/logo-yasi.png is the partner's original logo as-is (star above the text "Yayasan
// Anak Spesial Indonesia", only the black background made transparent), cropped with the same ink/height ratio as the
// HNC lockup, so both images get the same box height, are vertically centred on one row and nothing overflows it.
import { Image, View } from '@react-pdf/renderer';
import { WARNA } from '../theme.ts';

export const RASIO_LOGO_YASI = 720 / 560; // assets/logo-yasi.png (checked against the PNG by scripts/render-mitra.tsx)

export function LogoKemitraan({ lockup, lebar, tinggi, yasi }: { lockup: string; lebar: number; tinggi: number; yasi: string }) {
  return (
    <View style={{ height: tinggi, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Image src={lockup} style={{ width: lebar, height: tinggi }} />
      <View style={{ width: 0.75, height: 0.7 * tinggi, backgroundColor: WARNA.garis, marginHorizontal: 0.2 * tinggi }} />
      <Image src={yasi} style={{ height: tinggi, width: tinggi * RASIO_LOGO_YASI }} />
    </View>
  );
}
