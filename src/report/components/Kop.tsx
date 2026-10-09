// Kop (D6): fixed header on every page except the cover. Logo MARK + clinic name/address on the left,
// report title + child's full name on the right.
import { Image, Text, View } from '@react-pdf/renderer';
import type { LaporanSiap } from '../../core/index.ts';
import { HALAMAN, UKURAN, WARNA } from '../theme.ts';

export function Kop({ siap, logoMark }: { siap: LaporanSiap; logoMark: string }) {
  return (
    <View
      fixed
      style={{
        position: 'absolute', top: 22, left: HALAMAN.sisi, right: HALAMAN.sisi,
        flexDirection: 'row', alignItems: 'center', paddingBottom: 8,
        borderBottomWidth: 0.6, borderBottomColor: WARNA.garis,
      }}
    >
      <Image src={logoMark} style={{ width: 33, height: 26.2, marginRight: 8 }} />
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontSize: 8.6, fontWeight: 700, color: WARNA.navy, letterSpacing: 0.2 }}>{siap.klinik.nama}</Text>
        <Text style={{ fontSize: 6.2, color: WARNA.teksSamar, lineHeight: 1.35, marginTop: 1 }}>{siap.klinik.alamat}</Text>
      </View>
      <View style={{ width: 150, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: UKURAN.kecil, fontWeight: 600, color: WARNA.petrol }}>Laporan Perkembangan Hidroterapi</Text>
        <Text style={{ fontSize: 7.2, color: WARNA.teksLembut, marginTop: 1.5 }}>{siap.anak.namaLengkap}</Text>
      </View>
    </View>
  );
}
