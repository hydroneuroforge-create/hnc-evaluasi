// Scale definitions: the single source for direction, level labels, legends, category phrases and colour zones
// (PLAN.md §5.1). Generator wording, scoring, chart axes and zones all read these definitions; nothing else
// may contain direction logic.
import type { Level, TeksBank } from './types.ts';

export type Arah = 'naik' | 'turun'; // 'naik' = a higher value is more developed
export type Zona = 'z4' | 'z3' | 'z2' | 'z1'; // z4 = best
export type SkalaId = 'kegiatan' | 'sensori' | 'refleks' | 'program';

export interface LevelSkala {
  /** Short label, e.g. 'Kontrol Baik', 'Mandiri'. */
  label: string;
  /** Legend description (without the 'Nilai n:' prefix). */
  legenda?: TeksBank;
  /** Category phrase used in sentences, e.g. 'cukup terintegrasi'. */
  kategori?: string;
  zona: Zona;
}

export interface DefinisiSkala {
  id: SkalaId;
  nama: string;
  min: 1;
  max: 4;
  arah: Arah;
  /** Prefix in front of a value: 'Bintang' | 'Nilai' | ''. */
  awalanNilai: string;
  /** Legend label pattern; '{n}' is the value, e.g. 'Nilai Bintang {n}:' or '{n} ='. */
  polaLabelLegenda: string;
  /** Summary P1 cites the label after the best value, e.g. 'nilainya 4 (Kontrol Baik)'. */
  labelDiRingkasan: boolean;
  level: Record<Level, LevelSkala>;
}

export interface SetSkala { id: 'B' | 'A'; skala: Record<SkalaId, DefinisiSkala> }

export const LEVELS: readonly Level[] = [1, 2, 3, 4];

const D = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'DOKUMEN', ...(catatan ? { catatan } : {}) });
const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

// --- shared texts -------------------------------------------------------------------------------------------
const KEGIATAN: DefinisiSkala = {
  id: 'kegiatan', nama: 'Kegiatan', min: 1, max: 4, arah: 'naik', awalanNilai: '', polaLabelLegenda: 'Level {n}:',
  labelDiRingkasan: false,
  level: {
    1: { label: 'Perlu Dukungan Penuh', zona: 'z1', legenda: B('Kemampuan belum tampak dan Ananda masih memerlukan dukungan penuh dari terapis.') },
    2: { label: 'Mulai Berkembang', zona: 'z2', legenda: B('Kemampuan mulai tampak, namun belum konsisten dan masih memerlukan banyak arahan.') },
    3: { label: 'Berkembang Baik', zona: 'z3', legenda: B('Kemampuan sudah cukup konsisten dengan arahan atau bantuan sesekali.') },
    4: { label: 'Optimal', zona: 'z4', legenda: B('Kemampuan tampak konsisten dan dapat dilakukan dengan baik secara mandiri.') },
  },
};

const PROGRAM: DefinisiSkala = {
  id: 'program', nama: 'Program Hidroterapi', min: 1, max: 4, arah: 'naik', awalanNilai: '', polaLabelLegenda: '{n} =',
  labelDiRingkasan: false,
  level: {
    1: { label: 'Tidak Dapat/Tolak Total', zona: 'z1', legenda: D('Menolak, menangis, atau tidak dapat menyelesaikan gerakan') },
    2: { label: 'Dengan Bantuan Penuh', zona: 'z2', legenda: D('Dapat melakukan hanya dengan bantuan fisik dan instruksi terus menerus') },
    3: { label: 'Dengan Bimbingan Minimal', zona: 'z3', legenda: D('Dapat melakukan dengan instruksi verbal dan bantuan sesekali') },
    4: { label: 'Mandiri', zona: 'z4', legenda: D('Dapat melakukan gerakan secara mandiri dan tepat') },
  },
};

const SENSORI_TEKS = {
  baik: 'Sistem sudah terintegrasi dengan baik, respons adaptif dan terkendali.',
  cukup: 'Sistem cukup terintegrasi, namun masih menunjukkan beberapa kesulitan yang dapat dikompensasi.',
  kurang: 'Sistem kurang terintegrasi, kesulitan signifikan dan sering mengganggu aktivitas.',
  belum: 'Sistem belum terintegrasi, respons sangat ekstrem dan menghambat partisipasi.',
};

