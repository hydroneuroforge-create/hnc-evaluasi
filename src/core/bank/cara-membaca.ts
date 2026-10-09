// 'Cara Membaca Laporan' texts and status labels. All [BARU].
import type { SkalaId, Zona } from '../skala.ts';
import type { StatusItem } from '../skor.ts';
import type { TeksBank } from '../types.ts';

const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export const CARA_MEMBACA = {
  /** The single rule, shown prominently, when every scale is 'naik'. */
  aturanSatu: B('Semua skala 1–4: makin besar makin berkembang'),
  penjelasanSatu: B('Setiap penilaian dalam laporan ini menggunakan skala 1 sampai 4. Angka yang lebih besar selalu menunjukkan kemampuan yang lebih berkembang.'),
  /** Used only when a scale set mixes directions (not the default). */
  aturanCampuran: B('Perhatikan arah setiap skala'),
  penjelasanCampuran: B('Tidak semua skala dalam laporan ini memiliki arah yang sama. Arah setiap skala dijelaskan pada kotak di bawah.'),
  arahNaik: B('Nilai yang lebih besar menunjukkan kemampuan yang lebih berkembang.'),
  arahTurun: B('Nilai 1 menunjukkan kondisi yang paling berkembang.'),
  dikecualikan: B('“Belum diberikan” berarti aktivitas belum diperkenalkan dalam program, sedangkan “Tidak dapat diobservasi” berarti kondisi saat evaluasi belum memungkinkan penilaian. Keduanya tidak dihitung dalam skor.'),
  warna: B('Warna abu-abu menunjukkan hasil evaluasi awal; warna biru kehijauan (teal) menunjukkan hasil evaluasi lanjutan.'),
  skor: B('Skor Perkembangan (0–100) merangkum seluruh penilaian dalam delapan aspek. Setiap nilai diubah ke rentang 0–100, lalu dirata-ratakan per aspek dan untuk seluruh aspek. Aspek yang belum dapat diobservasi tidak diisi dengan perkiraan; skor hanya dihitung dari aspek yang benar-benar teramati.'),
};

export const KETERANGAN_SKALA: Record<SkalaId, { judul: string; tampilan: TeksBank }> = {
  kegiatan: { judul: 'Kegiatan Evaluasi', tampilan: B('Ditampilkan sebagai titik, dari ●○○○ hingga ●●●●.') },
  sensori: { judul: 'Sistem Sensorik', tampilan: B('Ditampilkan sebagai bintang, dari ★ hingga ★★★★.') },
  refleks: { judul: 'Refleks Primitif', tampilan: B('Nilai 1–4 menunjukkan tingkat kontrol tubuh terhadap refleks primitif.') },
  program: { judul: 'Program Hidroterapi', tampilan: B('Nilai 1–4 menunjukkan tingkat kemandirian dalam setiap aktivitas program.') },
};

export const LABEL_ZONA: Record<Zona, string> = {
  z4: 'Berkembang baik',
  z3: 'Berkembang',
  z2: 'Mulai berkembang',
  z1: 'Perlu dukungan',
};

export const STATUS: Record<StatusItem, { label: string; keterangan: TeksBank }> = {
  meningkat: { label: 'Meningkat', keterangan: B('Lebih berkembang dibandingkan evaluasi awal.') },
  stabil: { label: 'Stabil', keterangan: B('Sama dengan hasil evaluasi awal.') },
  perluPenguatan: { label: 'Perlu Penguatan', keterangan: B('Belum sebaik hasil evaluasi awal; aspek ini mendapat perhatian lebih.') },
  baruTeramati: { label: 'Baru Teramati', keterangan: B('Belum dapat diobservasi pada evaluasi awal; kini sudah dapat dinilai.') },
  belumDiberikan: { label: 'Belum diberikan', keterangan: B('Aktivitas belum diperkenalkan dalam program.') },
  tidakTeramati: { label: 'Tidak Teramati', keterangan: B('Belum dapat diobservasi pada evaluasi lanjutan.') },
};

export const LABEL_WAKTU = { sebelum: 'Evaluasi Awal', sesudah: 'Evaluasi Lanjutan' };
export const LABEL_PROGRAM_INDIVIDUAL = 'Program Individual';
