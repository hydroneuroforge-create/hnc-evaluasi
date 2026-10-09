// Vector stars ★★★☆ (filled = rank). BEFORE grey, AFTER petrol.
import { Polygon, Svg } from '@react-pdf/renderer';
import type { Level } from '../../core/index.ts';
import { WARNA } from '../theme.ts';
import type { Waktu } from './Titik.tsx';

/** Points of a 5-pointed star centred at (cx, cy). */
export function titikBintang(cx: number, cy: number, rLuar: number, rDalam = rLuar * 0.45): string {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rLuar : rDalam;
    const a = (-90 + i * 36) * (Math.PI / 180);
    p.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return p.join(' ');
}

export function Bintang({ peringkat, waktu, ukuran = 9, jumlah = 4 }: { peringkat: Level | null; waktu: Waktu; ukuran?: number; jumlah?: number }) {
  const jarak = ukuran * 0.25;
  const lebar = jumlah * ukuran + (jumlah - 1) * jarak + 1;
  const isi = waktu === 'sesudah' ? WARNA.lanjutan : WARNA.awal;
  return (
    <Svg width={lebar} height={ukuran + 1} viewBox={`0 0 ${lebar} ${ukuran + 1}`}>
      {Array.from({ length: jumlah }, (_, k) => {
        const i = k + 1;
        const cx = 0.5 + ukuran / 2 + k * (ukuran + jarak);
        const terisi = peringkat !== null && i <= peringkat;
        return (
          <Polygon
            key={i}
            points={titikBintang(cx, ukuran / 2 + 0.7, ukuran / 2)}
            fill={terisi ? isi : WARNA.putih}
            stroke={terisi ? isi : WARNA.awalMuda}
            strokeWidth={0.7}
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
}
