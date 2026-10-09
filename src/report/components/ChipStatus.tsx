// Status chip (Meningkat / Stabil / Perlu Penguatan / Baru Teramati / Belum diberikan) and a generic pill.
import { Text, View } from '@react-pdf/renderer';
import type { StatusTampil } from '../../core/index.ts';
import { STATUS_WARNA, type Gaya } from '../theme.ts';

export function ChipStatus({ status, style }: { status: StatusTampil; style?: Gaya }) {
  const w = STATUS_WARNA[status.kode];
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        backgroundColor: w.latar, borderColor: w.garis, borderWidth: 0.6, borderRadius: 8,
        paddingVertical: 1.8, paddingHorizontal: 6, ...style,
      }}
    >
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: w.teks, marginRight: 3.5 }} />
      <Text style={{ fontSize: 6.8, fontWeight: 600, color: w.teks, lineHeight: 1.2 }}>{status.label}</Text>
    </View>
  );
}

export function Pil({ teks, latar, warna, style }: { teks: string; latar: string; warna: string; style?: Gaya }) {
  return (
    <View style={{ backgroundColor: latar, borderRadius: 8, paddingVertical: 1.8, paddingHorizontal: 6, alignSelf: 'flex-start', ...style }}>
      <Text style={{ fontSize: 6.8, fontWeight: 700, color: warna, lineHeight: 1.2 }}>{teks}</Text>
    </View>
  );
}
