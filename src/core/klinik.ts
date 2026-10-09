// Clinic profile (D5): committed clinic configuration, not child data. Signature IMAGES are never stored here;
// they are passed in at render time.

export type KunciPenandatangan = 'fisioterapis' | 'terapis';

export interface Penandatangan {
  kunci: KunciPenandatangan;
  nama: string;
  peran: string;
  str?: string;
}

export interface ProfilKlinik {
  nama: string;
  alamat: string;
  kontak: { wa: string; ig: string };
  /** Always both signatories, in this order (left, right). */
  penandatangan: readonly [Penandatangan, Penandatangan];
  aplikasi: string;
}

export const KLINIK: ProfilKlinik = {
  nama: 'Hydro Neuroforge Center',
  alamat: 'Kompleks Danau Bogor Raya No. 16143, Katulampa, Kec. Bogor Timur, Kota Bogor, Jawa Barat 16144',
  kontak: { wa: '0881-0802-19722', ig: '@hydro.neuroforge' },
  penandatangan: [
    { kunci: 'fisioterapis', nama: 'Prasasti, A.Md.Ft', peran: 'Fisioterapis', str: 'XP00001130422308' },
    { kunci: 'terapis', nama: 'Syaif Rahid Safauzan, C.HydroT', peran: 'Terapis Hydrotherapy' },
  ],
  aplikasi: 'HNC Evaluasi',
};

/** The single, subtle contact line at the bottom of Lembar Pengesahan (D6). */
export const kalimatKontak = (k: ProfilKlinik = KLINIK): string =>
  `Untuk pertanyaan terkait laporan ini: WA ${k.kontak.wa} · IG ${k.kontak.ig}`;
