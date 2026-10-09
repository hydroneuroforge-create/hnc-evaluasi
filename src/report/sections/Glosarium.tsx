// 10. Glosarium, two columns (entries unsplit).
import { View } from '@react-pdf/renderer';
import { HalamanIsi, type PropsBagian } from '../components/Halaman.tsx';
import { JudulBagian } from '../components/JudulBagian.tsx';
import { TeksKaya } from '../components/TeksKaya.tsx';
import { WARNA } from '../theme.ts';

export function Glosarium(p: PropsBagian & { nomor?: number }) {
  const g = p.siap.glosarium;
  const tengah = Math.ceil(g.length / 2);
  const kolom = [g.slice(0, tengah), g.slice(tengah)];
  return (
    <HalamanIsi {...p} bookmark="Glosarium">
      <JudulBagian judul="Glosarium" inggris="Glossary" nomor={p.nomor} />
      <View style={{ flexDirection: 'row' }}>
        {kolom.map((xs, k) => (
          <View key={k} style={{ flex: 1, marginLeft: k ? 14 : 0 }}>
            {xs.map((x, i) => (
              <View key={i} wrap={false} style={{ paddingVertical: 6.5, borderTopWidth: i ? 0.6 : 0, borderTopColor: WARNA.garisLembut }}>
                <TeksKaya isi={x.istilah} style={{ fontSize: 9, fontWeight: 700, color: WARNA.petrol, lineHeight: 1.3 }} />
                <TeksKaya isi={x.definisi} style={{ fontSize: 8, color: WARNA.teks, lineHeight: 1.45, marginTop: 1.5 }} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </HalamanIsi>
  );
}
