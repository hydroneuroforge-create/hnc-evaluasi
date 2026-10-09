// Highlight candidates for Kesimpulan P2 and the Ringkasan page (PLAN.md §6.3).
// Candidate ids: 'kegiatan:<id>', 'sensori', 'refleks', 'program:b1' | 'program:b2' | 'program:b3'.
import type { KegiatanId, TeksBank } from '../types.ts';

const D = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'DOKUMEN', ...(catatan ? { catatan } : {}) });
const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export interface TemplatSorotan {
  /** Sentence for Kesimpulan (numbered list item). */
  kalimat: TeksBank;
  /** Short title for the Ringkasan page. */
  judulSingkat: TeksBank;
  /** One-line description for the Ringkasan page. */
  ringkas: TeksBank;
}

/** Generic kegiatan templates. Tokens: {frasa} {labelSebelum} {labelSesudah}. */
export const SOROTAN_KEGIATAN_UMUM = {
  kalimat: B('**Peningkatan {frasa}**, dari tingkat “{labelSebelum}” menjadi “{labelSesudah}”.'),
  kalimatBaruTeramati: B('**Perkembangan {frasa}**, yang kini sudah dapat diobservasi dan berada pada tingkat “{labelSesudah}”.'),
  ringkas: B('Dari “{labelSebelum}” menjadi “{labelSesudah}”.'),
  ringkasBaruTeramati: B('Kini berada pada tingkat “{labelSesudah}”.'),
};

export interface SorotanKegiatanBank {
  judulSingkat: TeksBank;
  /** Overrides of the generic templates, with the AFTER level they require (if any). */
  kalimat?: { teks: TeksBank; levelSesudah?: number };
  ringkas?: { teks: TeksBank; levelSesudah?: number };
}

export const SOROTAN_KEGIATAN: Record<KegiatanId, SorotanKegiatanBank> = {
  responEkspresi: { judulSingkat: B('Respons lebih tenang') },
  eyeContact: { judulSingkat: B('Kontak mata meningkat') },
  pemahamanInstruksi: {
    judulSingkat: B('Mengikuti instruksi'),
    kalimat: { teks: D('**Peningkatan kemampuan mengikuti instruksi** dengan dua perintah sederhana secara berurutan.'), levelSesudah: 3 },
    ringkas: { teks: B('Mampu mengikuti dua instruksi sederhana secara berurutan.'), levelSesudah: 3 },
  },
  kekuatanLeher: { judulSingkat: B('Leher lebih kuat') },
  proning: { judulSingkat: B('Nyaman dalam posisi tengkurap') },
  reaksiVerbal: { judulSingkat: B('Kemampuan verbal berkembang') },
  motorikTangan: { judulSingkat: B('Genggaman lebih kuat') },
  motorikKaki: { judulSingkat: B('Gerak kaki lebih konsisten') },
  ototInti: {
    judulSingkat: B('Otot inti lebih kuat'),
    kalimat: { teks: D('**Peningkatan kekuatan otot inti (core muscle)**[[ {besaranSorotan}]][[#waterTrap:, ditandai dengan kemampuan melakukan _water trap_ di kolam dalam]].', '{besaranSorotan}: selisih ≥ 2 = "yang sangat signifikan", selisih 1 = "yang positif"') },
    ringkas: { teks: B('Mampu mempertahankan postur stabil[[ {ototInti.durasi}]][[#waterTrap: dan melakukan _water trap_ di kolam dalam]].') },
  },
  berjalanMajuMundur: { judulSingkat: B('Berjalan maju-mundur') },
  posturTulangBelakang: { judulSingkat: B('Postur tubuh baik') },
  bahu: { judulSingkat: B('Bahu lebih seimbang') },
  kakiAyun: { judulSingkat: B('Ayunan kaki lebih terarah') },
  backFloating: { judulSingkat: B('Back floating berkembang') },
};

export const SOROTAN_SENSORI = {
  /** All three systems moved from the same value to the same value. */
  seragam: {
    kalimat: D('**Perkembangan sistem sensorik** dari kategori {kategoriSebelum} (Bintang {sebelum}) menuju {kategoriSesudah} (Bintang {sesudah}), yang berdampak positif pada partisipasi dan respons Ananda selama sesi terapi.'),
    judulSingkat: B('Integrasi sensorik meningkat'),
    ringkas: B('Dari Bintang {sebelum} menuju Bintang {sesudah} pada ketiga sistem sensorik.'),
  } satisfies TemplatSorotan,
  campuran: {
    kalimat: B('**Perkembangan sistem sensorik**, dengan kemajuan pada sistem {daftar}, yang berdampak positif pada partisipasi dan respons Ananda selama sesi terapi.'),
    judulSingkat: B('Integrasi sensorik meningkat'),
    ringkas: B('Kemajuan pada sistem {daftar}.'),
  } satisfies TemplatSorotan,
};

export const SOROTAN_REFLEKS: TemplatSorotan = {
  kalimat: B('**Integrasi refleks primitif yang semakin baik**, dengan {jumlah} dari {total} refleks menunjukkan kemajuan.'),
  judulSingkat: B('Refleks lebih terkendali'),
  ringkas: B('{jumlah} dari {total} refleks menunjukkan kemajuan.'),
};

export const SOROTAN_PROGRAM: TemplatSorotan = {
  kalimat: B('**Kemajuan pada program {namaBab}**, dengan capaian bab meningkat dari {awal}% menjadi {akhir}%.'),
  judulSingkat: B('Kemajuan {namaBab}'),
  ringkas: B('Capaian bab meningkat dari {awal}% menjadi {akhir}%.'),
};
