// Default absolute paths of the private material (outside the repo). Env overrides: HNC_DATA (directory with the
// child data + oracle), HNC_OUTPUT (output directory), HNC_TTD (signature directory).
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIR_REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIR_REFERENSI = '/projects/sandbox/_referensi';
export const DIR_DATA = process.env.HNC_DATA ?? join(DIR_REFERENSI, 'data');
export const DIR_OUTPUT = process.env.HNC_OUTPUT ?? join(DIR_REFERENSI, 'output');
export const DIR_TTD = process.env.HNC_TTD ?? join(DIR_REFERENSI, 'ttd');

/** Reference child input (private). */
export const BERKAS_DATA_ANAK = join(DIR_DATA, 'referensi.json');
/** Fidelity oracle (private). */
export const BERKAS_ORACLE = join(DIR_DATA, 'referensi-teks-sumber.json');

export const BERKAS_CEK_FIDELITAS = join(DIR_OUTPUT, 'cek-fidelitas.md');
export const BERKAS_DRAF = join(DIR_OUTPUT, 'draf-bank-kalimat.md');

/** Activation code (private; written once by scripts/buat-aktivasi.ts). */
export const BERKAS_KODE_AKTIVASI = join(DIR_REFERENSI, 'kode-aktivasi.txt');
