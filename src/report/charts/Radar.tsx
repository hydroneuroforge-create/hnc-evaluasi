// 8-domain radar (D9): geometry in <Svg>, labels as absolutely positioned <Text> views so they wrap and use the
// page font. BEFORE = grey dashed outline, AFTER = petrol filled. '*' marks domains with lower BEFORE coverage.
import { Circle, Line, Polygon, Svg, Text, View } from '@react-pdf/renderer';
import type { SkorDomain } from '../../core/index.ts';
import { ANGKA, WARNA } from '../theme.ts';
import { kutub, SvgTeks } from './util.tsx';

export function Radar({ domain, lebar = 250, tinggi = 210, jariJari = 66 }: {
  domain: SkorDomain[]; lebar?: number; tinggi?: number; jariJari?: number;
}) {
  const cx = lebar / 2;
  const cy = tinggi / 2;
  const n = domain.length;
  const sudut = (i: number) => (360 / n) * i;
  const titik = (nilai: (d: SkorDomain) => number | null) =>
    domain.map((d, i) => kutub(cx, cy, (jariJari * Math.max(0, nilai(d) ?? 0)) / 100, sudut(i)).map((v) => v.toFixed(2)).join(',')).join(' ');
  const cincin = [25, 50, 75, 100];
  const kotakLabel = 74;
  return (
    <View style={{ width: lebar, height: tinggi, position: 'relative' }}>
      <Svg width={lebar} height={tinggi} viewBox={`0 0 ${lebar} ${tinggi}`}>
        {cincin.map((p) => (
          <Polygon
            key={p}
            points={domain.map((_, i) => kutub(cx, cy, (jariJari * p) / 100, sudut(i)).map((v) => v.toFixed(2)).join(',')).join(' ')}
            fill={p === 100 ? WARNA.latar : 'none'}
            stroke={WARNA.garis}
            strokeWidth={p === 100 ? 0.8 : 0.5}
          />
        ))}
        {domain.map((_, i) => {
          const [x, y] = kutub(cx, cy, jariJari, sudut(i));
          return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={WARNA.garis} strokeWidth={0.5} />;
        })}
        {[50, 100].map((p) => (
          <SvgTeks key={p} x={cx + 2} y={cy - (jariJari * p) / 100 + 6.5} ukuran={5} warna={WARNA.teksSamar}>{String(p)}</SvgTeks>
        ))}
        <Polygon points={titik((d) => d.akhirBulat)} fill={WARNA.aqua} fillOpacity={0.35} stroke={WARNA.petrol} strokeWidth={1.4} strokeLinejoin="round" />
        <Polygon points={titik((d) => d.awalBulat)} fill="none" stroke={WARNA.awal} strokeWidth={1.1} strokeDasharray="3 2" strokeLinejoin="round" />
        {domain.map((d, i) => {
          const [x, y] = kutub(cx, cy, (jariJari * (d.akhirBulat ?? 0)) / 100, sudut(i));
          return <Circle key={`a${i}`} cx={x} cy={y} r={2.2} fill={WARNA.petrol} />;
        })}
        {domain.map((d, i) => {
          const [x, y] = kutub(cx, cy, (jariJari * (d.awalBulat ?? 0)) / 100, sudut(i));
          return <Circle key={`b${i}`} cx={x} cy={y} r={1.8} fill={WARNA.putih} stroke={WARNA.awal} strokeWidth={0.9} />;
        })}
      </Svg>
      {domain.map((d, i) => {
        const a = sudut(i);
        const [x, y] = kutub(cx, cy, jariJari + 10, a);
        const sin = Math.sin((a * Math.PI) / 180);
        const kanan = sin > 0.2;
        const kiri = sin < -0.2;
        const left = kanan ? x : kiri ? x - kotakLabel : x - kotakLabel / 2;
        const atas = Math.cos((a * Math.PI) / 180) > 0.7;
        const bawah = Math.cos((a * Math.PI) / 180) < -0.7;
        const top = atas ? y - 21 : bawah ? y : y - 10;
        const rata = kanan ? 'left' : kiri ? 'right' : 'center';
        return (
          <View key={d.id} style={{ position: 'absolute', left, top, width: kotakLabel }}>
            <Text style={{ fontSize: 6.6, fontWeight: 600, color: WARNA.navy, textAlign: rata, lineHeight: 1.2 }}>
              {d.namaSingkat}{d.bertanda ? '*' : ''}
            </Text>
            <Text style={{ fontSize: 6.4, color: WARNA.teksLembut, textAlign: rata, lineHeight: 1.25, ...ANGKA }}>
              <Text style={{ color: WARNA.awal }}>{d.awalBulat ?? '–'}</Text>
              {' → '}
              <Text style={{ color: WARNA.petrol, fontWeight: 700 }}>{d.akhirBulat ?? '–'}</Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
}
