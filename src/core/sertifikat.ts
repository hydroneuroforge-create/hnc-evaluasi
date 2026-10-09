// siapkanSertifikat(input) -> SertifikatSiap: everything the certificate renderer prints (D8).
// No photo, slogan, CTA or numbers; both signatories; only a tiny IG handle as clinic contact.
import { KLINIK, type Penandatangan } from './klinik.ts';
import { periksaNama, tokenNama } from './nama.ts';
import { formatTanggal } from './tanggal.ts';
import { buatParagraf, isiTemplat } from './teks.ts';
import type { LaporanInput, Paragraf } from './types.ts';

export interface SertifikatSiap {
  judul: string;
  judulInggris: string;
  diberikanKepada: string;
  /** 'Ananda <namaLengkap>' */
  nama: string;
  /** 'atas keberhasilannya <pencapaian>' (markup -> runs). */
  pencapaian: Paragraf;
  tempatTanggal: string;
  penandatangan: readonly Penandatangan[];
  klinik: { nama: string; ig: string };
  /** Logo mitra YASI di samping logo HNC. */
  mitraYasi: boolean;
  meta: { judul: string; penulis: string; pembuat: string; bahasa: 'id' };
}

export const TEKS_SERTIFIKAT = {
  judul: 'Sertifikat Pencapaian',
  judulInggris: 'Certificate of Achievement',
  diberikanKepada: 'diberikan kepada',
  pencapaian: 'atas keberhasilannya {pencapaian}',
};

export function siapkanSertifikat(input: LaporanInput): SertifikatSiap {
  const s = input.sertifikat;
  if (!s) throw new Error('sertifikat: data pencapaian belum diisi (input.sertifikat)');
  const KL = input.klinik ?? KLINIK;
  const nama = tokenNama(input.anak);
  const isiPencapaian = isiTemplat('sertifikat.pencapaian', s.pencapaian, { token: { ...nama } });
  const markup = isiTemplat('sertifikat', TEKS_SERTIFIKAT.pencapaian, { token: { pencapaian: isiPencapaian } });
  const temuan = periksaNama(markup, input.anak);
  if (temuan.length) throw new Error(`sertifikat: nama tidak dikenal "Ananda ${temuan[0]!.kata}"`);
  return {
    judul: TEKS_SERTIFIKAT.judul,
    judulInggris: TEKS_SERTIFIKAT.judulInggris,
    diberikanKepada: TEKS_SERTIFIKAT.diberikanKepada,
    nama: nama.anandaLengkap,
    pencapaian: buatParagraf('sertifikat.pencapaian', markup, 'INPUT'),
    tempatTanggal: `${s.tempat}, ${formatTanggal(s.tanggal)}`,
    penandatangan: KL.penandatangan,
    klinik: { nama: KL.nama, ig: KL.kontak.ig },
    mitraYasi: input.anak.mitraYasi === true,
    meta: { judul: `${TEKS_SERTIFIKAT.judul} – ${input.anak.namaLengkap}`, penulis: KL.nama, pembuat: KL.aplikasi, bahasa: 'id' },
  };
}
