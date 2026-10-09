// Sertifikat Pencapaian (D8, PLAN.md §8): logo lockup, title, recipient, achievement, place/date and both
// signatures (names underlined + roles) inside a fine petrol frame with a quiet wave motif. Consumes only
// SertifikatSiap + AsetRender. Not promotional: no photo, slogan, CTA, numbers or STR — only a tiny grey IG handle.
// Variants: 'a4' = A4 landscape (print); 'sosial' = 540×675 pt (rasterised at zoom 2 to 1080×1350 px).
// Partner children (siap.mitraYasi): YASI logo beside the lockup (LogoKemitraan, same height, one row); layout unchanged.
import { Defs, Document, Image, LinearGradient, Page, Path, Stop, Svg, Text, View } from '@react-pdf/renderer';
import type { SertifikatSiap } from '../core/index.ts';
import type { AsetRender } from '../report/aset.ts';
import { LogoKemitraan } from '../report/components/LogoKemitraan.tsx';
import { TeksKaya } from '../report/components/TeksKaya.tsx';
import { FONT, HALAMAN, WARNA } from '../report/theme.ts';

export type VarianSertifikat = 'a4' | 'sosial';

/** Geometry and type sizes per variant (pt). */
const UKURAN_VARIAN = {
  a4: {
    lebar: HALAMAN.tinggi, tinggi: HALAMAN.lebar, bingkai: 20, sela: 6, gelombang: 64,
    logo: 150, judul: 32, inggris: 12, kepada: 10, nama: 27, pencapaian: 12.5, tanggal: 10,
    ttdLebar: 102, ttdTinggi: 46, kolomTtd: 230, namaTtd: 9.6, peran: 8.2, ig: 6.5,
    atas: 56, jarakJudul: 24, jarakNama: 18, jarakTtd: 28,
  },
  sosial: {
    lebar: 540, tinggi: 675, bingkai: 16, sela: 5, gelombang: 62,
    logo: 140, judul: 28, inggris: 11, kepada: 9.5, nama: 21.5, pencapaian: 11.5, tanggal: 9.5,
    ttdLebar: 96, ttdTinggi: 46, kolomTtd: 210, namaTtd: 8.8, peran: 7.6, ig: 6.5,
    atas: 62, jarakJudul: 40, jarakNama: 30, jarakTtd: 50,
  },
} as const;

type Geometri = (typeof UKURAN_VARIAN)[VarianSertifikat];

/** Quiet water waves along the bottom edge inside the frame (fill gradients only; stroke gradients render black). */
function Gelombang({ g }: { g: Geometri }) {
  const dalam = g.bingkai + g.sela;
  const L = g.lebar - 2 * dalam;
  const T = g.gelombang;
  return (
    <Svg width={L} height={T} viewBox={`0 0 ${L} ${T}`} style={{ position: 'absolute', left: dalam, bottom: dalam }}>
      <Defs>
        <LinearGradient id="sg1" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={WARNA.aqua} stopOpacity={0.16} />
          <Stop offset="1" stopColor={WARNA.teal} stopOpacity={0.28} />
        </LinearGradient>
        <LinearGradient id="sg2" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={WARNA.slate} stopOpacity={0.3} />
          <Stop offset="1" stopColor={WARNA.aqua} stopOpacity={0.42} />
        </LinearGradient>
        <LinearGradient id="sg3" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={WARNA.petrolTua} stopOpacity={0.85} />
          <Stop offset="1" stopColor={WARNA.petrol} stopOpacity={0.85} />
        </LinearGradient>
      </Defs>
      <Path d={`M0 ${T * 0.3} C ${L * 0.2} ${T * 0.05}, ${L * 0.38} ${T * 0.6}, ${L * 0.56} ${T * 0.32} S ${L * 0.86} ${T * 0.05}, ${L} ${T * 0.26} L ${L} ${T} L 0 ${T} Z`} fill="url(#sg1)" />
      <Path d={`M0 ${T * 0.56} C ${L * 0.22} ${T * 0.34}, ${L * 0.44} ${T * 0.84}, ${L * 0.64} ${T * 0.56} S ${L * 0.9} ${T * 0.36}, ${L} ${T * 0.5} L ${L} ${T} L 0 ${T} Z`} fill="url(#sg2)" />
      <Path d={`M0 ${T * 0.8} C ${L * 0.24} ${T * 0.64}, ${L * 0.46} ${T * 1.0}, ${L * 0.7} ${T * 0.78} S ${L * 0.92} ${T * 0.66}, ${L} ${T * 0.76} L ${L} ${T} L 0 ${T} Z`} fill="url(#sg3)" />
    </Svg>
  );
}

/** Thin rule – dot – rule ornament. */
function Ornamen({ lebar }: { lebar: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: lebar, height: 0.7, backgroundColor: WARNA.aqua }} />
      <View style={{ width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: WARNA.petrol, marginHorizontal: 7 }} />
      <View style={{ width: lebar, height: 0.7, backgroundColor: WARNA.aqua }} />
    </View>
  );
}

