// Program journey map: the chapters as stations on a wave path with BEFORE→AFTER %, 'n dari N aktivitas sudah
// diberikan' and a 'Posisi saat ini' marker (D10).
import { Circle, G, Path, Svg, Text, View } from '@react-pdf/renderer';
import type { SkorBab } from '../../core/index.ts';
import { ANGKA, WARNA } from '../theme.ts';
import { busur, SvgTeks } from './util.tsx';

export function PetaPerjalanan({ bab, posisi, lebar = 511, labelPosisi = 'Posisi saat ini' }: {
  bab: SkorBab[]; posisi: 1 | 2 | 3; lebar?: number; labelPosisi?: string;
}) {
  const tinggi = 142;
  const yStasiun = 58;
  const xs = bab.map((_, i) => (lebar * (i + 0.5)) / bab.length);
  const kotak = lebar / bab.length - 16;
  const gelombang = `M 0 ${yStasiun + 6} C ${lebar * 0.1} ${yStasiun - 14}, ${lebar * 0.24} ${yStasiun + 22}, ${lebar * 0.36} ${yStasiun}
    S ${lebar * 0.6} ${yStasiun - 18}, ${lebar * 0.7} ${yStasiun + 4} S ${lebar * 0.92} ${yStasiun + 16}, ${lebar} ${yStasiun - 4}`;
  return (
    <View style={{ width: lebar, height: tinggi, position: 'relative' }}>
      <Svg width={lebar} height={tinggi} viewBox={`0 0 ${lebar} ${tinggi}`}>
        <Path d={gelombang} stroke={WARNA.aqua} strokeOpacity={0.6} strokeWidth={5} fill="none" strokeLinecap="round" />
        <Path d={gelombang} stroke={WARNA.putih} strokeWidth={0.8} fill="none" strokeDasharray="2 4" />
        {bab.map((b, i) => {
          const x = xs[i]!;
          const aktif = b.bab === posisi;
          const persen = b.akhirBulat ?? 0;
          return (
            <G key={b.bab}>
              <Circle cx={x} cy={yStasiun} r={27} fill={WARNA.putih} stroke={aktif ? WARNA.petrol : WARNA.garis} strokeWidth={aktif ? 1.6 : 1} />
              <Circle cx={x} cy={yStasiun} r={22} fill="none" stroke={WARNA.garisLembut} strokeWidth={4} />
              {b.awalBulat !== null && b.awalBulat > 0 ? (
                <Path d={busur(x, yStasiun, 22, 0, Math.min(359.9, (b.awalBulat / 100) * 360))} stroke={WARNA.awalMuda} strokeWidth={4} fill="none" />
              ) : null}
              {persen > 0 ? (
                <Path d={busur(x, yStasiun, 22, 0, Math.min(359.9, (persen / 100) * 360))} stroke={WARNA.petrol} strokeWidth={4} fill="none" strokeLinecap="round" />
              ) : null}
              <SvgTeks x={x} y={yStasiun + 4} ukuran={12} tebal={800} warna={WARNA.navy} anchor="middle">{b.akhirBulat === null ? '–' : `${b.akhirBulat}%`}</SvgTeks>
              <Circle cx={x - 27} cy={yStasiun - 20} r={7} fill={aktif ? WARNA.petrol : WARNA.slateBiru} />
              <SvgTeks x={x - 27} y={yStasiun - 17.6} ukuran={7} tebal={700} warna={WARNA.putih} anchor="middle">{String(b.bab)}</SvgTeks>
            </G>
          );
        })}
      </Svg>
      {bab.map((b, i) => {
        const x = xs[i]!;
        return (
          <View key={b.bab} style={{ position: 'absolute', left: x - kotak / 2, width: kotak, top: yStasiun + 33, alignItems: 'center' }}>
            <Text style={{ fontSize: 8.6, fontWeight: 700, color: WARNA.navy, textAlign: 'center', lineHeight: 1.2 }}>{b.nama}</Text>
            {b.namaInggris !== b.nama ? (
              <Text style={{ fontSize: 6.4, color: WARNA.teksSamar, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.25 }}>{b.namaInggris}</Text>
            ) : <Text style={{ fontSize: 6.4, lineHeight: 1.25 }}> </Text>}
            <Text style={{ fontSize: 7, color: WARNA.teksLembut, marginTop: 2, ...ANGKA }}>
              <Text style={{ color: WARNA.awal }}>{b.awalBulat === null ? '–' : `${b.awalBulat}%`}</Text>
              {'  →  '}
              <Text style={{ color: WARNA.petrol, fontWeight: 700 }}>{b.akhirBulat === null ? '–' : `${b.akhirBulat}%`}</Text>
            </Text>
            <Text style={{ fontSize: 6.4, color: WARNA.teksSamar, marginTop: 1, ...ANGKA }}>{b.teksDiberikan}</Text>
          </View>
        );
      })}
      {bab.filter((b) => b.bab === posisi).map((b) => {
        const x = xs[bab.indexOf(b)]!;
        return (
          <View key="posisi" style={{ position: 'absolute', left: x - 45, width: 90, top: 4, alignItems: 'center' }}>
            <View style={{ backgroundColor: WARNA.petrol, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 7 }}>
              <Text style={{ fontSize: 6.6, fontWeight: 700, color: WARNA.putih, lineHeight: 1.2 }}>{labelPosisi}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
