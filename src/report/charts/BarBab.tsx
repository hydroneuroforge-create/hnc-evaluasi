// Paired horizontal bars (0–100) per row: BEFORE grey (thin), AFTER petrol. Used for the Program chapters and
// the per-domain change table.
import { Rect, Svg } from '@react-pdf/renderer';
import { WARNA } from '../theme.ts';

export function BarPasangan({ awal, akhir, lebar = 120 }: { awal: number | null; akhir: number | null; lebar?: number }) {
  const t = 13;
  const w = (v: number | null) => (v === null ? 0 : Math.max(0, Math.min(100, v)) / 100 * lebar);
  return (
    <Svg width={lebar} height={t} viewBox={`0 0 ${lebar} ${t}`}>
      <Rect x={0} y={1} width={lebar} height={4} rx={2} ry={2} fill={WARNA.garisLembut} />
      {w(awal) > 0 ? <Rect x={0} y={1} width={Math.max(4, w(awal))} height={4} rx={2} ry={2} fill={WARNA.awal} /> : null}
      <Rect x={0} y={7} width={lebar} height={5.5} rx={2.75} ry={2.75} fill={WARNA.garisLembut} />
      {w(akhir) > 0 ? <Rect x={0} y={7} width={Math.max(5.5, w(akhir))} height={5.5} rx={2.75} ry={2.75} fill={WARNA.petrol} /> : null}
    </Svg>
  );
}

/** Chapter bars: one paired bar per Program chapter. */
export { BarPasangan as BarBab };
