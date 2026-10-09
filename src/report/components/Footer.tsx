// Footer (D6). Sits below the content box, so every text is a render-prop (laid out per page; static
// children of a fixed view outside the content box are dropped by react-pdf's pagination).
// 'Rahasia – untuk orang tua/wali' | report number | 'Halaman X dari Y' (cover counts as page 1).
import { Text, View } from '@react-pdf/renderer';
import { ANGKA, HALAMAN, LEBAR_ISI, WARNA } from '../theme.ts';

export const TEKS_RAHASIA = 'Rahasia – untuk orang tua/wali';

export function Footer({ nomor }: { nomor: string }) {
  const gaya = { fontSize: 6.8, color: WARNA.teksSamar, ...ANGKA };
  return (
    <View
      fixed
      style={{
        position: 'absolute', top: HALAMAN.tinggi - 40, left: HALAMAN.sisi, width: LEBAR_ISI,
        flexDirection: 'row', alignItems: 'center', paddingTop: 7,
        borderTopWidth: 0.6, borderTopColor: WARNA.garis,
      }}
    >
      <Text style={{ ...gaya, width: LEBAR_ISI / 3 }} render={() => TEKS_RAHASIA} />
      <Text style={{ ...gaya, width: LEBAR_ISI / 3, textAlign: 'center' }} render={() => nomor} />
      <Text
        style={{ ...gaya, width: LEBAR_ISI / 3, textAlign: 'right' }}
        render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
      />
    </View>
  );
}
