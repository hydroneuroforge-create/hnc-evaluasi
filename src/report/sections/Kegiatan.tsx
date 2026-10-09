// 4. Hasil Evaluasi Kegiatan: the TDO callout once (D7) + 14 unsplit cards with status chip, BEFORE→AFTER level
// dots (rank-based, grey = awal, petrol = lanjutan) atop the two narrative columns (bold preserved).
import { Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import type { KartuKegiatan, LaporanSiap, NilaiTampil } from '../../core/index.ts';
import { Titik, type Waktu } from '../components/Titik.tsx';
import { ChipStatus } from '../components/ChipStatus.tsx';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian, Label } from '../components/JudulBagian.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { ANGKA, JARAK, WARNA } from '../theme.ts';

const gayaNarasi = { fontSize: 8.3, lineHeight: 1.45, color: WARNA.teks } as const;

function Kolom({ judul, warna, nilai, waktu, children }: {
  judul: string; warna: string; nilai: NilaiTampil; waktu: Waktu; children: ReactNode;
}) {
  const sesudah = waktu === 'sesudah';
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, paddingBottom: 5, borderBottomWidth: 0.5, borderBottomColor: WARNA.garisLembut }}>
        <Label warna={warna}>{judul}</Label>
        <View style={{ flex: 1 }} />
        <Titik peringkat={nilai.peringkat} waktu={waktu} ukuran={6.6} />
        <Text style={{ fontSize: 7.2, fontWeight: sesudah ? 700 : 500, color: sesudah ? WARNA.petrol : WARNA.teksSamar, marginLeft: 5, lineHeight: 1.2, ...ANGKA }}>
          {nilai.peringkat === null ? 'Belum teramati' : `${nilai.label} (${nilai.nilai})`}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Kartu({ k, siap }: { k: KartuKegiatan; siap: LaporanSiap }) {
  const domain = siap.skor.domain.find((d) => d.id === k.domain);
  return (
    <View wrap={false} style={{ borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, marginBottom: 9 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 10, backgroundColor: WARNA.latar, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomWidth: 0.6, borderBottomColor: WARNA.garisLembut }}>
        <View style={{ width: 19, height: 19, borderRadius: 9.5, backgroundColor: WARNA.petrol, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
          <Text style={{ fontSize: 8, fontWeight: 700, color: WARNA.putih, lineHeight: 1, ...ANGKA }}>{k.no}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <TeksKaya isi={k.nama} style={{ fontSize: 10, fontWeight: 700, color: WARNA.navy, lineHeight: 1.2 }} />
          {domain ? <Text style={{ fontSize: 6.4, color: WARNA.teksSamar, marginTop: 1 }}>Aspek: {domain.nama}</Text> : null}
        </View>
        <View style={{ width: 78, alignItems: 'flex-end' }}><ChipStatus status={k.status} style={{ alignSelf: 'flex-end' }} /></View>
      </View>
      <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10 }}>
        <Kolom judul={siap.label.sebelum} warna={WARNA.teksSamar} nilai={k.sebelum} waktu="sebelum">
          {k.sebelum.tdo ? (
            <Text style={{ ...gayaNarasi, fontStyle: 'italic', color: WARNA.teksSamar }}>{k.sebelum.teksTdo}</Text>
          ) : (
            <TeksKaya isi={k.sebelum.paragraf} style={gayaNarasi} />
          )}
        </Kolom>
        <View style={{ width: 0.6, backgroundColor: WARNA.garisLembut, marginHorizontal: 10 }} />
        <Kolom judul={siap.label.sesudah} warna={WARNA.petrol} nilai={k.sesudah} waktu="sesudah">
          {k.sesudah.tdo ? (
            <Text style={{ ...gayaNarasi, fontStyle: 'italic', color: WARNA.teksSamar }}>{k.sesudah.teksTdo}</Text>
          ) : (
            <TeksKaya isi={k.sesudah.paragraf} style={gayaNarasi} />
          )}
        </Kolom>
      </View>
    </View>
  );
}

function Callout({ c, judul }: { c: NonNullable<LaporanSiap['kegiatan']['calloutSebelum']>; judul: string }) {
  return (
    <View wrap={false} style={{ flexDirection: 'row', backgroundColor: WARNA.latarTeal, borderRadius: 7, padding: 10, marginBottom: JARAK.s3 }}>
      <View style={{ width: 3, borderRadius: 1.5, backgroundColor: WARNA.aqua, marginRight: 9 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 8.4, fontWeight: 700, color: WARNA.petrol }}>{judul} · {c.teksNomor}</Text>
        <TeksKaya isi={c.paragraf} style={{ fontSize: 8.4, color: WARNA.teks, lineHeight: 1.45, marginTop: 2 }} />
      </View>
    </View>
  );
}

export function Kegiatan(p: PropsBagian & { nomor?: number }) {
  const kg = p.siap.kegiatan;
  return (
    <HalamanIsi {...p} bookmark="Hasil Evaluasi Kegiatan">
      <JudulBagian judul="Hasil Evaluasi Kegiatan" inggris="Activity Evaluation" nomor={p.nomor} />
      {kg.calloutSebelum ? <Callout c={kg.calloutSebelum} judul={`Catatan ${p.siap.label.sebelum}`} /> : null}
      {kg.calloutSesudah ? <Callout c={kg.calloutSesudah} judul={`Catatan ${p.siap.label.sesudah}`} /> : null}
      {kg.kartu.map((k) => <Kartu key={k.id} k={k} siap={p.siap} />)}
    </HalamanIsi>
  );
}
