// 9. Kesimpulan, Rekomendasi & Target 24 Sesi Berikutnya: P1, P2 + highlights, P3 + recommendations, the target
// table grouped by area/chapter and the next-evaluation box (no date).
import { Path, Svg, Text, View } from '@react-pdf/renderer';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian, SubJudul } from '../components/JudulBagian.tsx';
import { Medali } from '../components/Medali.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { ANGKA, JARAK, WARNA } from '../theme.ts';

const paragraf = { fontSize: 9.2, lineHeight: 1.5, color: WARNA.teks } as const;

export function Kesimpulan(p: PropsBagian & { nomor?: number }) {
  const { siap } = p;
  const k = siap.kesimpulan;
  const t = siap.target;
  const kepala = { fontSize: 6.4, fontWeight: 700, color: WARNA.slate, letterSpacing: 0.4 } as const;
  const barisTarget = (b: (typeof t.kelompok)[number]['baris'][number], i: number) => (
    <View key={b.id} wrap={false} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2.6, paddingHorizontal: 8, backgroundColor: i % 2 ? WARNA.latar : WARNA.putih, borderBottomWidth: 0.5, borderBottomColor: WARNA.garisLembut }}>
      <TeksKaya isi={b.item} style={{ flex: 1, fontSize: 7.8, color: WARNA.navy, lineHeight: 1.3, paddingRight: 6 }} />
      <Text style={{ width: 140, fontSize: 7.4, color: WARNA.teksLembut, lineHeight: 1.3, ...ANGKA }}>{b.saatIni}</Text>
      <View style={{ width: 150, flexDirection: 'row', alignItems: 'center' }}>
        <Svg width={9} height={8} viewBox="0 0 9 8" style={{ marginRight: 4 }}>
          <Path d="M 1 4 L 7 4 M 4.5 1.4 L 7.4 4 L 4.5 6.6" stroke={WARNA.aksen} strokeWidth={1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <TeksKaya isi={b.target} style={{ flex: 1, fontSize: 7.6, color: WARNA.petrol, fontWeight: 600, lineHeight: 1.3 }} />
      </View>
    </View>
  );
  const kotakEvaluasi = (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: WARNA.petrol, borderRadius: 8, paddingVertical: 11, paddingHorizontal: 14, marginTop: JARAK.s2 }}>
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Path d="M3 6 H19 V19 H3 Z" stroke={WARNA.putih} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
        <Path d="M3 9.5 H19 M7 3.5 V7.5 M15 3.5 V7.5" stroke={WARNA.putih} strokeWidth={1.3} strokeLinecap="round" />
        <Path d="M7.5 14 L10 16.4 L14.8 11.8" stroke="#BFE0E4" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <View style={{ marginLeft: 11, flex: 1 }}>
        <Text style={{ fontSize: 6.8, fontWeight: 600, color: '#BFE0E4', letterSpacing: 1.3 }}>EVALUASI BERIKUTNYA</Text>
        <TeksKaya isi={t.evaluasiBerikutnya} style={{ fontSize: 10, fontWeight: 600, color: WARNA.putih, marginTop: 2, lineHeight: 1.35 }} />
      </View>
    </View>
  );
  return (
    <HalamanIsi {...p} bookmark="Kesimpulan, Rekomendasi & Target">
      <JudulBagian judul="Kesimpulan, Rekomendasi & Target" inggris="Conclusion, Recommendations & Targets" nomor={p.nomor} />
      <TeksKaya isi={k.p1} style={{ ...paragraf, marginBottom: 8 }} />
      <TeksKaya isi={k.p2} style={{ ...paragraf, marginBottom: 6 }} />
      <View style={{ marginBottom: 10 }}>
        {k.sorotan.map((s, i) => (
          <View key={s.id} wrap={false} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: WARNA.latar, borderRadius: 6, paddingVertical: 7, paddingHorizontal: 9, marginBottom: 5 }}>
            <Medali ukuran={17} nomor={i + 1} />
            <TeksKaya isi={s} style={{ flex: 1, marginLeft: 9, fontSize: 8.8, lineHeight: 1.45, color: WARNA.teks }} />
          </View>
        ))}
      </View>
      <TeksKaya isi={k.p3} style={{ ...paragraf, marginBottom: 6 }} />
      <View style={{ marginBottom: JARAK.s3 }}>
        {k.rekomendasi.map((r, i) => (
          <View key={r.id} wrap={false} style={{ flexDirection: 'row', borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 6, paddingVertical: 7, paddingHorizontal: 9, marginBottom: 5 }}>
            <View style={{ width: 17, height: 17, borderRadius: 8.5, backgroundColor: WARNA.latarTeal, borderWidth: 0.8, borderColor: WARNA.aqua, alignItems: 'center', justifyContent: 'center', marginRight: 9 }}>
              <Text style={{ fontSize: 7.6, fontWeight: 800, color: WARNA.petrol, lineHeight: 1, ...ANGKA }}>{i + 1}</Text>
            </View>
            <TeksKaya isi={r} style={{ flex: 1, fontSize: 8.8, lineHeight: 1.45, color: WARNA.teks }} />
          </View>
        ))}
      </View>

      <View style={{ marginTop: JARAK.s2 }}>
        <SubJudul judul={t.judul} inggris="Targets for the next 24 sessions" ruang={160} />
      </View>
      {t.kelompok.map((g, gi) => {
        const terakhir = gi === t.kelompok.length - 1;
        return (
        <View key={g.id} wrap={g.baris.length > 6} style={{ marginBottom: 6 }}>
          <View wrap={false} minPresenceAhead={40} style={{ flexDirection: 'row', backgroundColor: WARNA.latarTeal, borderTopLeftRadius: 5, borderTopRightRadius: 5, paddingVertical: 4, paddingHorizontal: 8 }}>
            <Text style={{ ...kepala, flex: 1, color: WARNA.petrol }}>{g.judul.toUpperCase()}</Text>
            <Text style={{ ...kepala, width: 140 }}>SAAT INI</Text>
            <Text style={{ ...kepala, width: 150 }}>TARGET</Text>
          </View>
          {(terakhir ? g.baris.slice(0, -1) : g.baris).map((b, i) => barisTarget(b, i))}
          {terakhir && g.baris.length ? (
            // The last row stays with the next-evaluation box (no lone box on a new page).
            <View wrap={false}>
              {barisTarget(g.baris[g.baris.length - 1]!, g.baris.length - 1)}
              {kotakEvaluasi}
            </View>
          ) : null}
        </View>
        );
      })}
      {t.kelompok.length ? null : kotakEvaluasi}
    </HalamanIsi>
  );
}
