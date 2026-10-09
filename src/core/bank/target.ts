// Target rules for the next 24 sessions (PLAN.md §6.3). All texts [BARU] except where noted.
import type { TeksBank } from '../types.ts';

const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export const TARGET = {
  programNaik: B('Menuju tingkat “{label}” ({nilai})', 'aktivitas program yang sudah diberikan dan belum Mandiri'),
  programBaru: B('Mulai diperkenalkan', 'aktivitas program yang belum diberikan'),
  kegiatan: B('Menuju tingkat “{label}” ({nilai})', 'kegiatan dengan tingkat ≤ 2 pada evaluasi lanjutan'),
  refleks: B('Menuju tingkat “{label}” ({nilai})', 'refleks dengan tingkat ≤ 2 pada evaluasi lanjutan'),
  sensori: B('Menuju tingkat “{label}” ({nilai})', 'sistem sensorik yang belum mencapai bintang terbaik'),
  evaluasiBerikutnya: B('Evaluasi berikutnya dilakukan setelah Ananda menyelesaikan {setelahSesi} sesi berikutnya.', 'tanpa tanggal (keputusan pemilik)'),
  judul: B('Target {setelahSesi} Sesi Berikutnya'),
};

export const JUDUL_KELOMPOK_TARGET = {
  kegiatan: 'Kegiatan Evaluasi',
  sensori: 'Sistem Sensorik',
  refleks: 'Refleks Primitif',
  program: (namaBab: string) => `Program – ${namaBab}`,
};
