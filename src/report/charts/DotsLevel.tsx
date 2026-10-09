// BEFORE → AFTER level dots with level labels (kegiatan cards). Dots are rank-based (skala.ts peringkat).
import { Path, Svg, Text, View } from '@react-pdf/renderer';
import type { NilaiTampil } from '../../core/index.ts';
import { Titik } from '../components/Titik.tsx';
import { ANGKA, WARNA } from '../theme.ts';

export function Panah({ warna = WARNA.teksSamar, lebar = 14 }: { warna?: string; lebar?: number }) {
  return (
    <Svg width={lebar} height={8} viewBox={`0 0 ${lebar} 8`}>
      <Path d={`M 1 4 L ${lebar - 2} 4`} stroke={warna} strokeWidth={0.9} strokeLinecap="round" />
      <Path d={`M ${lebar - 5} 1.4 L ${lebar - 1.6} 4 L ${lebar - 5} 6.6`} stroke={warna} strokeWidth={0.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Sisi({ nilai, waktu, labelKosong, labelWaktu }: { nilai: NilaiTampil; waktu: 'sebelum' | 'sesudah'; labelKosong: string; labelWaktu: string }) {
  const warna = waktu === 'sesudah' ? WARNA.petrol : WARNA.teksSamar;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Titik peringkat={nilai.peringkat} waktu={waktu} ukuran={6.6} />
      <View style={{ marginLeft: 5 }}>
        <Text style={{ fontSize: 5.8, color: WARNA.teksSamar, lineHeight: 1.15, letterSpacing: 0.4 }}>{labelWaktu.toUpperCase()}</Text>
        <Text style={{ fontSize: 7, fontWeight: waktu === 'sesudah' ? 700 : 500, color: warna, lineHeight: 1.2, ...ANGKA }}>
          {nilai.peringkat === null ? labelKosong : `${nilai.label} (${nilai.nilai})`}
        </Text>
      </View>
    </View>
  );
}

export function DotsLevel({ sebelum, sesudah, labelSebelum, labelSesudah, kosongSebelum = 'Belum teramati', kosongSesudah = 'Belum teramati' }: {
  sebelum: NilaiTampil; sesudah: NilaiTampil; labelSebelum: string; labelSesudah: string; kosongSebelum?: string; kosongSesudah?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Sisi nilai={sebelum} waktu="sebelum" labelKosong={kosongSebelum} labelWaktu={labelSebelum} />
      <View style={{ marginHorizontal: 8 }}><Panah /></View>
      <Sisi nilai={sesudah} waktu="sesudah" labelKosong={kosongSesudah} labelWaktu={labelSesudah} />
    </View>
  );
}