export interface SertifikatDocumentProps {
  siap: SertifikatSiap;
  aset: AsetRender;
  /** Default 'a4'. */
  varian?: VarianSertifikat;
  /** Print the real signature images. Default: true for 'a4', false for 'sosial' (names and roles stay). */
  tandaTangan?: boolean;
}

export function SertifikatDocument({ siap, aset, varian = 'a4', tandaTangan = varian === 'a4' }: SertifikatDocumentProps) {
  const g = UKURAN_VARIAN[varian];
  const rasioLogo = 462 / 1182; // assets/logo-center-lockup.png
  return (
    <Document
      title={siap.meta.judul}
      author={siap.meta.penulis}
      creator={siap.meta.pembuat}
      producer={siap.meta.pembuat}
      language={siap.meta.bahasa}
      subject={siap.judul}
    >
      <Page size={[g.lebar, g.tinggi]} style={{ fontFamily: FONT, color: WARNA.teks, backgroundColor: WARNA.putih, fontSize: 10, lineHeight: 1.25 }}>
        <Gelombang g={g} />
        {/* frame: fine petrol outer line + hairline aqua inner line */}
        <View style={{ position: 'absolute', top: g.bingkai, left: g.bingkai, right: g.bingkai, bottom: g.bingkai, borderWidth: 1.1, borderColor: WARNA.petrol }} />
        <View
          style={{
            position: 'absolute', top: g.bingkai + g.sela, left: g.bingkai + g.sela, right: g.bingkai + g.sela, bottom: g.bingkai + g.sela,
            borderWidth: 0.4, borderColor: WARNA.aqua,
          }}
        />

        <View style={{ position: 'absolute', top: g.atas, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 60 }}>
          {siap.mitraYasi ? (
            <LogoKemitraan lockup={aset.logoLockup} lebar={g.logo} tinggi={g.logo * rasioLogo} yasi={aset.logoYasi} />
          ) : (
            <Image src={aset.logoLockup} style={{ width: g.logo, height: g.logo * rasioLogo }} />
          )}

          <Text style={{ fontSize: g.judul, fontWeight: 800, color: WARNA.navy, marginTop: g.jarakJudul, textAlign: 'center', letterSpacing: 0.3, lineHeight: 1.2 }}>
            {siap.judul}
          </Text>
          <Text style={{ fontSize: g.inggris, fontStyle: 'italic', color: WARNA.slate, marginTop: 4, textAlign: 'center', letterSpacing: 0.4, lineHeight: 1.25 }}>
            {siap.judulInggris}
          </Text>
          <View style={{ marginTop: 14 }}>
            <Ornamen lebar={34} />
          </View>

          <Text style={{ fontSize: g.kepada, color: WARNA.teksLembut, marginTop: g.jarakNama, textAlign: 'center', letterSpacing: 0.6 }}>
            {siap.diberikanKepada}
          </Text>
          <Text style={{ fontSize: g.nama, fontWeight: 700, color: WARNA.petrol, marginTop: 8, textAlign: 'center', lineHeight: 1.2 }}>{siap.nama}</Text>
          <View style={{ width: g.lebar * 0.42, height: 0.7, backgroundColor: WARNA.garis, marginTop: 8 }} />
          <TeksKaya
            isi={siap.pencapaian}
            style={{ fontSize: g.pencapaian, color: WARNA.teks, marginTop: 12, textAlign: 'center', lineHeight: 1.45 }}
          />
          <Text style={{ fontSize: g.tanggal, fontWeight: 600, color: WARNA.navy, marginTop: g.jarakNama, textAlign: 'center' }}>{siap.tempatTanggal}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: g.jarakTtd }}>
            {siap.penandatangan.map((t) => {
              const ttd = tandaTangan ? aset.ttd[t.kunci] : undefined;
              return (
                <View key={t.kunci} style={{ width: g.kolomTtd, alignItems: 'center' }}>
                  <View style={{ height: g.ttdTinggi, width: g.ttdLebar + 30, alignItems: 'center', justifyContent: 'flex-end' }}>
                    {ttd ? <Image src={ttd} style={{ width: g.ttdLebar, maxHeight: g.ttdTinggi, objectFit: 'contain' }} /> : null}
                  </View>
                  {ttd ? null : <View style={{ width: g.ttdLebar + 30, height: 0.6, backgroundColor: WARNA.teksSamar }} />}
                  <Text style={{ fontSize: g.namaTtd, fontWeight: 700, color: WARNA.navy, textDecoration: 'underline', marginTop: 4, lineHeight: 1.25 }}>{t.nama}</Text>
                  <Text style={{ fontSize: g.peran, color: WARNA.teksLembut, marginTop: 2, lineHeight: 1.25 }}>{t.peran}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text
          style={{
            position: 'absolute', top: g.tinggi - (g.bingkai + g.ig) / 2 - 0.5, left: 0, right: 0,
            textAlign: 'center', fontSize: g.ig, lineHeight: 1, color: WARNA.teksSamar, letterSpacing: 0.5,
          }}
        >
          {siap.klinik.ig}
        </Text>
      </Page>
    </Document>
  );
}
