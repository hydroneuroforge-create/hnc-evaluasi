// 7. Program Hidroterapi: journey map, legend and one table per chapter (value chips, muted 'Belum diberikan',
// 'Program Individual' badge on individual items).
import { Text, View } from '@react-pdf/renderer';
import type { BabProgramTampil, ItemProgramTampil, LaporanSiap, NilaiTampil } from '../../core/index.ts';
import { BarBab } from '../charts/BarBab.tsx';
import { PetaPerjalanan } from '../charts/PetaPerjalanan.tsx';
import { Pil } from '../components/ChipStatus.tsx';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian } from '../components/JudulBagian.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { ANGKA, JARAK, LEBAR_ISI, STATUS_WARNA, WARNA, ZONA } from '../theme.ts';

const LEBAR_NILAI = 70;

function ChipNilai({ n, waktu, labelKosong }: { n: NilaiTampil; waktu: 'sebelum' | 'sesudah'; labelKosong: string }) {
  if (n.nilai === null || !n.zona) {
    const w = STATUS_WARNA.belumDiberikan;
    return (
      <View style={{ borderWidth: 0.6, borderColor: w.garis, borderStyle: 'dashed', borderRadius: 5, paddingVertical: 3, paddingHorizontal: 4, alignItems: 'center' }}>
        <Text style={{ fontSize: 6.3, color: w.teks, textAlign: 'center', lineHeight: 1.25 }}>{labelKosong}</Text>
      </View>
    );
  }
  const z = ZONA[n.zona];
  const sesudah = waktu === 'sesudah';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 15, height: 15, borderRadius: 7.5, alignItems: 'center', justifyContent: 'center', marginRight: 4, backgroundColor: sesudah ? z.kuat : WARNA.putih, borderWidth: 1, borderColor: sesudah ? z.kuat : WARNA.awal }}>
        <Text style={{ fontSize: 7.4, fontWeight: 800, color: sesudah ? WARNA.navy : WARNA.teksLembut, lineHeight: 1, ...ANGKA }}>{n.nilai}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: 6.2, color: sesudah ? WARNA.teks : WARNA.teksSamar, lineHeight: 1.25, fontWeight: sesudah ? 600 : 400 }}>{n.label}</Text>
    </View>
  );
}