const REFLEKS_TEKS = {
  baik: 'Kontrol Baik. Pola gerakan yang benar sudah dapat dipertahankan. Gerakan refleks primitif masih mungkin muncul, tetapi tidak mendominasi dan tidak signifikan mengganggu performa.',
  cukup70: 'Kontrol Cukup. Pola gerakan yang benar mulai tampak, namun tubuh anak masih kesulitan menahannya secara konsisten. Gerakan refleks primitif masih sering muncul (sekitar 70%) dan mengganggu stabilitas gerak.',
  minimal30: 'Kontrol Minimal. Anak sangat minim dalam menahan tubuh untuk mempertahankan pola gerak yang benar. Gerakan refleks primitif mendominasi sebagian besar (sekitar 30%) dari pola gerak yang diharapkan.',
  cukup30: 'Kontrol Cukup. Pola gerakan yang benar mulai tampak, namun tubuh anak masih kesulitan menahannya secara konsisten. Gerakan refleks primitif masih sering muncul (sekitar 30%) dan mengganggu stabilitas gerak.',
  minimal70: 'Kontrol Minimal. Anak sangat minim dalam menahan tubuh untuk mempertahankan pola gerak yang benar. Gerakan refleks primitif mendominasi sebagian besar (sekitar 70%) dari pola gerak yang diharapkan.',
  tidakAda: 'Tidak Ada Kontrol. Gerakan refleks primitif mendominasi sepenuhnya (100%). Anak sama sekali tidak mampu mempertahankan posisi atau pola gerakan yang benar yang diminta, karena tubuhnya sepenuhnya dikendalikan oleh respons refleks.',
};

// --- SET B (default; owner's final decision: every scale 1–4, higher = more developed) ----------------------
export const SET_SKALA_B: SetSkala = {
  id: 'B',
  skala: {
    kegiatan: KEGIATAN,
    program: PROGRAM,
    sensori: {
      id: 'sensori', nama: 'Sistem Sensorik', min: 1, max: 4, arah: 'naik', awalanNilai: 'Bintang',
      polaLabelLegenda: 'Nilai Bintang {n}:', labelDiRingkasan: false,
      level: {
        4: { label: 'Terintegrasi Baik', kategori: 'terintegrasi dengan baik', zona: 'z4', legenda: D(SENSORI_TEKS.baik, 'dipetakan ulang: dokumen asli Bintang 1') },
        3: { label: 'Cukup Terintegrasi', kategori: 'cukup terintegrasi', zona: 'z3', legenda: D(SENSORI_TEKS.cukup, 'dipetakan ulang: dokumen asli Bintang 2') },
        2: { label: 'Kurang Terintegrasi', kategori: 'kurang terintegrasi', zona: 'z2', legenda: D(SENSORI_TEKS.kurang, 'dipetakan ulang: dokumen asli Bintang 3') },
        1: { label: 'Belum Terintegrasi', kategori: 'belum terintegrasi', zona: 'z1', legenda: D(SENSORI_TEKS.belum, 'dipetakan ulang: dokumen asli Bintang 4') },
      },
    },
    refleks: {
      id: 'refleks', nama: 'Refleks Primitif', min: 1, max: 4, arah: 'naik', awalanNilai: 'Nilai',
      polaLabelLegenda: 'Nilai {n}:', labelDiRingkasan: true,
      level: {
        4: { label: 'Kontrol Baik', zona: 'z4', legenda: D(REFLEKS_TEKS.baik, 'dipetakan ulang: dokumen asli Nilai 1') },
        3: { label: 'Kontrol Cukup', zona: 'z3', legenda: B(REFLEKS_TEKS.cukup30, 'teks dokumen asli Nilai 2 dengan persentase disesuaikan menjadi sekitar 30%') },
        2: { label: 'Kontrol Minimal', zona: 'z2', legenda: B(REFLEKS_TEKS.minimal70, 'teks dokumen asli Nilai 3 dengan persentase disesuaikan menjadi sekitar 70%') },
        1: { label: 'Tidak Ada Kontrol', zona: 'z1', legenda: D(REFLEKS_TEKS.tidakAda, 'dipetakan ulang: dokumen asli Nilai 4') },
      },
    },
  },
};

