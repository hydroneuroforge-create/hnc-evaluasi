// Rounded card; unsplit across pages by default.
import { View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { JARAK, WARNA, type Gaya } from '../theme.ts';

export function Kartu({ children, style, latar = WARNA.putih, garis = WARNA.garis, pecah = false }: {
  children: ReactNode; style?: Gaya; latar?: string; garis?: string; pecah?: boolean;
}) {
  return (
    <View
      wrap={pecah}
      style={{
        backgroundColor: latar, borderWidth: 0.7, borderColor: garis, borderRadius: 7,
        padding: JARAK.s3, ...style,
      }}
    >
      {children}
    </View>
  );
}
