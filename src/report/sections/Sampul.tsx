// 1. Sampul (cover): logo lockup, title, child's name, period, sessions, therapists, report number and a vector
// water-wave motif at the bottom (never under the logo). No kop, no footer, no photo.
import { Defs, Image, LinearGradient, Page, Path, Stop, Svg, Text, View } from '@react-pdf/renderer';
import type { PropsBagian } from '../components/Halaman.tsx';
import { gayaHalaman, Spanduk } from '../components/Halaman.tsx';
import { ANGKA, HALAMAN, WARNA } from '../theme.ts';

function MotifGelombang() {
  const L = HALAMAN.lebar;
  const T = 210;
  return (
    <Svg width={L} height={T} viewBox={`0 0 ${L} ${T}`} style={{ position: 'absolute', left: 0, bottom: 0 }}>
      <Defs>
        <LinearGradient id="gel1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={WARNA.aqua} stopOpacity={0.35} />
          <Stop offset="1" stopColor={WARNA.teal} stopOpacity={0.55} />
        </LinearGradient>
        <LinearGradient id="gel2" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={WARNA.slate} stopOpacity={0.75} />
          <Stop offset="1" stopColor={WARNA.aqua} stopOpacity={0.8} />
        </LinearGradient>
        <LinearGradient id="gel3" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={WARNA.petrolTua} />
          <Stop offset="1" stopColor={WARNA.petrol} />
        </LinearGradient>
      </Defs>
      <Path d={`M0 70 C ${L * 0.18} 30, ${L * 0.36} 110, ${L * 0.55} 72 S ${L * 0.85} 30, ${L} 62 L ${L} ${T} L 0 ${T} Z`} fill="url(#gel1)" />
      <Path d={`M0 112 C ${L * 0.2} 80, ${L * 0.42} 150, ${L * 0.62} 112 S ${L * 0.9} 82, ${L} 104 L ${L} ${T} L 0 ${T} Z`} fill="url(#gel2)" />
      <Path d={`M0 152 C ${L * 0.22} 128, ${L * 0.45} 180, ${L * 0.68} 150 S ${L * 0.92} 132, ${L} 146 L ${L} ${T} L 0 ${T} Z`} fill="url(#gel3)" />
      <Path d={`M0 112 C ${L * 0.2} 80, ${L * 0.42} 150, ${L * 0.62} 112 S ${L * 0.9} 82, ${L} 104`} stroke={WARNA.putih} strokeOpacity={0.6} strokeWidth={0.8} fill="none" />
    </Svg>
  );
}

function Info({ label, isi, lebar }: { label: string; isi: string; lebar: number }) {
  return (
    <View style={{ width: lebar, alignItems: 'center' }}>
      <Text style={{ fontSize: 6.8, fontWeight: 600, color: WARNA.slate, letterSpacing: 1.3, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ fontSize: 10, fontWeight: 600, color: WARNA.navy, marginTop: 3, textAlign: 'center', ...ANGKA }}>{isi}</Text>
    </View>
  );
}

export function Sampul({ siap, aset, spanduk }: PropsBagian) {
  const [a, b] = siap.pengesahan.penandatangan;
  return (
    <Page size="A4" style={{ ...gayaHalaman, paddingHorizontal: 56, paddingTop: 70 }} bookmark={{ title: 'Sampul', fit: true }}>
      {spanduk ? <Spanduk teks={spanduk} top={30} /> : null}
      <View style={{ alignItems: 'center' }}>
        <Image src={aset.logoLockup} style={{ width: 205, height: 80.1 }} />
      </View>
      <View style={{ alignItems: 'center', marginTop: 92 }}>
        <Text style={{ fontSize: 7.4, fontWeight: 600, color: WARNA.aksen, letterSpacing: 2.6 }}>LAPORAN EVALUASI</Text>
        <Text style={{ fontSize: 27, fontWeight: 800, color: WARNA.navy, marginTop: 10, textAlign: 'center', lineHeight: 1.15 }}>
          Laporan Perkembangan Hidroterapi
        </Text>
        <Text style={{ fontSize: 11.5, fontStyle: 'italic', color: WARNA.slate, marginTop: 6 }}>Hydrotherapy Progress Report</Text>
        <View style={{ flexDirection: 'row', marginTop: 26, alignItems: 'center' }}>
          <View style={{ width: 36, height: 0.8, backgroundColor: WARNA.aqua }} />
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: WARNA.petrol, marginHorizontal: 8 }} />
          <View style={{ width: 36, height: 0.8, backgroundColor: WARNA.aqua }} />
        </View>
        <Text style={{ fontSize: 7.4, fontWeight: 600, color: WARNA.teksSamar, letterSpacing: 2, marginTop: 24 }}>DISUSUN UNTUK</Text>
        <Text style={{ fontSize: 22, fontWeight: 700, color: WARNA.petrol, marginTop: 7, textAlign: 'center', lineHeight: 1.2 }}>{siap.anak.namaLengkap}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 40, paddingVertical: 14, borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: WARNA.garis }}>
        <Info label="Periode Evaluasi" isi={siap.periode.teks} lebar={205} />
        <View style={{ width: 0.6, backgroundColor: WARNA.garis }} />
        <Info label="Jumlah Sesi" isi={siap.jumlahSesiTeks} lebar={110} />
        <View style={{ width: 0.6, backgroundColor: WARNA.garis }} />
        <Info label="Nomor Laporan" isi={siap.meta.nomor} lebar={150} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        {[a, b].map((p) => (
          <View key={p.kunci} style={{ width: 210, alignItems: 'center' }}>
            <Text style={{ fontSize: 9.4, fontWeight: 600, color: WARNA.navy }}>{p.nama}</Text>
            <Text style={{ fontSize: 7.6, color: WARNA.teksLembut, marginTop: 1.5 }}>{p.peran}</Text>
          </View>
        ))}
      </View>
      <MotifGelombang />
      <Text style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 7.4, color: WARNA.putih, letterSpacing: 1 }}>
        {siap.klinik.nama}  ·  {siap.meta.tempat}, {siap.meta.tanggal}
      </Text>
    </Page>
  );
}