// --- SET A (directions, labels and legends exactly as in the original document; exported, not rendered) -----
export const SET_SKALA_A: SetSkala = {
  id: 'A',
  skala: {
    kegiatan: KEGIATAN,
    program: PROGRAM,
    sensori: {
      id: 'sensori', nama: 'Sistem Sensorik', min: 1, max: 4, arah: 'turun', awalanNilai: 'Bintang',
      polaLabelLegenda: 'Nilai Bintang {n}:', labelDiRingkasan: false,
      level: {
        1: { label: 'Terintegrasi Baik', kategori: 'terintegrasi dengan baik', zona: 'z4', legenda: D(SENSORI_TEKS.baik) },
        2: { label: 'Cukup Terintegrasi', kategori: 'cukup terintegrasi', zona: 'z3', legenda: D(SENSORI_TEKS.cukup) },
        3: { label: 'Kurang Terintegrasi', kategori: 'kurang terintegrasi', zona: 'z2', legenda: D(SENSORI_TEKS.kurang) },
        4: { label: 'Belum Terintegrasi', kategori: 'belum terintegrasi', zona: 'z1', legenda: D(SENSORI_TEKS.belum) },
      },
    },
    refleks: {
      id: 'refleks', nama: 'Refleks Primitif', min: 1, max: 4, arah: 'turun', awalanNilai: 'Nilai',
      polaLabelLegenda: 'Nilai {n}:', labelDiRingkasan: false,
      level: {
        1: { label: 'Kontrol Baik', zona: 'z4', legenda: D(REFLEKS_TEKS.baik) },
        2: { label: 'Kontrol Cukup', zona: 'z3', legenda: D(REFLEKS_TEKS.cukup70) },
        3: { label: 'Kontrol Minimal', zona: 'z2', legenda: D(REFLEKS_TEKS.minimal30) },
        4: { label: 'Tidak Ada Kontrol', zona: 'z1', legenda: D(REFLEKS_TEKS.tidakAda) },
      },
    },
  },
};

export const SET_SKALA_DEFAULT = SET_SKALA_B;

export function ambilSetSkala(id?: 'A' | 'B'): SetSkala {
  return id === 'A' ? SET_SKALA_A : SET_SKALA_B;
}

/**
 * Converts a value between the document convention (A) and the unified convention (B) for the reflex and
 * sensory scales: new = 5 − old (1↔4, 2↔3). It is its own inverse. Kegiatan and Program never need it.
 */
export const konversiArah = (v: Level): Level => (5 - v) as Level;

// --- derived helpers (used by generator, scoring and charts) -----------------------------------------------
/** The most developed value of the scale. */
export const terbaik = (s: DefinisiSkala): Level => (s.arah === 'naik' ? s.max : s.min);
/** The least developed value of the scale. */
export const terburuk = (s: DefinisiSkala): Level => (s.arah === 'naik' ? s.min : s.max);
/** Rank 1 = least developed … 4 = most developed, independent of direction. */
export const peringkat = (s: DefinisiSkala, v: Level): Level => (s.arah === 'naik' ? v : ((s.max + s.min - v) as Level));
/** Inverse of peringkat: the value that has the given rank. */
export const nilaiDariPeringkat = (s: DefinisiSkala, p: Level): Level => (s.arah === 'naik' ? p : ((s.max + s.min - p) as Level));
/** Positive = improvement in rank steps (under B: sesudah − sebelum). */
export const selisihPerbaikan = (s: DefinisiSkala, sebelum: Level, sesudah: Level): number => peringkat(s, sesudah) - peringkat(s, sebelum);
/** true when `sesudah` is more developed than `sebelum`. */
export const membaik = (s: DefinisiSkala, sebelum: Level, sesudah: Level): boolean => selisihPerbaikan(s, sebelum, sesudah) > 0;
export const adalahTerbaik = (s: DefinisiSkala, v: Level): boolean => v === terbaik(s);
/** The next more-developed value, or null at the best level. */
export const nilaiBerikutnya = (s: DefinisiSkala, v: Level): Level | null => {
  const p = peringkat(s, v);
  return p >= 4 ? null : nilaiDariPeringkat(s, (p + 1) as Level);
};
/** The word that describes an improvement in value terms: 'peningkatan' (naik) or 'penurunan' (turun). */
export const kataArah = (s: DefinisiSkala): string => (s.arah === 'naik' ? 'peningkatan' : 'penurunan');
/** 0–100 normalised item score (§7). */
export const skorItem = (s: DefinisiSkala, v: Level): number =>
  s.arah === 'naik' ? ((v - s.min) / (s.max - s.min)) * 100 : ((s.max - v) / (s.max - s.min)) * 100;
export const labelLevel = (s: DefinisiSkala, v: Level): string => s.level[v].label;
export const zonaLevel = (s: DefinisiSkala, v: Level): Zona => s.level[v].zona;
/** Values ordered from least to most developed (chart axis order: left→right / bottom→top). */
export const urutanSumbu = (s: DefinisiSkala): Level[] => [...LEVELS].sort((a, b) => peringkat(s, a) - peringkat(s, b));
/** Legend label for a value, e.g. 'Nilai Bintang 4:'. */
export const labelLegenda = (s: DefinisiSkala, v: Level): string => s.polaLabelLegenda.replace('{n}', String(v));
/** Legend order for display: most developed first. */
export const urutanLegenda = (s: DefinisiSkala): Level[] => urutanSumbu(s).reverse();
/** true when every scale of the set reads 'higher = more developed'. */
export const semuaNaik = (set: SetSkala): boolean => Object.values(set.skala).every((s) => s.arah === 'naik');
