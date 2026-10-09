// Vector medal icon for 'Pencapaian Utama' and a target icon for 'Fokus Berikutnya'.
import { Circle, Path, Polygon, Svg, Text as SvgText } from '@react-pdf/renderer';
import { ANGKA, FONT, WARNA } from '../theme.ts';
import { titikBintang } from './Bintang.tsx';

export function Medali({ ukuran = 22, nomor }: { ukuran?: number; nomor?: number }) {
  return (
    <Svg width={ukuran} height={ukuran * 1.2} viewBox="0 0 22 26.4">
      <Polygon points="6,13 3,25 7.5,22.6 9.6,26 11,15" fill={WARNA.aqua} />
      <Polygon points="16,13 19,25 14.5,22.6 12.4,26 11,15" fill={WARNA.slate} />
      <Circle cx={11} cy={9.6} r={9} fill={WARNA.petrol} />
      <Circle cx={11} cy={9.6} r={7} fill="none" stroke={WARNA.aqua} strokeWidth={0.8} />
      {nomor === undefined ? (
        <Polygon points={titikBintang(11, 9.9, 4.2)} fill={WARNA.putih} />
      ) : (
        <SvgText x={11} y={12.6} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8.4, fontWeight: 800, ...ANGKA }} fill={WARNA.putih}>
          {String(nomor)}
        </SvgText>
      )}
    </Svg>
  );
}

export function IkonFokus({ ukuran = 20 }: { ukuran?: number }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={9} fill={WARNA.latarTeal} stroke={WARNA.aqua} strokeWidth={0.8} />
      <Circle cx={10} cy={10} r={5.6} fill="none" stroke={WARNA.teal} strokeWidth={1} />
      <Circle cx={10} cy={10} r={2.2} fill={WARNA.petrol} />
      <Path d="M10 10 L16.5 3.5" stroke={WARNA.petrol} strokeWidth={1.1} strokeLinecap="round" />
      <Polygon points="16.9,1.9 18.2,1.8 18.1,3.1 16.5,4.6 15.4,4.5 15.3,3.4" fill={WARNA.petrol} />
    </Svg>
  );
}
