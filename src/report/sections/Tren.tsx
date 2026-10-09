// 8. Grafik Tren: overall score per evaluation, per-domain change table, and sessions-per-month bars ONLY when
// a session log exists (no chart and no placeholder otherwise).
import { Text, View } from '@react-pdf/renderer';
import { BarPasangan } from '../charts/BarBab.tsx';
import { BarSesi } from '../charts/BarSesi.tsx';
import { GarisTren } from '../charts/GarisTren.tsx';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian } from '../components/JudulBagian.tsx';
import { ANGKA, JARAK, LEBAR_ISI, WARNA } from '../theme.ts';

export function Tren(p: PropsBagian & { nomor?: number }) {
  const { siap } = p;
  const t = siap.tren;
  const sesi = t.sesiPerBulan;
  const lebarGrafik = sesi ? (LEBAR_ISI - 10) / 2 : LEBAR_ISI;
  const kepala = { fontSize: 6.4, fontWeight: 700, color: WARNA.slate, letterSpacing: 0.4, lineHeight: 1.25 } as const;
  const angka = { fontSize: 8, textAlign: 'center', ...ANGKA } as const;
  return (
    <HalamanIsi {...p} bookmark="Grafik Tren">
      <JudulBagian judul="Grafik Tren" inggris="Progress Trend" nomor={p.nomor} />
      <View wrap={false} style={{ flexDirection: 'row', marginBottom: JARAK.s3 }}>
        <View style={{ width: lebarGrafik, borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, padding: 10 }}>
          <Text style={{ fontSize: 9.4, fontWeight: 700, color: WARNA.navy }}>Skor Perkembangan per Evaluasi</Text>
          <Text style={{ fontSize: 6.8, color: WARNA.teksSamar, marginBottom: 4 }}>Skala 0–100; makin tinggi makin berkembang</Text>
          <GarisTren titik={t.titik} lebar={lebarGrafik - 22} tinggi={sesi ? 150 : 170} />
        </View>
        {sesi ? (
          <View style={{ width: lebarGrafik, marginLeft: 10, borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, padding: 10 }}>
            <Text style={{ fontSize: 9.4, fontWeight: 700, color: WARNA.navy }}>Kehadiran Sesi per Bulan</Text>
            <Text style={{ fontSize: 6.8, color: WARNA.teksSamar, marginBottom: 4 }}>Jumlah sesi hidroterapi yang dijalani</Text>
            <BarSesi data={sesi} lebar={lebarGrafik - 22} tinggi={150} />
          </View>
        ) : null}
      </View>

      <View wrap={false} style={{ borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', backgroundColor: WARNA.latarTeal, paddingVertical: 6, paddingHorizontal: 10 }}>
          <Text style={{ ...kepala, flex: 1 }}>ASPEK</Text>
          <Text style={{ ...kepala, width: 68, textAlign: 'center' }}>{siap.label.sebelum.toUpperCase()}</Text>
          <Text style={{ ...kepala, width: 80, textAlign: 'center' }}>{siap.label.sesudah.toUpperCase()}</Text>
          <Text style={{ ...kepala, width: 46, textAlign: 'center' }}>PERUBAHAN</Text>
          <Text style={{ ...kepala, width: 150, paddingLeft: 12 }}>GRAFIK</Text>
        </View>
        {t.domain.map((d, i) => (
          <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: i % 2 ? WARNA.latar : WARNA.putih }}>
            <Text style={{ flex: 1, fontSize: 8.4, color: WARNA.navy, fontWeight: 600 }}>{d.nama}{d.bertanda ? '*' : ''}</Text>
            <Text style={{ ...angka, width: 68, color: WARNA.teksSamar }}>{d.awalBulat ?? '–'}</Text>
            <Text style={{ ...angka, width: 80, color: WARNA.petrol, fontWeight: 700 }}>{d.akhirBulat ?? '–'}</Text>
            <Text style={{ ...angka, width: 46, color: WARNA.aksen, fontWeight: 700 }}>
              {d.selisih === null ? '–' : `${d.selisih > 0 ? '+' : ''}${d.selisih}`}
            </Text>
            <View style={{ width: 150, paddingLeft: 12 }}><BarPasangan awal={d.awalBulat} akhir={d.akhirBulat} lebar={138} /></View>
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, borderTopWidth: 0.8, borderTopColor: WARNA.garis }}>
          <Text style={{ flex: 1, fontSize: 8.8, color: WARNA.navy, fontWeight: 800 }}>Skor Perkembangan (keseluruhan)</Text>
          <Text style={{ ...angka, width: 68, color: WARNA.teksSamar, fontWeight: 700 }}>{siap.skor.keseluruhan.awalBulat ?? '–'}</Text>
          <Text style={{ ...angka, width: 80, color: WARNA.petrol, fontWeight: 800 }}>{siap.skor.keseluruhan.akhirBulat ?? '–'}</Text>
          <Text style={{ ...angka, width: 46, color: WARNA.aksen, fontWeight: 800 }}>
            {siap.skor.keseluruhan.selisih === null ? '–' : `${siap.skor.keseluruhan.selisih > 0 ? '+' : ''}${siap.skor.keseluruhan.selisih}`}
          </Text>
          <View style={{ width: 150, paddingLeft: 12 }}>
            <BarPasangan awal={siap.skor.keseluruhan.awalBulat} akhir={siap.skor.keseluruhan.akhirBulat} lebar={138} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
        <View style={{ width: 14, height: 4, borderRadius: 2, backgroundColor: WARNA.awal, marginRight: 4 }} />
        <Text style={{ fontSize: 6.6, color: WARNA.teksLembut, marginRight: 12 }}>{siap.label.sebelum}</Text>
        <View style={{ width: 14, height: 5.5, borderRadius: 2.75, backgroundColor: WARNA.petrol, marginRight: 4 }} />
        <Text style={{ fontSize: 6.6, color: WARNA.teksLembut }}>{siap.label.sesudah}</Text>
      </View>
      {siap.catatanKaki.cakupan ? (
        <Text style={{ fontSize: 6.8, color: WARNA.teksSamar, marginTop: 6, lineHeight: 1.4 }}>{siap.catatanKaki.cakupan}</Text>
      ) : null}
      <Text style={{ fontSize: 6.8, color: WARNA.teksSamar, marginTop: 3, lineHeight: 1.4 }}>{siap.ringkasan.catatanSkor}</Text>
    </HalamanIsi>
  );
}
