// 3. Cara Membaca Laporan — one page: the single rule banner, the four scales with their legends (from
// skala.ts via LaporanSiap), the excluded states, status chips, colours/zones and the score paragraph.
import { Path, Svg, Text, View } from '@react-pdf/renderer';
import type { LaporanSiap } from '../../core/index.ts';
import { Bintang } from '../components/Bintang.tsx';
import { ChipStatus } from '../components/ChipStatus.tsx';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian } from '../components/JudulBagian.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { Titik } from '../components/Titik.tsx';
import { ANGKA, JARAK, WARNA, ZONA } from '../theme.ts';

type SkalaCm = LaporanSiap['caraMembaca']['skala'][number];

function Contoh({ s }: { s: SkalaCm }) {
  if (s.id === 'kegiatan') return <Titik peringkat={3} waktu="sesudah" ukuran={7} />;
  if (s.id === 'sensori') return <Bintang peringkat={3} waktu="sesudah" ukuran={8.5} />;
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4].map((v) => (
        <View key={v} style={{ width: 13, height: 13, borderRadius: 6.5, marginRight: 2.5, backgroundColor: v === 3 ? WARNA.petrol : WARNA.latar, borderWidth: 0.6, borderColor: v === 3 ? WARNA.petrol : WARNA.garis, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 6.6, fontWeight: 700, color: v === 3 ? WARNA.putih : WARNA.teksSamar, lineHeight: 1, ...ANGKA }}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

function KartuSkala({ s }: { s: SkalaCm }) {
  return (
    <View wrap={false} style={{ flex: 1, borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, padding: 9 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <Text style={{ fontSize: 9.2, fontWeight: 700, color: WARNA.navy }}>{s.judul}</Text>
        <Contoh s={s} />
      </View>
      <Text style={{ fontSize: 6.9, color: WARNA.teksLembut, lineHeight: 1.35, marginBottom: 5 }}>{s.tampilan}</Text>
      {s.legenda.baris.map((b) => (
        <View key={b.nilai} style={{ flexDirection: 'row', marginTop: 2.5 }}>
          <View style={{ width: 4, borderRadius: 2, backgroundColor: ZONA[b.zona].kuat, marginRight: 5 }} />
          <TeksKaya isi={b.paragraf} style={{ flex: 1, fontSize: 6.8, color: WARNA.teks, lineHeight: 1.38 }} />
        </View>
      ))}
    </View>
  );
}

export function CaraMembaca(p: PropsBagian & { nomor?: number }) {
  const cm = p.siap.caraMembaca;
  const [a, b, c, d] = cm.skala;
  return (
    <HalamanIsi {...p} bookmark="Cara Membaca Laporan">
      <View wrap={false}>
        <JudulBagian judul="Cara Membaca Laporan" inggris="How to Read This Report" nomor={p.nomor} />
        <View style={{ backgroundColor: WARNA.petrol, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Svg width={34} height={30} viewBox="0 0 34 30">
            {[1, 2, 3, 4].map((v) => (
              <Path key={v} d={`M ${2 + (v - 1) * 8} 28 L ${2 + (v - 1) * 8} ${28 - v * 6} L ${7.5 + (v - 1) * 8} ${28 - v * 6} L ${7.5 + (v - 1) * 8} 28 Z`} fill={WARNA.putih} fillOpacity={0.35 + v * 0.16} />
            ))}
          </Svg>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 6.8, fontWeight: 600, color: '#BFE0E4', letterSpacing: 1.4 }}>SATU ATURAN UNTUK SEMUA SKALA</Text>
            <Text style={{ fontSize: 14, fontWeight: 800, color: WARNA.putih, marginTop: 2 }}>{cm.aturan}</Text>
          </View>
        </View>
        <TeksKaya isi={cm.penjelasan} style={{ fontSize: 8.8, color: WARNA.teks, marginTop: JARAK.s2, lineHeight: 1.45 }} />

        <View style={{ flexDirection: 'row', marginTop: JARAK.s3 }}>
          {a ? <KartuSkala s={a} /> : null}
          <View style={{ width: 8 }} />
          {b ? <KartuSkala s={b} /> : null}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {c ? <KartuSkala s={c} /> : null}
          <View style={{ width: 8 }} />
          {d ? <KartuSkala s={d} /> : null}
        </View>

        <View style={{ flexDirection: 'row', marginTop: JARAK.s3 }}>
          <View style={{ flex: 1.15, marginRight: 10 }}>
            <Text style={{ fontSize: 9.2, fontWeight: 700, color: WARNA.navy, marginBottom: 4 }}>Label status</Text>
            {cm.status.map((s) => (
              <View key={s.kode} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                <View style={{ width: 82 }}><ChipStatus status={{ kode: s.kode, label: s.label }} /></View>
                <Text style={{ flex: 1, fontSize: 6.9, color: WARNA.teksLembut, lineHeight: 1.3 }}>{s.keterangan}</Text>
              </View>
            ))}
            <TeksKaya isi={cm.dikecualikan} style={{ fontSize: 6.9, color: WARNA.teksLembut, lineHeight: 1.38, marginTop: 3 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9.2, fontWeight: 700, color: WARNA.navy, marginBottom: 4 }}>Warna</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
              <View style={{ width: 9, height: 9, borderRadius: 4.5, borderWidth: 1.3, borderColor: WARNA.awal, marginRight: 4 }} />
              <Text style={{ fontSize: 7, color: WARNA.teks, marginRight: 12 }}>{p.siap.label.sebelum}</Text>
              <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: WARNA.petrol, marginRight: 4 }} />
              <Text style={{ fontSize: 7, color: WARNA.teks }}>{p.siap.label.sesudah}</Text>
            </View>
            <TeksKaya isi={cm.warna} style={{ fontSize: 6.9, color: WARNA.teksLembut, lineHeight: 1.38 }} />
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              {[...cm.zona].reverse().map((z) => (
                <View key={z.zona} style={{ flex: 1, marginRight: 3 }}>
                  <View style={{ height: 7, borderRadius: 3.5, backgroundColor: ZONA[z.zona].kuat }} />
                  <Text style={{ fontSize: 6.2, color: WARNA.teksLembut, marginTop: 2, textAlign: 'center', lineHeight: 1.25 }}>{z.label}</Text>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 5.8, color: WARNA.teksSamar, textAlign: 'right', marginTop: 1, marginRight: 3 }}>makin berkembang →</Text>
            <Text style={{ fontSize: 9.2, fontWeight: 700, color: WARNA.navy, marginTop: 8, marginBottom: 3 }}>Skor Perkembangan</Text>
            <TeksKaya isi={cm.skor} style={{ fontSize: 6.9, color: WARNA.teksLembut, lineHeight: 1.38 }} />
          </View>
        </View>
      </View>
    </HalamanIsi>
  );
}
