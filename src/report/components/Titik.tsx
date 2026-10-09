// Level dots ●●○○ (rank-based: filled dots = rank, left→right = least→most developed).
// BEFORE = grey, AFTER = petrol; not observed = dashed empty dots.
import { Circle, Svg } from '@react-pdf/renderer';
import type { Level } from '../../core/index.ts';
import { WARNA } from '../theme.ts';

export type Waktu = 'sebelum' | 'sesudah';

export function Titik({ peringkat, waktu, ukuran = 7, jarak = 3 }: { peringkat: Level | null; waktu: Waktu; ukuran?: number; jarak?: number }) {
  const r = ukuran / 2;
  const lebar = 4 * ukuran + 3 * jarak + 1;
  const isi = waktu === 'sesudah' ? WARNA.lanjutan : WARNA.awal;
  return (
    <Svg width={lebar} height={ukuran + 1} viewBox={`0 0 ${lebar} ${ukuran + 1}`}>
      {[1, 2, 3, 4].map((i) => {
        const cx = 0.5 + r + (i - 1) * (ukuran + jarak);
        const terisi = peringkat !== null && i <= peringkat;
        return peringkat === null ? (
          <Circle key={i} cx={cx} cy={r + 0.5} r={r - 0.4} fill={WARNA.putih} stroke={WARNA.awal} strokeWidth={0.8} strokeDasharray="1.4 1.2" />
        ) : (
          <Circle key={i} cx={cx} cy={r + 0.5} r={r - 0.4} fill={terisi ? isi : WARNA.putih} stroke={terisi ? isi : WARNA.awalMuda} strokeWidth={0.8} />
        );
      })}
    </Svg>
  );
}
