// Sessions-per-month bars. Rendered ONLY when the input has a session log (tren.sesiPerBulan !== null).
import { G, Line, Rect, Svg } from '@react-pdf/renderer';
import { WARNA } from '../theme.ts';
import { SvgTeks } from './util.tsx';

export interface SesiBulan { bulan: string; label: string; jumlah: number }

const singkat = (label: string) => {
  const [bulan, tahun] = label.split(' ');
  return `${(bulan ?? '').slice(0, 3)} ${(tahun ?? '').slice(2)}`;
};

export function BarSesi({ data, lebar = 300, tinggi = 130 }: { data: SesiBulan[]; lebar?: number; tinggi?: number }) {
  const kiri = 8;
  const atas = 14;
  const bawah = 18;
  const w = lebar - kiri * 2;
  const h = tinggi - atas - bawah;
  const maks = Math.max(1, ...data.map((d) => d.jumlah));
  const kolom = w / Math.max(1, data.length);
  const lebarBar = Math.min(26, kolom * 0.6);
  return (
    <Svg width={lebar} height={tinggi} viewBox={`0 0 ${lebar} ${tinggi}`}>
      <Line x1={kiri} y1={atas + h} x2={kiri + w} y2={atas + h} stroke={WARNA.garis} strokeWidth={0.8} />
      {data.map((d, i) => {
        const bh = (d.jumlah / maks) * h;
        const cx = kiri + kolom * (i + 0.5);
        return (
          <G key={d.bulan}>
            <Rect key={`r${d.bulan}`} x={cx - lebarBar / 2} y={atas + h - bh} width={lebarBar} height={Math.max(0.01, bh)} rx={2.5} ry={2.5} fill={WARNA.teal} />
            <SvgTeks key={`v${d.bulan}`} x={cx} y={atas + h - bh - 4} ukuran={7} tebal={700} warna={WARNA.navy} anchor="middle">{String(d.jumlah)}</SvgTeks>
            <SvgTeks key={`l${d.bulan}`} x={cx} y={tinggi - 6} ukuran={6} warna={WARNA.teksLembut} anchor="middle">{singkat(d.label)}</SvgTeks>
          </G>
        );
      })}
    </Svg>
  );
}
