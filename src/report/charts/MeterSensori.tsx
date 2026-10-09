// 4-step sensory meter (Bintang 1→4 left to right, from the scale's axis order and zones). BEFORE = hollow grey
// marker, AFTER = filled petrol marker, arrow in between; unchanged = one ringed dot.
import { Circle, Path, Polygon, Rect, Svg } from '@react-pdf/renderer';
import { urutanSumbu, zonaLevel, type DefinisiSkala, type NilaiTampil } from '../../core/index.ts';
import { titikBintang } from '../components/Bintang.tsx';
import { WARNA, ZONA } from '../theme.ts';
import { posisiSumbu, SvgTeks } from './util.tsx';

export function MeterSensori({ skala, sebelum, sesudah, lebar = 230 }: {
  skala: DefinisiSkala; sebelum: NilaiTampil; sesudah: NilaiTampil; lebar?: number;
}) {
  const tinggi = 40;
  const pad = 2;
  const seg = (lebar - pad * 2) / 4;
  const yJalur = 15;
  const urut = urutanSumbu(skala);
  const x = (n: NilaiTampil) => (n.nilai === null ? null : pad + seg * (posisiSumbu(skala, n.nilai) * 3 + 0.5));
  const xb = x(sebelum);
  const xa = x(sesudah);
  return (
    <Svg width={lebar} height={tinggi} viewBox={`0 0 ${lebar} ${tinggi}`}>
      {urut.map((v, i) => {
        const z = ZONA[zonaLevel(skala, v)];
        return <Rect key={v} x={pad + i * seg + 0.8} y={yJalur - 4.5} width={seg - 1.6} height={9} rx={4.5} ry={4.5} fill={z.muda} stroke={z.kuat} strokeWidth={0.5} />;
      })}
      {urut.map((v, i) => {
        const cx = pad + i * seg + seg / 2;
        const bintang = Array.from({ length: v }, (_, k) => cx - ((v - 1) * 5.4) / 2 + k * 5.4);
        return bintang.map((bx, k) => (
          <Polygon key={`${v}-${k}`} points={titikBintang(bx, 32, 2.5)} fill={WARNA.teksSamar} />
        ));
      })}
      {xb !== null && xa !== null && Math.abs(xa - xb) > 1 ? (
        <>
          <Path d={`M ${xb + 7} ${yJalur} L ${xa - 9} ${yJalur}`} stroke={WARNA.petrol} strokeWidth={1} />
          <Path d={`M ${xa - 12} ${yJalur - 3} L ${xa - 8.5} ${yJalur} L ${xa - 12} ${yJalur + 3}`} stroke={WARNA.petrol} strokeWidth={1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {xb !== null ? <Circle cx={xb} cy={yJalur} r={5.2} fill={WARNA.putih} stroke={WARNA.awal} strokeWidth={1.4} /> : null}
      {xa !== null ? (
        xb !== null && Math.abs(xa - xb) <= 1 ? (
          <>
            <Circle cx={xa} cy={yJalur} r={7} fill="none" stroke={WARNA.awal} strokeWidth={1.2} />
            <Circle cx={xa} cy={yJalur} r={4.6} fill={WARNA.petrol} />
          </>
        ) : (
          <Circle cx={xa} cy={yJalur} r={5.6} fill={WARNA.petrol} stroke={WARNA.putih} strokeWidth={1} />
        )
      ) : null}
      {xa !== null && sesudah.nilai !== null ? (
        <SvgTeks x={xa} y={yJalur + 2.3} ukuran={6} tebal={700} warna={WARNA.putih} anchor="middle">{String(sesudah.nilai)}</SvgTeks>
      ) : null}
      {xb !== null && sebelum.nilai !== null && (xa === null || Math.abs(xa - xb) > 1) ? (
        <SvgTeks x={xb} y={yJalur + 2.2} ukuran={5.6} tebal={700} warna={WARNA.awal} anchor="middle">{String(sebelum.nilai)}</SvgTeks>
      ) : null}
    </Svg>
  );
}
