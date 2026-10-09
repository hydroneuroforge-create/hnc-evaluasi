// Circular gauge of the overall Skor Perkembangan (0–100): AFTER as a filled petrol arc with the value large in
// the centre, BEFORE as a grey arc + marker, and the '+n poin' chip below.
import { Circle, Path, Svg, Text, View } from '@react-pdf/renderer';
import { ANGKA, WARNA } from '../theme.ts';
import { busur, kutub, SvgTeks } from './util.tsx';

const AWAL = -135;
const SAPU = 270;

export function Gauge({ awal, akhir, selisih, labelAwal, labelAkhir, ukuran = 150 }: {
  awal: number | null; akhir: number | null; selisih: number | null; labelAwal: string; labelAkhir: string; ukuran?: number;
}) {
  const c = 75;
  const r = 60;
  const sudut = (v: number) => AWAL + (Math.max(0, Math.min(100, v)) / 100) * SAPU;
  const [bx, by] = awal !== null ? kutub(c, c, r, sudut(awal)) : [0, 0];
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={ukuran} height={ukuran * 0.9} viewBox="0 0 150 135">
        <Path d={busur(c, c, r, AWAL, AWAL + SAPU)} stroke={WARNA.garisLembut} strokeWidth={11} fill="none" strokeLinecap="round" />
        {awal !== null && awal > 0 ? (
          <Path d={busur(c, c, r, AWAL, sudut(awal))} stroke={WARNA.awalMuda} strokeWidth={11} fill="none" strokeLinecap="round" />
        ) : null}
        {akhir !== null && akhir > 0 ? (
          <Path d={busur(c, c, r, AWAL, sudut(akhir))} stroke={WARNA.petrol} strokeWidth={11} fill="none" strokeLinecap="round" />
        ) : null}
        {awal !== null ? (
          <>
            <Circle cx={bx} cy={by} r={6.4} fill={WARNA.putih} stroke={WARNA.awal} strokeWidth={1.6} />
            <Circle cx={bx} cy={by} r={2} fill={WARNA.awal} />
          </>
        ) : null}
        {[0, 50, 100].map((v) => {
          const [x, y] = kutub(c, c, r - 15, sudut(v));
          return <SvgTeks key={v} x={x} y={y + 2.4} ukuran={6} warna={WARNA.teksSamar} anchor="middle">{String(v)}</SvgTeks>;
        })}
        <SvgTeks x={c} y={c + 10} ukuran={34} tebal={800} warna={WARNA.navy} anchor="middle">{akhir === null ? '–' : String(akhir)}</SvgTeks>
        <SvgTeks x={c} y={c + 23} ukuran={6.8} warna={WARNA.teksSamar} anchor="middle">dari 100</SvgTeks>
        <SvgTeks x={c} y={c + 52} ukuran={6.8} tebal={600} warna={WARNA.teksLembut} anchor="middle">
          {`${labelAwal} ${awal ?? '–'}  →  ${labelAkhir} ${akhir ?? '–'}`}
        </SvgTeks>
      </Svg>
      {selisih !== null ? (
        <View style={{ marginTop: -2, backgroundColor: WARNA.petrol, borderRadius: 9, paddingVertical: 2.6, paddingHorizontal: 9 }}>
          <Text style={{ fontSize: 8.4, fontWeight: 700, color: WARNA.putih, lineHeight: 1.2, ...ANGKA }}>
            {`${selisih > 0 ? '+' : ''}${selisih} poin`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
