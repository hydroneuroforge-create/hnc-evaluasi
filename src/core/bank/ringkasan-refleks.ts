// CNS 'Summary' bank (PLAN.md §6.3). Two paragraphs as in the DOCX, plus neutral sentences for unchanged/declined.
import type { TeksBank } from '../types.ts';

const D = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'DOKUMEN', ...(catatan ? { catatan } : {}) });
const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export const RINGKASAN_REFLEKS = {
  /** Reflexes at the best level at both evaluations. */
  tetapTerbaik: D('Sejak awal observasi, Ananda tidak menampilkan adanya refleks yang tertunda pada refleks {daftar}. Oleh karenanya, ketika awal dites nilainya {terbaik}[[ ({labelTerbaik})]], dan setelah melakukan sesi terapi nilainya tetap {terbaik}.', 'label tingkat terbaik disebut bila skala mengaturnya (Opsi B: "4 (Kontrol Baik)")'),
  /** Improved reflexes. */
  membaik: D('Setelah melakukan tes dan intervensi pada refleks Ananda, terjadi perkembangan menghilangnya refleks secara gradual {daftar}.', 'n ≥ 3: "i1, i2, …, dan i(n−1), serta i(n)"; n = 2: "i1 dan i2"'),
  item: D('pada refleks {nama} dari nilai {sebelum} menjadi nilai {sesudah}'),
  tetapBelum: B('Pada refleks {nama}, nilainya tetap {sesudah} pada kedua evaluasi dan akan menjadi fokus perhatian pada program berikutnya.'),
  memburuk: B('Pada refleks {nama}, nilainya tercatat {sebelum} pada evaluasi awal dan {sesudah} pada evaluasi lanjutan, sehingga akan menjadi perhatian dalam program berikutnya.'),
};

/** The document's list joining for P2: 'i1, i2, …, dan i(n−1), serta i(n)'. */
export function gabungDaftarRingkasan(xs: string[]): string {
  if (xs.length <= 1) return xs[0] ?? '';
  if (xs.length === 2) return `${xs[0]} dan ${xs[1]}`;
  return `${xs.slice(0, -2).join(', ')}, dan ${xs[xs.length - 2]}, serta ${xs[xs.length - 1]}`;
}
