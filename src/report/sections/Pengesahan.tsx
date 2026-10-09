// 11. Lembar Pengesahan: logo lockup, place/date (bold), two signature blocks (image ~40 mm, name bold +
// underlined, role, STR) and the single small contact line (D6). No stamp. A missing signature leaves an empty line.
// Partner children (siap.mitraYasi): YASI logo beside the lockup (LogoKemitraan); layout below is unchanged.
import { Image, Text, View } from '@react-pdf/renderer';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian } from '../components/JudulBagian.tsx';
import { LogoKemitraan } from '../components/LogoKemitraan.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { ANGKA, WARNA } from '../theme.ts';

const MM = 72 / 25.4;
const LEBAR_TTD = 40 * MM;
const TINGGI_TTD = 22 * MM;

export function Pengesahan(p: PropsBagian & { nomor?: number }) {
  const { siap, aset } = p;
  const ps = siap.pengesahan;
  return (
    <HalamanIsi {...p} bookmark="Lembar Pengesahan">
      <View wrap={false}>
        <JudulBagian judul="Lembar Pengesahan" inggris="Approval" nomor={p.nomor} />
        <View style={{ borderWidth: 0.7, borderColor: WARNA.garis, borderRadius: 8, paddingVertical: 26, paddingHorizontal: 22, marginTop: 6 }}>
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            {siap.mitraYasi ? (
              <LogoKemitraan lockup={aset.logoLockup} lebar={150} tinggi={58.6} yasi={aset.logoYasi} />
            ) : (
              <Image src={aset.logoLockup} style={{ width: 150, height: 58.6 }} />
            )}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 6.6, fontWeight: 600, color: WARNA.slate, letterSpacing: 1 }}>NOMOR LAPORAN</Text>
              <Text style={{ fontSize: 8.6, color: WARNA.navy, marginTop: 2, ...ANGKA }}>{siap.meta.nomor}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 6.6, fontWeight: 600, color: WARNA.slate, letterSpacing: 1 }}>PERIODE</Text>
              <Text style={{ fontSize: 8.6, color: WARNA.navy, marginTop: 2, ...ANGKA }}>{siap.periode.teks}</Text>
            </View>
          </View>
          <View style={{ height: 0.6, backgroundColor: WARNA.garis, marginBottom: 18 }} />
          <TeksKaya isi={ps.tempatTanggal} style={{ fontSize: 10, color: WARNA.navy, textAlign: 'center', ...ANGKA }} />
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            {ps.penandatangan.map((t) => {
              const ttd = aset.ttd[t.kunci];
              return (
                <View key={t.kunci} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ height: TINGGI_TTD, width: LEBAR_TTD + 30, alignItems: 'center', justifyContent: 'flex-end' }}>
                    {ttd ? <Image src={ttd} style={{ width: LEBAR_TTD, maxHeight: TINGGI_TTD, objectFit: 'contain' }} /> : null}
                  </View>
                  <View style={{ width: LEBAR_TTD + 30, height: 0.6, backgroundColor: ttd ? 'transparent' : WARNA.teksSamar, marginTop: 2 }} />
                  <Text style={{ fontSize: 9.6, fontWeight: 700, color: WARNA.navy, textDecoration: 'underline', marginTop: 4 }}>{t.nama}</Text>
                  <Text style={{ fontSize: 8.2, color: WARNA.teksLembut, marginTop: 2 }}>{t.peran}</Text>
                  {t.strTeks ? <Text style={{ fontSize: 7.6, color: WARNA.teksSamar, marginTop: 1.5, ...ANGKA }}>{t.strTeks}</Text> : null}
                </View>
              );
            })}
          </View>
        </View>
        <Text style={{ fontSize: 6.8, color: WARNA.teksSamar, textAlign: 'center', marginTop: 14 }}>{ps.kontak}</Text>
      </View>
    </HalamanIsi>
  );
}
