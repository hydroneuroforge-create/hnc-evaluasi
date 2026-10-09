// Browser-safety check (D3, limited per brief §13 to a quick check):
// 1. esbuild bundles scripts/browser/entry.tsx for the browser (platform=browser, format=esm, target=safari16)
//    and the bundle must not pull in any Node built-in;
// 2. if headless Chromium (@sparticuz/chromium) starts, the bundle is served from http://cek.lokal/ via request
//    interception, every other non-data:/blob: request is aborted and counted, and the report is rendered in
//    the page with the input + assets passed in at runtime. Asserts %PDF, pages >= 10 and blocked = [].
// --fiktif: render the fictitious YASI-partner sample (scripts/lib/contoh-fiktif.ts) instead of the private data.
// Output goes to node_modules/.cache/hnc-cek-browser/ (never committed). Full device testing is Phase 2.
import { builtinModules } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import { bacaAset } from './lib/aset-node.ts';
import { buatContohFiktif } from './lib/contoh-fiktif.ts';
import { bacaDataAnak } from './lib/data-privat.ts';
import { DIR_REPO } from './lib/jalur.ts';

const DIR = join(DIR_REPO, 'node_modules', '.cache', 'hnc-cek-browser');
mkdirSync(DIR, { recursive: true });
const BUNDLE = join(DIR, 'bundle.js');
/** R8: the 19-page browser report must stay at or under 1.5 MB. */
const BATAS_BYTES = 1.5 * 1024 * 1024;

const hasil = await build({
  entryPoints: [join(DIR_REPO, 'scripts', 'browser', 'entry.tsx')],
  bundle: true, platform: 'browser', format: 'esm', target: 'safari16', outfile: BUNDLE,
  metafile: true, logLevel: 'error', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
});
const nodeBawaan = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);
const masukan = Object.keys(hasil.metafile.inputs);
const impor = Object.values(hasil.metafile.inputs).flatMap((i) => i.imports.map((x) => x.path));
const nodeDipakai = [...new Set(impor.filter((p) => nodeBawaan.has(p)))];
const dariScripts = masukan.filter((p) => p.startsWith('scripts/') && !p.startsWith('scripts/browser/'));
const ukuran = readFileSync(BUNDLE).length;
console.log(`bundle: ${BUNDLE} (${(ukuran / 1024 / 1024).toFixed(2)} MB, ${masukan.length} modul)`);
if (nodeDipakai.length || dariScripts.length) {
  console.error(`GAGAL: bundle memakai modul Node ${JSON.stringify(nodeDipakai)} / skrip Node ${JSON.stringify(dariScripts)}`);
  process.exit(1);
}
console.log('bundle: tanpa modul bawaan Node — OK');

// Runtime check in headless Chromium (best effort; skipped when Chromium cannot start in this environment).
let browser: import('puppeteer-core').Browser | null = null;
try {
  const chromium = (await import('@sparticuz/chromium')).default;
  const puppeteer = (await import('puppeteer-core')).default;
  browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
} catch (e) {
  console.log(`chromium: tidak dapat dijalankan (${(e as Error).message.split('\n')[0]}); hanya pemeriksaan bundle — OK`);
  process.exit(0);
}

const blocked: string[] = [];
try {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  const js = readFileSync(BUNDLE, 'utf8');
  page.on('request', (r) => {
    const url = r.url();
    if (url === 'http://cek.lokal/') return void r.respond({ status: 200, contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><script type="module" src="/bundle.js"></script>' });
    if (url === 'http://cek.lokal/bundle.js') return void r.respond({ status: 200, contentType: 'text/javascript', body: js });
    if (url.startsWith('data:') || url.startsWith('blob:')) return void r.continue();
    blocked.push(url);
    return void r.abort();
  });
  page.on('pageerror', (e) => console.log(`pageerror: ${(e as Error).message}`));
  await page.goto('http://cek.lokal/', { waitUntil: 'load' });
  await page.waitForFunction('typeof globalThis.cekLaporan === "function"', { timeout: 30000 });
  const input = process.argv.includes('--fiktif') ? buatContohFiktif({ yasi: true }) : bacaDataAnak();
  const aset = bacaAset({ fontSebagaiDataUri: true });
  const r = await page.evaluate(
    (i, a) => (globalThis as unknown as { cekLaporan: (x: unknown, y: unknown) => Promise<{ ok: boolean; bytes: number; kepala: string; halaman: number; b64?: string; galat?: string }> }).cekLaporan(i, a),
    input as unknown as object, aset as unknown as object,
  );
  if (r.b64) writeFileSync(join(DIR, 'laporan-browser.pdf'), Buffer.from(r.b64, 'base64'));
  delete r.b64;
  writeFileSync(join(DIR, 'hasil.json'), JSON.stringify({ ...r, blocked }, null, 2));
  console.log(`chromium: ok=${r.ok} kepala=${r.kepala} halaman=${r.halaman} bytes=${r.bytes} blocked: ${JSON.stringify(blocked)}`);
  if (r.bytes > BATAS_BYTES) console.error(`GAGAL: PDF browser ${r.bytes} bytes > batas ${BATAS_BYTES} (R8)`);
  if (!r.ok || r.kepala !== '%PDF-' || r.halaman < 10 || blocked.length || r.bytes > BATAS_BYTES) {
    if (r.galat) console.error(r.galat);
    console.error('GAGAL: pemeriksaan browser');
    process.exitCode = 1;
  } else {
    console.log('OK');
  }
} finally {
  await browser.close();
}
