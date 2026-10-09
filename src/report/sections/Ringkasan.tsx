// 2. Ringkasan untuk Orang Tua — exactly one page: identity strip, plain-language paragraph, gauge, 8-domain
// radar (+ coverage footnote), 3 Pencapaian Utama and 3 Fokus Berikutnya.
import { Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { Gauge } from '../charts/Gauge.tsx';
import { Radar } from '../charts/Radar.tsx';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian, Label } from '../components/JudulBagian.tsx';
import { IkonFokus, Medali } from '../components/Medali.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { ANGKA, JARAK, WARNA } from '../theme.ts';

function Identitas({ siap }: Pick<PropsBagian, 'siap'>) {
  const sel = (label: string, isi: ReactNode, flex: number) => (
    <View style={{ flex, paddingHorizontal: 8, borderLeftWidth: 0.6, borderLeftColor: '#C9DEE1' }}>
      <Label warna={WARNA.slate}>{label}</Label>
      <View style={{ marginTop: 2 }}>{isi}</View>
    </View>
  );
  const teks = { fontSize: 8.4, fontWeight: 600, color: WARNA.navy, lineHeight: 1.3, ...ANGKA } as const;
  return (
    <View style={{ flexDirection: 'row', backgroundColor: WARNA.latarTeal, borderRadius: 7, paddingVertical: 9, paddingHorizontal: 4 }}>
      <View style={{ flex: 2.1, paddingHorizontal: 8 }}>
        <Label warna={WARNA.slate}>Nama</Label>
        <Text style={{ ...teks, marginTop: 2 }}>{siap.anak.namaLengkap}</Text>
      </View>
      {sel('Usia', <Text style={teks}>{siap.anak.usia}</Text>, 1.25)}
      {sel('Diagnosa', <TeksKaya isi={siap.anak.diagnosa} style={teks} />, 1.75)}
      {sel('Periode', <Text style={teks}>{tanpaPutus(siap.periode.teks)}</Text>, 2.95)}
    </View>
  );
}

/** Non-breaking spaces inside dates so a date never wraps mid-way (only the dash may break). */
const tanpaPutus = (s: string) => s.replace(/([\p{L}\d]) (?=[\p{L}\d])/gu, '$1\u00A0');

export function Ringkasan(p: PropsBagian & { nomor?: number }) {
  const { siap } = p;
  const ks = siap.skor.keseluruhan;
  const r = siap.ringkasan;
  return (
    <HalamanIsi {...p} bookmark="Ringkasan untuk Orang Tua">
      <View wrap={false}>
        <JudulBagian judul="Ringkasan untuk Orang Tua" inggris="Summary for Parents" nomor={p.nomor} />
        <Identitas siap={siap} />
        <TeksKaya isi={r.paragraf} style={{ fontSize: 9.4, lineHeight: 1.5, color: WARNA.teks, marginTop: JARAK.s3 }} />

        <View style={{ flexDirection: 'row', marginTop: JARAK.s3 }}>
          <View style={{ width: 178, borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, padding: 10, alignItems: 'center', marginRight: 10 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: WARNA.navy, alignSelf: 'flex-start' }}>Skor Perkembangan</Text>
            <Text style={{ fontSize: 6.6, color: WARNA.teksSamar, alignSelf: 'flex-start', marginBottom: 6 }}>Skala 0–100, seluruh aspek</Text>
            <Gauge awal={ks.awalBulat} akhir={ks.akhirBulat} selisih={ks.selisih} labelAwal="Awal" labelAkhir="Lanjutan" ukuran={150} />
            <Text style={{ fontSize: 6.3, color: WARNA.teksSamar, textAlign: 'center', marginTop: 9, lineHeight: 1.35 }}>{r.catatanSkor}</Text>
          </View>
          <View style={{ flex: 1, borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, padding: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: 9, fontWeight: 700, color: WARNA.navy }}>Profil Delapan Aspek</Text>
                <Text style={{ fontSize: 6.6, color: WARNA.teksSamar }}>Skor per aspek, 0–100</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 0, borderTopWidth: 1.2, borderTopColor: WARNA.awal, borderStyle: 'dashed', marginRight: 4 }} />
                  <Text style={{ fontSize: 6.4, color: WARNA.teksLembut }}>{siap.label.sebelum}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <View style={{ width: 12, height: 5, backgroundColor: '#B9D6DB', borderWidth: 1, borderColor: WARNA.petrol, marginRight: 4 }} />
                  <Text style={{ fontSize: 6.4, color: WARNA.teksLembut }}>{siap.label.sesudah}</Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Radar domain={siap.skor.domain} lebar={300} tinggi={196} jariJari={64} />
            </View>
            {siap.catatanKaki.cakupan ? (
              <Text style={{ fontSize: 6.2, color: WARNA.teksSamar, lineHeight: 1.35 }}>{siap.catatanKaki.cakupan}</Text>
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: JARAK.s3 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: WARNA.navy, marginBottom: 6 }}>Pencapaian Utama</Text>
            {r.pencapaian.map((x, i) => (
              <View key={x.id} style={{ flexDirection: 'row', backgroundColor: WARNA.latar, borderRadius: 6, padding: 8, marginBottom: i < r.pencapaian.length - 1 ? 6 : 0 }}>
                <Medali ukuran={18} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <TeksKaya isi={x.judul} style={{ fontSize: 8.6, fontWeight: 700, color: WARNA.petrol, lineHeight: 1.3 }} />
                  <TeksKaya isi={x.ringkas} style={{ fontSize: 7.8, color: WARNA.teksLembut, lineHeight: 1.4, marginTop: 1 }} />
                </View>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: WARNA.navy, marginBottom: 6 }}>Fokus Berikutnya</Text>
            {r.fokus.map((x, i) => (
              <View key={x.id} style={{ flexDirection: 'row', borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 6, padding: 8, marginBottom: i < r.fokus.length - 1 ? 6 : 0 }}>
                <IkonFokus ukuran={18} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontSize: 8.6, fontWeight: 700, color: WARNA.navy, lineHeight: 1.3 }}>{x.judul}</Text>
                  <TeksKaya isi={x.ringkas} style={{ fontSize: 7.8, color: WARNA.teksLembut, lineHeight: 1.4, marginTop: 1 }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </HalamanIsi>
  );
}
