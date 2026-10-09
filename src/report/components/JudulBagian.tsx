// Bilingual section heading (Indonesian title + small English subtitle) and sub-headings.
// minPresenceAhead keeps headings from being orphaned at the bottom of a page.
import { Text, View } from '@react-pdf/renderer';
import { JARAK, UKURAN, WARNA } from '../theme.ts';

export function JudulBagian({ judul, inggris, nomor }: { judul: string; inggris: string; nomor?: number }) {
  return (
    <View minPresenceAhead={90} style={{ marginBottom: JARAK.s4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
        {nomor !== undefined ? (
          <Text style={{ fontSize: 7.2, fontWeight: 700, color: WARNA.aksen, letterSpacing: 1.4, marginRight: 6 }}>
            {String(nomor).padStart(2, '0')}
          </Text>
        ) : null}
        <Text style={{ fontSize: 7.2, fontWeight: 600, color: WARNA.slate, letterSpacing: 1.4, textTransform: 'uppercase' }}>{inggris}</Text>
      </View>
      <Text style={{ fontSize: UKURAN.judulBagian, fontWeight: 800, color: WARNA.navy, lineHeight: 1.2 }}>{judul}</Text>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <View style={{ width: 28, height: 2.4, backgroundColor: WARNA.petrol, borderRadius: 1.2 }} />
        <View style={{ width: 10, height: 2.4, backgroundColor: WARNA.aqua, borderRadius: 1.2, marginLeft: 3 }} />
      </View>
    </View>
  );
}

export function SubJudul({ judul, inggris, ruang = 70 }: { judul: string; inggris?: string; ruang?: number }) {
  return (
    <View minPresenceAhead={ruang} style={{ marginBottom: JARAK.s2, marginTop: JARAK.s1, flexDirection: 'row', alignItems: 'flex-end' }}>
      <Text style={{ fontSize: UKURAN.sub, fontWeight: 700, color: WARNA.navy, lineHeight: 1.2 }}>{judul}</Text>
      {inggris ? <Text style={{ fontSize: 7.4, color: WARNA.teksSamar, marginLeft: 6, marginBottom: 1, lineHeight: 1.2, fontStyle: 'italic' }}>{inggris}</Text> : null}
    </View>
  );
}

/** Small uppercase label. */
export function Label({ children, warna = WARNA.teksSamar }: { children: string; warna?: string }) {
  return <Text style={{ fontSize: 6.6, fontWeight: 600, color: warna, letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.2 }}>{children}</Text>;
}
