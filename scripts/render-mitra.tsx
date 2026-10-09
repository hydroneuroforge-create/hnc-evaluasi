// Partner-logo (YASI) renders with FICTITIOUS data (scripts/lib/contoh-fiktif.ts): report + both certificate variants,
// without (-tanpa) and with (-yasi) anak.mitraYasi, rasterised for viewing (all < 2000 px per side), plus core
// assertions. Compare with scripts/cek-mitra.py. --tanpa-mitra-saja renders only the -tanpa files and skips the
// assertions (so it also runs on a commit without the feature, for the before/after comparison).
// Usage: tsx scripts/render-mitra.tsx [--keluaran /tmp/hnc-mitra] [--tanpa-mitra-saja]
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { renderSertifikatPdf } from '../src/certificate/index.ts';
import { siapkanLaporan, siapkanSertifikat, validasiInput } from '../src/core/index.ts';
import { renderLaporanPdf } from '../src/report/index.ts';
import { bacaAset } from './lib/aset-node.ts';
import { buatContohFiktif } from './lib/contoh-fiktif.ts';
import { DIR_REPO } from './lib/jalur.ts';

const arg = process.argv.slice(2);
const iKeluaran = arg.indexOf('--keluaran');
const DIR = resolve(iKeluaran >= 0 ? arg[iKeluaran + 1]! : '/tmp/hnc-mitra');
const tanpaSaja = arg.includes('--tanpa-mitra-saja');
mkdirSync(DIR, { recursive: true });

function jalankan(perintah: string, args: string[]): void {
  const env = { ...process.env };
  delete env.NODE_OPTIONS;
  const r = spawnSync(perintah, args, { cwd: DIR_REPO, stdio: 'inherit', env });
  if (r.status !== 0) {
    console.error(`render-mitra: gagal menjalankan ${perintah} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
}

const aset = bacaAset({ ttd: false });
for (const [akhiran, yasi] of (tanpaSaja ? [['tanpa', false]] : [['tanpa', false], ['yasi', true]]) as [string, boolean][]) {
  const input = buatContohFiktif({ yasi });
  const laporan = join(DIR, `laporan-${akhiran}.pdf`);
  writeFileSync(laporan, await renderLaporanPdf(siapkanLaporan(input), aset));
  jalankan('python3', ['scripts/rasterize.py', laporan, join(DIR, `laporan-${akhiran}`), '--dpi', '120', '--prefix', 'halaman-', '--rapikan']);
  const sertifikat = siapkanSertifikat(input);
  for (const varian of ['a4', 'sosial'] as const) {
    const pdf = join(DIR, `sertifikat-${varian}-${akhiran}.pdf`);
    writeFileSync(pdf, await renderSertifikatPdf(sertifikat, aset, { varian }));
    const png = join(DIR, `sertifikat-${varian}-${akhiran}.png`);
    jalankan('python3', ['scripts/rasterize.py', pdf, png, ...(varian === 'a4' ? ['--dpi', '120'] : ['--zoom', '2']), '--page', '1']);
  }
  console.log(`render-mitra: ${akhiran} -> ${DIR}`);
}

if (!tanpaSaja) {
  const gagal: string[] = [];
  const cek = (ok: boolean, pesan: string) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${pesan}`); if (!ok) gagal.push(pesan); };
  const lap = (yasi: boolean) => siapkanLaporan(buatContohFiktif({ yasi })) as unknown as { mitraYasi: unknown };
  const ser = (yasi: boolean) => siapkanSertifikat(buatContohFiktif({ yasi })) as unknown as { mitraYasi: unknown };
  cek(lap(false).mitraYasi === false && lap(true).mitraYasi === true, 'LaporanSiap.mitraYasi mengikuti anak.mitraYasi');
  cek(ser(false).mitraYasi === false && ser(true).mitraYasi === true, 'SertifikatSiap.mitraYasi mengikuti anak.mitraYasi');
  const salah = buatContohFiktif();
  (salah.anak as unknown as Record<string, unknown>).mitraYasi = 'ya';
  cek(validasiInput(salah).includes('anak.mitraYasi harus true atau false'), 'validasi menolak anak.mitraYasi = "ya"');
  cek(validasiInput(buatContohFiktif({ yasi: true })).length === 0, 'validasi menerima anak.mitraYasi = true');
  const { RASIO_LOGO_YASI } = (await import('../src/report/components/LogoKemitraan.tsx')) as { RASIO_LOGO_YASI: number };
  const png = readFileSync(join(DIR_REPO, 'assets', 'logo-yasi.png'));
  const rasio = png.readUInt32BE(16) / png.readUInt32BE(20);
  cek(Math.abs(RASIO_LOGO_YASI - rasio) < 0.01, `RASIO_LOGO_YASI ${RASIO_LOGO_YASI.toFixed(4)} = IHDR logo-yasi.png ${rasio.toFixed(4)}`);
  if (gagal.length) process.exit(1);
}
