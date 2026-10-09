// Reflex dumbbell chart: one row per reflex, x-axis Nilai in axis order (least→most developed, left→right) with
// zone bands and zone labels from skala.ts. BEFORE hollow grey → AFTER filled petrol with an arrow; unchanged =
// one ringed dot.
import { Circle, Line, Path, Rect, Svg, Text, View } from '@react-pdf/renderer';
import { urutanSumbu, zonaLevel, type DefinisiSkala, type NilaiTampil, type Run, type StatusTampil } from '../../core/index.ts';
import { ChipStatus } from '../components/ChipStatus.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { ANGKA, WARNA, ZONA } from '../theme.ts';
import { posisiSumbu } from './util.tsx';

export interface BarisDumbbell { id: string; no: number; nama: Run[]; sebelum: NilaiTampil; sesudah: NilaiTampil; status: StatusTampil }

const LEBAR_LABEL = 170;
const LEBAR_JALUR = 212;
const LEBAR_NILAI = 44;
const TINGGI = 19;

function Jalur({ skala, sebelum, sesudah, terakhir }: { skala: DefinisiSkala; sebelum: NilaiTampil; sesudah: NilaiTampil; terakhir: boolean }) {
  const urut = urutanSumbu(skala);
  const seg = LEBAR_JALUR / 4;
  const x = (n: NilaiTampil) => (n.nilai === null ? null : seg * (posisiSumbu(skala, n.nilai) * 3 + 0.5));
  const xb = x(sebelum);
  const xa = x(sesudah);
  const y = TINGGI / 2;
  const sama = xb !== null && xa !== null && Math.abs(xa - xb) < 1;
  const arah = xb !== null && xa !== null ? Math.sign(xa - xb) : 0;
  return (
    <Svg width={LEBAR_JALUR} height={TINGGI} viewBox={`0 0 ${LEBAR_JALUR} ${TINGGI}`}>
      {urut.map((v, i) => (
        <Rect key={v} x={i * seg} y={0} width={seg} height={TINGGI} fill={ZONA[zonaLevel(skala, v)].muda} fillOpacity={0.55} />
      ))}
      {urut.slice(1).map((_, i) => (
        <Line key={i} x1={(i + 1) * seg} y1={0} x2={(i + 1) * seg} y2={TINGGI} stroke={WARNA.putih} strokeWidth={0.8} />
      ))}
      {!terakhir ? <Line x1={0} y1={TINGGI - 0.3} x2={LEBAR_JALUR} y2={TINGGI - 0.3} stroke={WARNA.putih} strokeWidth={0.6} /> : null}
      {xb !== null && xa !== null && !sama ? (
        <>
          <Line x1={xb + arah * 5} y1={y} x2={xa - arah * 7.5} y2={y} stroke={WARNA.petrol} strokeWidth={1.6} strokeLinecap="round" />
          <Path
            d={`M ${xa - arah * 10} ${y - 3} L ${xa - arah * 6.5} ${y} L ${xa - arah * 10} ${y + 3}`}
            stroke={WARNA.petrol} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
        </>
      ) : null}
      {xb !== null && !sama ? <Circle cx={xb} cy={y} r={4.2} fill={WARNA.putih} stroke={WARNA.awal} strokeWidth={1.4} /> : null}
      {xa !== null ? (
        sama ? (
          <>
            <Circle cx={xa} cy={y} r={6.4} fill={WARNA.putih} stroke={WARNA.awal} strokeWidth={1.2} />
            <Circle cx={xa} cy={y} r={4} fill={WARNA.petrol} />
          </>
        ) : (
          <Circle cx={xa} cy={y} r={4.8} fill={WARNA.petrol} />
        )
      ) : null}
    </Svg>
  );
}

export function Dumbbell({ skala, baris, judulKolom = 'Refleks', catatanSumbu }: {
  skala: DefinisiSkala; baris: BarisDumbbell[]; judulKolom?: string; catatanSumbu: string;
}) {
  const urut = urutanSumbu(skala);
  const seg = LEBAR_JALUR / 4;
  const kepala = { fontSize: 6.2, color: WARNA.teksSamar, fontWeight: 600, letterSpacing: 0.6 } as const;
  return (
    <View wrap={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 4 }}>
        <Text style={{ ...kepala, width: LEBAR_LABEL }}>{judulKolom.toUpperCase()}</Text>
        <View style={{ width: LEBAR_JALUR, flexDirection: 'row' }}>
          {urut.map((v) => {
            const z = ZONA[zonaLevel(skala, v)];
            return (
              <View key={v} style={{ width: seg, alignItems: 'center' }}>
                <Text style={{ fontSize: 8, fontWeight: 800, color: z.teks, lineHeight: 1.1, ...ANGKA }}>{String(v)}</Text>
                <Text style={{ fontSize: 5.8, color: z.teks, textAlign: 'center', lineHeight: 1.2 }}>{skala.level[v].label}</Text>
              </View>
            );
          })}
        </View>
        <Text style={{ ...kepala, width: LEBAR_NILAI, textAlign: 'center' }}>NILAI</Text>
        <Text style={{ ...kepala, flex: 1, paddingLeft: 6 }}>STATUS</Text>
      </View>
      {baris.map((b, i) => (
        <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: i === 0 ? 0.6 : 0, borderTopColor: WARNA.garis }}>
          <View style={{ width: LEBAR_LABEL, flexDirection: 'row', paddingRight: 6, alignItems: 'center' }}>
            <Text style={{ fontSize: 6.6, color: WARNA.teksSamar, width: 12, lineHeight: 1.25, ...ANGKA }}>{b.no}</Text>
            <TeksKaya isi={b.nama} style={{ fontSize: 7.4, color: WARNA.navy, flex: 1, lineHeight: 1.25 }} />
          </View>
          <Jalur skala={skala} sebelum={b.sebelum} sesudah={b.sesudah} terakhir={i === baris.length - 1} />
          <Text style={{ width: LEBAR_NILAI, textAlign: 'center', fontSize: 7.6, color: WARNA.teksLembut, ...ANGKA }}>
            <Text style={{ color: WARNA.awal }}>{b.sebelum.nilai ?? '–'}</Text>
            {' → '}
            <Text style={{ color: WARNA.petrol, fontWeight: 700 }}>{b.sesudah.nilai ?? '–'}</Text>
          </Text>
          <View style={{ flex: 1, paddingLeft: 6 }}><ChipStatus status={b.status} /></View>
        </View>
      ))}
      <View style={{ flexDirection: 'row', marginTop: 5 }}>
        <View style={{ width: LEBAR_LABEL }} />
        <View style={{ width: LEBAR_JALUR, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 6.6, color: WARNA.petrol, fontWeight: 600 }}>{catatanSumbu}</Text>
        </View>
      </View>
    </View>
  );
}
