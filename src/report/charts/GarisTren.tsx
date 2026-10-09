// Trend line of the overall Skor Perkembangan per evaluation (0–100, higher = more developed, bottom→top).
import { Circle, G, Line, Path, Polyline, Svg } from '@react-pdf/renderer';
import type { TitikTren } from '../../core/index.ts';
import { WARNA } from '../theme.ts';
import { SvgTeks } from './util.tsx';

export function GarisTren({ titik, lebar = 300, tinggi = 150 }: { titik: TitikTren[]; lebar?: number; tinggi?: number }) {
  const kiri = 48;
  const kanan = 48;
  const atas = 14;
  const bawah = 30;
  const w = lebar - kiri - kanan;
  const h = tinggi - atas - bawah;
  const n = titik.length;
  const x = (i: number) => kiri + (n <= 1 ? w / 2 : (w * i) / (n - 1));
  const y = (v: number) => atas + h - (Math.max(0, Math.min(100, v)) / 100) * h;
  const ada = titik.map((t, i) => ({ t, i })).filter((p) => p.t.skorBulat !== null);
  const garis = ada.map((p) => `${x(p.i).toFixed(2)},${y(p.t.skorBulat!).toFixed(2)}`).join(' ');
  const area = ada.length > 1
    ? `M ${x(ada[0]!.i)} ${y(0)} ` + ada.map((p) => `L ${x(p.i).toFixed(2)} ${y(p.t.skorBulat!).toFixed(2)}`).join(' ') + ` L ${x(ada[ada.length - 1]!.i)} ${y(0)} Z`
    : '';
  return (
    <Svg width={lebar} height={tinggi} viewBox={`0 0 ${lebar} ${tinggi}`}>
      {[0, 25, 50, 75, 100].map((v) => (
        <Line key={v} x1={kiri} y1={y(v)} x2={kiri + w} y2={y(v)} stroke={v === 0 ? WARNA.garis : WARNA.garisLembut} strokeWidth={v === 0 ? 0.8 : 0.5} />
      ))}
      {[0, 25, 50, 75, 100].map((v) => (
        <SvgTeks key={`l${v}`} x={kiri - 5} y={y(v) + 2.2} ukuran={6} warna={WARNA.teksSamar} anchor="end">{String(v)}</SvgTeks>
      ))}
      {area ? <Path d={area} fill={WARNA.aqua} fillOpacity={0.14} /> : null}
      {ada.length > 1 ? <Polyline points={garis} fill="none" stroke={WARNA.petrol} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" /> : null}
      {ada.map((p, k) => {
        const terakhir = k === ada.length - 1;
        const cx = x(p.i);
        const cy = y(p.t.skorBulat!);
        return (
          <G key={p.i}>
            <Circle key={`c${p.i}`} cx={cx} cy={cy} r={terakhir ? 4.4 : 3.6} fill={terakhir ? WARNA.petrol : WARNA.putih} stroke={terakhir ? WARNA.petrol : WARNA.awal} strokeWidth={1.4} />
            <SvgTeks key={`v${p.i}`} x={cx} y={cy - 8} ukuran={8.5} tebal={800} warna={terakhir ? WARNA.navy : WARNA.teksLembut} anchor="middle">{String(p.t.skorBulat)}</SvgTeks>
          </G>
        );
      })}
      {titik.map((t, i) => (
        <SvgTeks key={`x${i}`} x={x(i)} y={tinggi - bawah + 13} ukuran={6.4} tebal={600} warna={WARNA.teksLembut} anchor="middle">{t.tanggalTeks}</SvgTeks>
      ))}
      {titik.map((t, i) => (
        <SvgTeks key={`e${i}`} x={x(i)} y={tinggi - bawah + 22} ukuran={5.8} warna={WARNA.teksSamar} anchor="middle">{`Evaluasi ${t.urutan}`}</SvgTeks>
      ))}
    </Svg>
  );
}
