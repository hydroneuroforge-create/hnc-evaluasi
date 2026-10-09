// Sample flow (PLAN.md §9): siapkanLaporan(data referensi) -> fidelity check -> review doc -> report PDF -> previews
// -> certificate (A4 PDF + social PNG) -> cek-output.py. Everything is written to /projects/sandbox/_referensi/output (outside the repo). It only
// overwrites its own files and never deletes anything (review.json is left untouched).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderSertifikatPdf } from '../src/certificate/index.ts';
import { siapkanLaporan, siapkanSertifikat } from '../src/core/index.ts';
import { renderLaporanPdf } from '../src/report/index.ts';
import { bacaAset } from './lib/aset-node.ts';
import { bacaDataAnak } from './lib/data-privat.ts';
import { DIR_OUTPUT, DIR_REPO } from './lib/jalur.ts';

export const BERKAS_LAPORAN = join(DIR_OUTPUT, 'contoh-laporan.pdf');
export const DIR_PREVIEW = join(DIR_OUTPUT, 'preview');
export const BERKAS_SERTIFIKAT = join(DIR_OUTPUT, 'contoh-sertifikat.pdf');
export const BERKAS_SERTIFIKAT_PNG = join(DIR_OUTPUT, 'contoh-sertifikat.png');
const BERKAS_SERTIFIKAT_SOSIAL = join(DIR_PREVIEW, 'sertifikat-sosial.pdf');

function jalankan(perintah: string, args: string[]): void {
  const env = { ...process.env };
  delete env.NODE_OPTIONS;
  const r = spawnSync(perintah, args, { cwd: DIR_REPO, stdio: 'inherit', env });
  if (r.status !== 0) {
    console.error(`render-sample: gagal menjalankan ${perintah} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
}

const tsx = join(DIR_REPO, 'node_modules', '.bin', 'tsx');

// 1. view model (strict: validation errors and name-guard hits throw)
const siap = siapkanLaporan(bacaDataAnak());
if (siap.asumsi.length) console.log(`asumsi (tidak dicetak): ${siap.asumsi.join(' | ')}`);

// 2. fidelity check + 3. review document
jalankan(tsx, ['scripts/cek-fidelitas.ts']);
jalankan(tsx, ['scripts/tulis-draf-bank-kalimat.ts']);

// 4. report PDF
mkdirSync(DIR_PREVIEW, { recursive: true });
const t0 = Date.now();
const bytes = await renderLaporanPdf(siap, bacaAset());
writeFileSync(BERKAS_LAPORAN, bytes);
console.log(`laporan: ${BERKAS_LAPORAN} (${(bytes.length / 1024).toFixed(0)} kB, ${Date.now() - t0} ms)`);

// 5. previews (120 dpi); only its own stale halaman-NN.png beyond the new page count are removed
jalankan('python3', ['scripts/rasterize.py', BERKAS_LAPORAN, DIR_PREVIEW, '--dpi', '120', '--prefix', 'halaman-', '--rapikan']);

// 5b. certificate: A4 landscape PDF (+ preview) and the social variant (540×675 pt) rasterised to 1080×1350 px.
// The social PDF is an intermediate file kept in preview/.
const sertifikat = siapkanSertifikat(bacaDataAnak());
const asetSertifikat = bacaAset();
const t1 = Date.now();
const bytesA4 = await renderSertifikatPdf(sertifikat, asetSertifikat, { varian: 'a4' });
writeFileSync(BERKAS_SERTIFIKAT, bytesA4);
const bytesSosial = await renderSertifikatPdf(sertifikat, asetSertifikat, { varian: 'sosial' });
writeFileSync(BERKAS_SERTIFIKAT_SOSIAL, bytesSosial);
console.log(`sertifikat: ${BERKAS_SERTIFIKAT} (${(bytesA4.length / 1024).toFixed(0)} kB, ${Date.now() - t1} ms)`);
jalankan('python3', ['scripts/rasterize.py', BERKAS_SERTIFIKAT, join(DIR_PREVIEW, 'sertifikat-a4.png'), '--dpi', '120', '--page', '1']);
jalankan('python3', ['scripts/rasterize.py', BERKAS_SERTIFIKAT_SOSIAL, BERKAS_SERTIFIKAT_PNG, '--zoom', '2', '--page', '1']);

// 6. output checks
if (!existsSync(join(DIR_OUTPUT, 'review.json'))) console.log('catatan: review.json belum ada (ditulis oleh reviewer).');
if (!process.argv.includes('--tanpa-cek')) jalankan('python3', ['scripts/cek-output.py']);
