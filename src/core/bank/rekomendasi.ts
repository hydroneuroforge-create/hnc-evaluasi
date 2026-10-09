// Recommendation library with trigger rules (PLAN.md §6.3). Rendered as '**{judul}:** {teks}'.
// Default selection: every triggered entry, sorted by `prioritas`, capped at opsi.maksRekomendasi (5).
import type { Syarat } from '../syarat.ts';
import type { TeksBank } from '../types.ts';

const D = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'DOKUMEN', ...(catatan ? { catatan } : {}) });
const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export interface Rekomendasi {
  id: string;
  judul: string;
  teks: TeksBank;
  /** Short line for the Ringkasan page ('Fokus Berikutnya'). */
  ringkas: TeksBank;
  syarat: Syarat;
  prioritas: number;
  sumber: 'DOKUMEN' | 'BARU';
}

export const MAKS_REKOMENDASI_BAWAAN = 5;

const sensoriBelum: Syarat = { salahSatu: [{ belumTerbaik: 'sensori:vestibular' }, { belumTerbaik: 'sensori:taktil' }, { belumTerbaik: 'sensori:proprioseptif' }] };

export const REKOMENDASI: readonly Rekomendasi[] = [
  { id: 'optimalisasiSensorik', judul: 'Optimalisasi Sistem Sensorik', prioritas: 1, sumber: 'DOKUMEN',
    teks: D('Mempertahankan dan mengoptimalkan integrasi sistem sensorik yang telah mencapai Bintang {bintangTerbaikSesudah}, serta terus menstimulasi aspek-aspek yang masih memerlukan penguatan.', '{bintangTerbaikSesudah} = bintang terbaik pada evaluasi lanjutan'),
    ringkas: B('Menjaga dan mengoptimalkan integrasi sistem sensorik.'),
    syarat: sensoriBelum },
  { id: 'penguatanMotorik', judul: 'Penguatan Motorik', prioritas: 2, sumber: 'DOKUMEN',
    teks: D('Melanjutkan penguatan otot inti (core muscle) yang telah menunjukkan kemajuan signifikan[[, serta meningkatkan keseimbangan kekuatan dan stabilitas kaki {motorikKaki.sisiLemah}]].'),
    ringkas: B('Melanjutkan penguatan otot inti dan kekuatan kaki.'),
    syarat: { salahSatu: [{ belumTerbaik: 'kegiatan:ototInti' }, { belumTerbaik: 'kegiatan:motorikKaki' }] } },
  { id: 'koordinasiBilateral', judul: 'Pengembangan Koordinasi Bilateral', prioritas: 3, sumber: 'DOKUMEN',
    teks: D('Meningkatkan koordinasi kedua sisi tubuh, terutama pada gerakan kaki bergantian dan koordinasi bahu.'),
    ringkas: B('Melatih koordinasi kedua sisi tubuh.'),
    syarat: { salahSatu: [{ belumTerbaik: 'kegiatan:motorikKaki' }, { belumTerbaik: 'kegiatan:bahu' }, { belumTerbaik: 'kegiatan:kakiAyun' }] } },
  { id: 'kontakMata', judul: 'Konsistensi Kontak Mata', prioritas: 4, sumber: 'DOKUMEN',
    teks: D('Memberikan stimulasi lanjutan untuk meningkatkan frekuensi, durasi, dan konsistensi kontak mata.'),
    ringkas: B('Meningkatkan konsistensi kontak mata.'),
    syarat: { belumTerbaik: 'kegiatan:eyeContact' } },
  { id: 'regulasiEmosi', judul: 'Regulasi Emosi dan Kepatuhan', prioritas: 5, sumber: 'DOKUMEN',
    teks: D('Membangun rasa percaya dan keterlibatan dengan terapis, serta meningkatkan kemampuan mengikuti instruksi secara konsisten tanpa respons penolakan di awal.'),
    ringkas: B('Membangun regulasi emosi dan kepatuhan terhadap instruksi.'),
    syarat: { belumTerbaik: 'kegiatan:responEkspresi' } },
  { id: 'kontrolPernapasan', judul: 'Kontrol Pernapasan', prioritas: 6, sumber: 'BARU',
    teks: B('Melatih kontrol pernapasan melalui aktivitas meniup gelembung dan memasukkan wajah ke dalam air secara bertahap, sebagai persiapan koordinasi napas saat berenang.'),
    ringkas: B('Melatih kontrol pernapasan di air.'),
    syarat: { salahSatu: [{ belumTerbaik: 'program:b1.mouthIn' }, { belumTerbaik: 'program:b1.faceIn' }] } },
  { id: 'toleransiSensorikAir', judul: 'Toleransi Sensorik terhadap Air', prioritas: 7, sumber: 'BARU',
    teks: B('Meningkatkan toleransi terhadap percikan, suhu, dan sentuhan air agar Ananda semakin nyaman dan aman selama beraktivitas di kolam.'),
    ringkas: B('Meningkatkan kenyamanan terhadap sentuhan dan suhu air.'),
    syarat: { salahSatu: [
      { belumTerbaik: 'program:b1.feelingWater' }, { belumTerbaik: 'program:b1.mouthIn' }, { belumTerbaik: 'program:b1.faceIn' },
      { belumTerbaik: 'program:b1.comfortSplashing' }, { belumTerbaik: 'program:b1.toleranceTemperature' }, { belumTerbaik: 'sensori:taktil' },
    ] } },
  { id: 'kekuatanLeherKontrolKepala', judul: 'Kekuatan Leher dan Kontrol Kepala', prioritas: 8, sumber: 'BARU',
    teks: B('Memperkuat otot leher dan punggung untuk meningkatkan kontrol kepala, terutama pada posisi tengkurap dan saat mengatur napas di air.'),
    ringkas: B('Memperkuat leher dan kontrol kepala.'),
    syarat: { salahSatu: [{ belumTerbaik: 'kegiatan:kekuatanLeher' }, { belumTerbaik: 'program:b2.liftHead' }] } },
  { id: 'keseimbanganPostur', judul: 'Keseimbangan dan Postur', prioritas: 9, sumber: 'BARU',
    teks: B('Melatih keseimbangan dan postur tubuh melalui aktivitas yang menantang stabilitas, agar Ananda semakin percaya diri bergerak di dalam maupun di luar air.'),
    ringkas: B('Melatih keseimbangan dan postur tubuh.'),
    syarat: { salahSatu: [{ belumTerbaik: 'sensori:vestibular' }, { belumTerbaik: 'kegiatan:posturTulangBelakang' }] } },
  { id: 'kemandirianAir', judul: 'Kemandirian di Air', prioritas: 10, sumber: 'BARU',
    teks: B('Mendorong kemandirian Ananda dalam aktivitas mengapung dan bergerak di air, dengan mengurangi bantuan secara bertahap sesuai kesiapannya.'),
    ringkas: B('Mendorong kemandirian saat mengapung dan bergerak di air.'),
    syarat: { belumTerbaik: 'kegiatan:backFloating' } },
];

export const rekomendasiDef = (id: string): Rekomendasi | undefined => REKOMENDASI.find((r) => r.id === id);