function Tabel({ b, siap }: { b: BabProgramTampil; siap: LaporanSiap }) {
  const kol = b.kolomManfaat
    ? { no: 16, akt: 120, tgt: 84, man: LEBAR_ISI - 16 - 120 - 84 - 2 * LEBAR_NILAI }
    : { no: 16, akt: 190, tgt: LEBAR_ISI - 16 - 190 - 2 * LEBAR_NILAI, man: 0 };
  const kepala = { fontSize: 6.4, fontWeight: 700, color: WARNA.slate, letterSpacing: 0.4, lineHeight: 1.25 } as const;
  const sel = { paddingVertical: 5, paddingHorizontal: 4 } as const;
  const kosong = siap.caraMembaca.status.find((s) => s.kode === 'belumDiberikan')?.label ?? '–';
  const baris = (it: ItemProgramTampil, i: number) => (
    <View key={it.id} wrap={false} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: i % 2 ? WARNA.latar : WARNA.putih, borderBottomWidth: 0.5, borderBottomColor: WARNA.garisLembut }}>
      <Text style={{ ...sel, width: kol.no, fontSize: 7, color: WARNA.teksSamar, lineHeight: 1.35, ...ANGKA }}>{it.no}</Text>
      <View style={{ ...sel, width: kol.akt }}>
        <Text style={{ fontSize: 7.6, color: WARNA.navy, lineHeight: 1.35, fontStyle: b.bab === 3 ? 'italic' : 'normal' }}>
          {it.posisi ? <Text style={{ fontWeight: 700, fontStyle: 'normal' }}>{it.posisi} </Text> : null}
          {it.aktivitas}
        </Text>
        {it.individual ? <Pil teks={siap.label.programIndividual} latar={WARNA.latarTeal} warna={WARNA.petrol} style={{ marginTop: 2.5 }} /> : null}
        {it.catatanFisioterapis ? <Text style={{ fontSize: 6.4, color: WARNA.teksLembut, marginTop: 2, lineHeight: 1.3 }}>{it.catatanFisioterapis}</Text> : null}
      </View>
      <Text style={{ ...sel, width: kol.tgt, fontSize: 7, fontStyle: 'italic', color: WARNA.teksLembut, lineHeight: 1.35 }}>{it.targetRefleks}</Text>
      {b.kolomManfaat ? <Text style={{ ...sel, width: kol.man, fontSize: 7, color: WARNA.teks, lineHeight: 1.38 }}>{it.manfaat ?? ''}</Text> : null}
      <View style={{ ...sel, width: LEBAR_NILAI }}><ChipNilai n={it.sebelum} waktu="sebelum" labelKosong={kosong} /></View>
      <View style={{ ...sel, width: LEBAR_NILAI }}><ChipNilai n={it.sesudah} waktu="sesudah" labelKosong={kosong} /></View>
    </View>
  );
  return (
    <View style={{ marginBottom: JARAK.s4 }}>
      <View wrap={false}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: 700, color: WARNA.navy }}>{b.nama === b.namaInggris ? `Chapter ${b.bab}: ${b.nama}` : b.judul}</Text>
          <Text style={{ fontSize: 7, color: WARNA.teksSamar, marginTop: 1, ...ANGKA }}>{b.skor.teksDiberikan}</Text>
        </View>
        {b.posisiSaatIni ? <Pil teks="Posisi saat ini" latar={WARNA.petrol} warna={WARNA.putih} style={{ marginRight: 8, marginBottom: 2 }} /> : null}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 7.2, color: WARNA.teksLembut, ...ANGKA }}>
            <Text style={{ color: WARNA.awal }}>{b.skor.awalBulat === null ? '–' : `${b.skor.awalBulat}%`}</Text>
            {' → '}
            <Text style={{ color: WARNA.petrol, fontWeight: 700 }}>{b.skor.akhirBulat === null ? '–' : `${b.skor.akhirBulat}%`}</Text>
          </Text>
          <BarBab awal={b.skor.awalBulat} akhir={b.skor.akhirBulat} lebar={90} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: WARNA.latarTeal, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
        <Text style={{ ...sel, ...kepala, width: kol.no }}>NO</Text>
        <Text style={{ ...sel, ...kepala, width: kol.akt }}>{b.kolomAktivitas.toUpperCase()}</Text>
        <Text style={{ ...sel, ...kepala, width: kol.tgt }}>{b.kolomTarget.toUpperCase()}</Text>
        {b.kolomManfaat ? <Text style={{ ...sel, ...kepala, width: kol.man }}>MANFAAT</Text> : null}
        <Text style={{ ...sel, ...kepala, width: LEBAR_NILAI }}>{siap.label.sebelum.toUpperCase()}</Text>
        <Text style={{ ...sel, ...kepala, width: LEBAR_NILAI }}>{siap.label.sesudah.toUpperCase()}</Text>
      </View>
      {b.item.slice(0, 1).map(baris)}
      </View>
      {b.item.slice(1).map((it, i) => baris(it, i + 1))}
    </View>
  );
}

export function Program(p: PropsBagian & { nomor?: number }) {
  const { siap } = p;
  const pr = siap.program;
  return (
    <HalamanIsi {...p} bookmark="Program Hidroterapi">
      <JudulBagian judul="Program Hidroterapi" inggris="Hydrotherapy Program" nomor={p.nomor} />
      <View wrap={false} style={{ borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 7, paddingTop: 10, paddingBottom: 4, marginBottom: JARAK.s3 }}>
        <Text style={{ fontSize: 9.4, fontWeight: 700, color: WARNA.navy, marginLeft: 11 }}>Perjalanan Program</Text>
        <Text style={{ fontSize: 6.8, color: WARNA.teksSamar, marginLeft: 11 }}>Rata-rata pencapaian aktivitas yang sudah diberikan per chapter (0–100%)</Text>
        <PetaPerjalanan bab={pr.bab.map((b) => b.skor)} posisi={pr.posisiSaatIni.bab} lebar={LEBAR_ISI - 2} />
      </View>
      <View wrap={false} style={{ flexDirection: 'row', marginBottom: JARAK.s4 }}>
        {pr.legenda.baris.map((l, i) => (
          <View key={l.nilai} style={{ flex: 1, flexDirection: 'row', marginRight: i < 3 ? 6 : 0, backgroundColor: ZONA[l.zona].muda, borderRadius: 6, padding: 6 }}>
            <TeksKaya isi={l.paragraf} style={{ fontSize: 6.6, color: WARNA.teks, lineHeight: 1.35 }} />
          </View>
        ))}
      </View>
      {pr.bab.map((b) => <Tabel key={b.bab} b={b} siap={siap} />)}
    </HalamanIsi>
  );
}
