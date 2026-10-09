// 6. Sistem Saraf Pusat: dumbbell chart (10 reflexes), legend, Summary (2 paragraphs), intro sentence and the
// Gambaran Perkembangan cards.
import { Text, View } from '@react-pdf/renderer';
import { Dumbbell } from '../charts/Dumbbell.tsx';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian, SubJudul } from '../components/JudulBagian.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { JARAK, WARNA, ZONA } from '../theme.ts';

export function SarafPusat(p: PropsBagian & { nomor?: number }) {
  const { siap } = p;
  const rf = siap.refleks;
  const s = siap.skala.skala.refleks;
  const catatanSumbu = s.arah === 'naik' ? `Nilai 1 → 4: makin besar makin berkembang` : 'Ke kanan: makin berkembang';
  return (
    <HalamanIsi {...p} bookmark="Sistem Saraf Pusat">
      <JudulBagian judul="Sistem Saraf Pusat" inggris="Central Nervous System · Primitive Reflexes" nomor={p.nomor} />
      <View wrap={false} style={{ borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, padding: 11 }}>
        <Text style={{ fontSize: 9.4, fontWeight: 700, color: WARNA.navy, marginBottom: 7 }}>Integrasi Refleks Primitif</Text>
        <Dumbbell skala={s} baris={rf.baris} catatanSumbu={catatanSumbu} />
      </View>

      <View wrap={false} style={{ marginTop: JARAK.s3 }}>
        <SubJudul judul="Keterangan Nilai" inggris="Reflex control legend" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {rf.legenda.baris.map((l, i) => (
            <View key={l.nilai} style={{ width: '50%', paddingRight: i % 2 === 0 ? 5 : 0, paddingLeft: i % 2 === 1 ? 5 : 0, marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', backgroundColor: ZONA[l.zona].muda, borderRadius: 6, padding: 7, minHeight: 58 }}>
                <View style={{ width: 3, borderRadius: 1.5, backgroundColor: ZONA[l.zona].kuat, marginRight: 6 }} />
                <TeksKaya isi={l.paragraf} style={{ flex: 1, fontSize: 7.3, color: WARNA.teks, lineHeight: 1.4 }} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginTop: JARAK.s2 }}>
        <SubJudul judul="Ringkasan" inggris="Summary" />
        {rf.ringkasan.map((x) => (
          <TeksKaya key={x.id} isi={x} style={{ fontSize: 9, lineHeight: 1.5, color: WARNA.teks, marginBottom: 6 }} />
        ))}
      </View>

      {rf.gambaran.map((g, i) => {
        const baris = rf.baris.find((b) => b.id === g.id);
        const kartu = (
          <View key={g.id} wrap={false} style={{ borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, marginBottom: 9, flexDirection: 'row' }}>
            <View style={{ width: 4, backgroundColor: baris?.sesudah.zona ? ZONA[baris.sesudah.zona].kuat : WARNA.aqua, borderTopLeftRadius: 7, borderBottomLeftRadius: 7 }} />
            <View style={{ flex: 1, padding: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ flex: 1, fontSize: 10, fontWeight: 700, color: WARNA.navy }}>{g.judul}</Text>
                {baris ? (
                  <Text style={{ fontSize: 7.6, color: WARNA.teksLembut, fontFeatureSettings: ['tnum'] }}>
                    Nilai <Text style={{ color: WARNA.awal, fontWeight: 600 }}>{baris.sebelum.nilai ?? '–'}</Text>
                    {' → '}
                    <Text style={{ color: WARNA.petrol, fontWeight: 700 }}>{baris.sesudah.nilai ?? '–'}</Text>
                    {baris.sesudah.label ? `  ·  ${baris.sesudah.label}` : ''}
                  </Text>
                ) : null}
              </View>
              <TeksKaya isi={g.paragraf} style={{ fontSize: 8.6, lineHeight: 1.5, color: WARNA.teks }} />
            </View>
          </View>
        );
        if (i > 0) return kartu;
        // The sub-heading and intro sentence stay together with the first card (no orphan heading).
        return (
          <View key={g.id} wrap={false} style={{ marginTop: JARAK.s2 }}>
            <SubJudul judul="Gambaran Perkembangan" inggris="Progress per reflex" />
            <TeksKaya isi={rf.pengantar} style={{ fontSize: 9, lineHeight: 1.5, color: WARNA.teks, marginBottom: 8 }} />
            {kartu}
          </View>
        );
      })}
    </HalamanIsi>
  );
}
