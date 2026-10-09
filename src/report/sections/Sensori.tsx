// 5. Sistem Sensorik: per system a card with stars, the 4-step meter (Bintang 1→4), categories and
// 'Apa artinya untuk Ananda?'; then the star legend. Stars show the value itself ('Bintang n' = n stars).
import { Text, View } from '@react-pdf/renderer';
import type { BarisSensori, LaporanSiap } from '../../core/index.ts';
import { Panah } from '../charts/DotsLevel.tsx';
import { MeterSensori } from '../charts/MeterSensori.tsx';
import { Bintang } from '../components/Bintang.tsx';
import { ChipStatus } from '../components/ChipStatus.tsx';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian, Label, SubJudul } from '../components/JudulBagian.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { ANGKA, JARAK, WARNA, ZONA } from '../theme.ts';

const kapital = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '–');

function KartuSensori({ b, siap }: { b: BarisSensori; siap: LaporanSiap }) {
  const s = siap.skala.skala.sensori;
  return (
    <View wrap={false} style={{ borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, padding: 11, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 19, height: 19, borderRadius: 9.5, backgroundColor: WARNA.petrol, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
          <Text style={{ fontSize: 8, fontWeight: 700, color: WARNA.putih, lineHeight: 1, ...ANGKA }}>{b.no}</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 10.5, fontWeight: 700, color: WARNA.navy }}>{b.nama}</Text>
        <ChipStatus status={b.status} />
      </View>
      <View style={{ flexDirection: 'row', marginTop: 9, alignItems: 'center' }}>
        <View style={{ width: 236 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View>
              <Label>{siap.label.sebelum}</Label>
              <View style={{ marginTop: 3 }}><Bintang peringkat={b.sebelum.nilai} waktu="sebelum" ukuran={11} /></View>
              <Text style={{ fontSize: 7.4, color: WARNA.teksLembut, marginTop: 2, ...ANGKA }}>
                {b.sebelum.nilai === null ? 'Belum teramati' : `Bintang ${b.sebelum.nilai} · ${kapital(b.kategoriSebelum)}`}
              </Text>
            </View>
            <View style={{ marginHorizontal: 9, marginTop: 6 }}><Panah warna={WARNA.petrol} lebar={16} /></View>
            <View>
              <Label warna={WARNA.petrol}>{siap.label.sesudah}</Label>
              <View style={{ marginTop: 3 }}><Bintang peringkat={b.sesudah.nilai} waktu="sesudah" ukuran={11} /></View>
              <Text style={{ fontSize: 7.4, fontWeight: 700, color: WARNA.petrol, marginTop: 2, ...ANGKA }}>
                {b.sesudah.nilai === null ? 'Belum teramati' : `Bintang ${b.sesudah.nilai} · ${kapital(b.kategoriSesudah)}`}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <MeterSensori skala={s} sebelum={b.sebelum} sesudah={b.sesudah} lebar={240} />
        </View>
      </View>
      {b.apaArtinya ? (
        <View style={{ marginTop: 9, backgroundColor: WARNA.latarTeal, borderRadius: 6, paddingVertical: 7, paddingHorizontal: 9 }}>
          <Text style={{ fontSize: 7.6, fontWeight: 700, color: WARNA.petrol, marginBottom: 1.5 }}>{siap.sensori.judulApaArtinya}</Text>
          <TeksKaya isi={b.apaArtinya} style={{ fontSize: 8.4, color: WARNA.teks, lineHeight: 1.45 }} />
        </View>
      ) : null}
    </View>
  );
}

export function Sensori(p: PropsBagian & { nomor?: number }) {
  const { siap } = p;
  return (
    <HalamanIsi {...p} bookmark="Sistem Sensorik">
      <JudulBagian judul="Sistem Sensorik" inggris="Sensory Systems" nomor={p.nomor} />
      {siap.sensori.baris.map((b) => <KartuSensori key={b.id} b={b} siap={siap} />)}
      <View wrap={false} style={{ marginTop: JARAK.s1 }}>
        <SubJudul judul="Keterangan Nilai Bintang" inggris="Star rating legend" />
        <View style={{ borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, padding: 10 }}>
          {siap.sensori.legenda.baris.map((l, i) => (
            <View key={l.nilai} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderTopWidth: i ? 0.6 : 0, borderTopColor: WARNA.garisLembut }}>
              <View style={{ width: 62 }}><Bintang peringkat={l.nilai} waktu="sesudah" ukuran={9} /></View>
              <View style={{ width: 5, alignSelf: 'stretch', borderRadius: 2.5, backgroundColor: ZONA[l.zona].kuat, marginRight: 7 }} />
              <TeksKaya isi={l.paragraf} style={{ flex: 1, fontSize: 8.2, color: WARNA.teks, lineHeight: 1.4 }} />
            </View>
          ))}
        </View>
      </View>
    </HalamanIsi>
  );
}
