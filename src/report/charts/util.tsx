// Shared chart helpers. Every SVG <Text> goes through SvgTeks so it always sets fontFamily (otherwise
// react-pdf falls back to Helvetica). Orientation helpers read the axis order from the scale (skala.ts).
import { Text as SvgText } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { urutanSumbu, type DefinisiSkala, type Level } from '../../core/index.ts';
import { ANGKA, FONT, WARNA } from '../theme.ts';

export function SvgTeks({ x, y, children, ukuran = 7, tebal = 400, warna = WARNA.teksLembut, anchor = 'start', miring = false }: {
  x: number; y: number; children: ReactNode; ukuran?: number; tebal?: number; warna?: string;
  anchor?: 'start' | 'middle' | 'end'; miring?: boolean;
}) {
  return (
    <SvgText
      x={x}
      y={y}
      textAnchor={anchor}
      fill={warna}
      style={{ fontFamily: FONT, fontSize: ukuran, fontWeight: tebal, fontStyle: miring ? 'italic' : 'normal', ...ANGKA }}
    >
      {children}
    </SvgText>
  );
}

/**
 * Position (0..1) of a value along an axis drawn from the least to the most developed level
 * (left→right or bottom→top). Uses the axis order from the scale definition, so a 'turun' scale flips.
 */
export function posisiSumbu(s: DefinisiSkala, v: Level): number {
  const urut = urutanSumbu(s);
  return urut.indexOf(v) / (urut.length - 1);
}

/** Arc path on a circle (angles in degrees, 0 = up, clockwise). */
export function busur(cx: number, cy: number, r: number, dari: number, ke: number): string {
  const titik = (a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
  };
  const [x0, y0] = titik(dari);
  const [x1, y1] = titik(ke);
  const besar = Math.abs(ke - dari) > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${besar} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export const kutub = (cx: number, cy: number, r: number, sudut: number): [number, number] => {
  const rad = ((sudut - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};
