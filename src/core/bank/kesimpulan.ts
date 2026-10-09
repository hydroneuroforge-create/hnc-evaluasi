// Kesimpulan openers and 'kondisi awal' sentences (PLAN.md §6.3).
import type { TeksBank } from '../types.ts';

const D = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'DOKUMEN', ...(catatan ? { catatan } : {}) });
const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export type KategoriPerkembangan = 'signifikan' | 'berarti' | 'bertahap' | 'stabil';

/** Thresholds on the rounded overall Δ (points): ≥ signifikan, ≥ berarti, ≥ bertahap, else 'stabil'. */
export const AMBANG_KATEGORI = { signifikan: 25, berarti: 10, bertahap: 1 } as const;

export function kategoriDari(selisih: number | null): KategoriPerkembangan {
  if (selisih === null) return 'stabil';
  if (selisih >= AMBANG_KATEGORI.signifikan) return 'signifikan';
  if (selisih >= AMBANG_KATEGORI.berarti) return 'berarti';
  if (selisih >= AMBANG_KATEGORI.bertahap) return 'bertahap';
  return 'stabil';
}

/** Phrase after 'perkembangan'. */
export const FRASA_KATEGORI: Record<Exclude<KategoriPerkembangan, 'stabil'>, string> = {
  signifikan: 'yang signifikan',
  berarti: 'yang berarti',
  bertahap: 'bertahap',
};

export const KESIMPULAN = {
  p1: D('{anandaLengkap} menunjukkan **perkembangan {kategori}** selama menjalani sesi hydrotherapy.', '{kategori}: Δ ≥ 25 "yang signifikan"; 10–24 "yang berarti"; 1–9 "bertahap"'),
  p1Stabil: B('{anandaLengkap} menunjukkan **kondisi yang relatif stabil** selama menjalani sesi hydrotherapy.', 'dipakai bila Δ skor keseluruhan ≤ 0'),
  p2: D('{anandaPanggilan} menunjukkan **kemajuan yang berarti** dalam perjalanan terapinya. Perkembangan paling menonjol terlihat pada:', 'kategori "yang signifikan" dan "yang berarti"'),
  p2Bertahap: B('{anandaPanggilan} menunjukkan **kemajuan bertahap** dalam perjalanan terapinya. Perkembangan paling menonjol terlihat pada:'),
  p2Stabil: B('{anandaPanggilan} tetap menunjukkan **keterlibatan yang baik** dalam perjalanan terapinya. Hal-hal yang patut diapresiasi antara lain:'),
  p3: D('Berdasarkan hasil evaluasi, rekomendasi fokus terapi untuk {anandaPanggilan} adalah sebagai berikut:'),
};

export interface KondisiAwal { id: string; label: string; teks: TeksBank }

export const KONDISI_AWAL: readonly KondisiAwal[] = [
  { id: 'semangatAir', label: 'Datang penuh semangat terhadap air',
    teks: D('Ananda datang dengan kondisi penuh semangat dan motivasi yang kuat terhadap air, yang merupakan modal positif untuk menjalani terapi. Motivasi tinggi ini perlu terus dijaga dan diarahkan untuk mencapai terapi yang optimal.') },
  { id: 'adaptasiBertahap', label: 'Memerlukan waktu beradaptasi dengan air',
    teks: B('Pada awal program, Ananda memerlukan waktu untuk beradaptasi dengan lingkungan kolam, dan secara bertahap mulai merasa aman serta nyaman di dalam air.') },
  { id: 'kooperatif', label: 'Kooperatif sejak awal',
    teks: B('Sejak awal, Ananda menunjukkan sikap yang kooperatif terhadap terapis, yang menjadi dasar yang baik bagi kelancaran setiap sesi terapi.') },
  { id: 'dukunganKeluarga', label: 'Dukungan keluarga yang konsisten',
    teks: B('Dukungan dan keterlibatan orang tua yang konsisten turut menjadi faktor penting dalam perkembangan yang dicapai Ananda.') },
];
