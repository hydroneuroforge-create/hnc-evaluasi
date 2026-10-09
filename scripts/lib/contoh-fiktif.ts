// Fully FICTITIOUS sample input (no real child): lets the partner-logo renders and checks run without the private
// reference data. anak.mitraYasi is set only when asked, so this module also runs unchanged against older commits.
import {
  KEGIATAN_IDS, REFLEKS_IDS, SENSORI_IDS,
  type Asesmen, type KegiatanId, type KegiatanNilai, type LaporanInput, type Level, type RefleksId, type SensoriId,
} from '../../src/core/index.ts';

/** Varied levels 1–3; 'sesudah' raises every other item by one (never below 'sebelum'). */
const level = (i: number, naik: boolean): Level => Math.min(4, 1 + (i % 3) + (naik && i % 2 === 0 ? 1 : 0)) as Level;

function asesmen(tanggal: string, naik: boolean): Asesmen {
  const kegiatan = {} as Record<KegiatanId, KegiatanNilai>;
  KEGIATAN_IDS.forEach((id, i) => { kegiatan[id] = { level: level(i, naik) }; });
  const sensori = {} as Record<SensoriId, Level | null>;
  SENSORI_IDS.forEach((id, i) => { sensori[id] = level(i + 1, naik); });
  const refleks = {} as Record<RefleksId, Level | null>;
  REFLEKS_IDS.forEach((id, i) => { refleks[id] = level(i + 2, naik); });
  return { tanggal, kegiatan, sensori, refleks, program: {} };
}

export function buatContohFiktif(opsi: { yasi?: boolean } = {}): LaporanInput {
  return {
    versi: 1,
    laporan: { nomor: 'HNC/EV/2026/02/001', tempat: 'Bogor', tanggal: '2026-02-10', evaluasiBerikutnya: { setelahSesi: 24 } },
    anak: {
      namaLengkap: 'Budi Santoso', namaPanggilan: 'Budi', tempatLahir: 'Bogor', tanggalLahir: '2019-03-14', jenisKelamin: 'L',
      diagnosa: '_ASD_', bergabungSejak: '2025-09',
      ...(opsi.yasi ? { mitraYasi: true } : {}),
    },
    sebelum: asesmen('2025-09-25', false),
    sesudah: asesmen('2026-02-10', true),
    sertifikat: { pencapaian: 'melakukan _water trap_ di kolam dalam', tanggal: '2026-02-10', tempat: 'Bogor' },
  };
}
