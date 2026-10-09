// Plain-language sentences for the 'Ringkasan untuk Orang Tua' page (PLAN.md §6.3). All [BARU].
import type { TeksBank } from '../types.ts';

const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export const RINGKAS_ORTU = {
  pembuka: B('Selama periode {periode}, {anandaPanggilan} menunjukkan perkembangan {kategori}.'),
  pembukaStabil: B('Selama periode {periode}, {anandaPanggilan} menunjukkan kondisi yang relatif stabil.'),
  skorNaik: B('Skor perkembangan meningkat dari {skorAwal} menjadi {skorAkhir} (+{selisih} poin).'),
  skorTetap: B('Skor perkembangan tercatat {skorAkhir}, dibandingkan {skorAwal} pada evaluasi awal.'),
  domainTeratas: B('Kemajuan terbesar terlihat pada aspek {daftar}.'),
  penutup: B('Fokus program berikutnya adalah {daftar}, agar kemajuan yang telah dicapai terus bertambah dan menetap.'),
  catatanSkor: B('Skor perkembangan adalah ringkasan visual dari penilaian terapis, bukan skor tes baku.'),
};

export const JUDUL_RINGKASAN = {
  pencapaian: 'Pencapaian Utama',
  fokus: 'Fokus Berikutnya',
  skor: 'Skor Perkembangan',
};
