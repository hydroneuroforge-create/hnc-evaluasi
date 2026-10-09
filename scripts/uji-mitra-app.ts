// Walkthrough of the built PWA (dist/) for the optional YASI partner logo, with a FICTITIOUS child and WITHOUT the
// private activation code (activation is skipped). PIN -> child with "Peserta dari Yayasan Anak Spesial Indonesia"
// ticked -> reload: flag persisted -> Evaluasi Awal + Lanjutan -> report PDF + both certificates: one extra image
// (the YASI logo) on cover + approval page / certificate -> untick -> the saved report re-renders without it.
// Screenshots + PDFs go to HNC_LAYAR (default /tmp/hnc-mitra/app). Run `npm run build` first.
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { DIR_REPO } from './lib/jalur.ts';

const DIST = join(DIR_REPO, 'dist');
const OUT = process.env.HNC_LAYAR ?? '/tmp/hnc-mitra/app';
const UNDUH = join(OUT, 'unduhan');
rmSync(UNDUH, { recursive: true, force: true });
mkdirSync(UNDUH, { recursive: true });
const BASE = '/hnc-evaluasi/';
const PORT = 4174;
const URL_APP = `http://127.0.0.1:${PORT}${BASE}`;
const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };

const server = createServer((req, res) => {
  const p = decodeURIComponent((req.url ?? '/').split('?')[0]!);
  if (!p.startsWith(BASE)) { res.writeHead(404).end(); return; }
  let f = join(DIST, p.slice(BASE.length) || 'index.html');
  if (!existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-cache' }).end(readFileSync(f));
});
await new Promise<void>((ok) => server.listen(PORT, '127.0.0.1', ok));

const chromium = (await import('@sparticuz/chromium')).default;
const { default: puppeteer, KnownDevices } = await import('puppeteer-core');
const browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
const gagal: string[] = [];
let jumlahOk = 0;
const cek = (ok: boolean, pesan: string) => { if (ok) jumlahOk++; else gagal.push(pesan); console.log(`${ok ? 'OK  ' : 'GAGAL'} ${pesan}`); };
const tunggu = (ms: number) => new Promise((r) => setTimeout(r, ms));

const page = await browser.newPage();
await page.emulate(KnownDevices['iPhone 15']);
const cdp = await page.createCDPSession();
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: UNDUH });
const luar: string[] = [];
const galatHalaman: string[] = [];
page.on('request', (r) => { const u = r.url(); if (!u.startsWith(`http://127.0.0.1:${PORT}/`) && !/^(data|blob):/.test(u)) luar.push(u); });
page.on('pageerror', (e) => galatHalaman.push(String((e as Error).message ?? e)));
page.on('console', (m) => { if (m.type() === 'error') galatHalaman.push(m.text()); });
page.on('dialog', (d) => void d.accept());

let nomorLayar = 0;
const layar = async (nama: string) => { await tunggu(300); await page.screenshot({ path: join(OUT, `${String(++nomorLayar).padStart(2, '0')}-${nama}.png`) }); };
const klik = async (teks: string, opsi: { persis?: boolean; indeks?: number } = {}) => {
  await page.waitForFunction((t, persis) => [...document.querySelectorAll('button, summary')].some((b) => (persis ? b.textContent?.trim() === t : b.textContent?.includes(t)) && !(b as HTMLButtonElement).disabled), { timeout: 20000 }, teks, !!opsi.persis);
  await page.evaluate((t, persis, i) => {
    const xs = [...document.querySelectorAll('button, summary')].filter((b) => (persis ? b.textContent?.trim() === t : b.textContent?.includes(t)) && !(b as HTMLButtonElement).disabled);
    (xs[i] as HTMLElement).click();
  }, teks, !!opsi.persis, opsi.indeks ?? 0);
  await tunggu(150);
};
const isi = async (label: string, nilai: string) => {
  await page.waitForFunction((l) => [...document.querySelectorAll('label')].some((x) => x.querySelector('.label')?.textContent?.trim() === l), { timeout: 15000 }, label);
  await page.evaluate((l, v) => {
    const lab = [...document.querySelectorAll('label')].find((x) => x.querySelector('.label')?.textContent?.trim() === l)!;
    const el = lab.querySelector('input, textarea') as HTMLInputElement;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, label, nilai);
  await tunggu(80);
};
const pin = async (p: string) => { await page.waitForSelector('button[aria-label="1"]'); for (const d of p) { await page.click(`button[aria-label="${d}"]`); await tunggu(40); } await tunggu(900); };
const ada = (teks: string, ms = 20000) => page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: ms }, teks).then(() => true, () => false);
const nilaiKartu = async (pilih: (i: number) => number) => {
  const n = await page.evaluate(() => document.querySelectorAll('main section.kartu .grid').length);
  for (let i = 0; i < n; i++) {
    await page.evaluate((i, j) => { const g = document.querySelectorAll('main section.kartu .grid')[i]!; (g.querySelectorAll('button')[j] as HTMLElement | undefined)?.click(); }, i, pilih(i));
    await tunggu(60);
  }
};
const KOTAK = 'Peserta dari Yayasan Anak Spesial Indonesia';
const kotakYasi = () => page.evaluate((t) => {
  const l = [...document.querySelectorAll('label')].find((x) => x.textContent?.includes(t));
  return (l?.querySelector('input[type=checkbox]') as HTMLInputElement | null)?.checked ?? null;
}, KOTAK);
const klikKotakYasi = () => page.evaluate((t) => {
  ([...document.querySelectorAll('label')].find((x) => x.textContent?.includes(t))!.querySelector('input[type=checkbox]') as HTMLElement).click();
}, KOTAK);
const unduhanBaru = async (sebelum: string[], ms = 90000): Promise<string | null> => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const baru = readdirSync(UNDUH).filter((f) => !sebelum.includes(f) && !f.endsWith('.crdownload'));
    if (baru.length) { await tunggu(300); return join(UNDUH, baru[0]!); }
    await tunggu(300);
  }
  return null;
};
/** Image count per page (PyMuPDF). */
const gambarPdf = (f: string): number[] => {
  const env = { ...process.env };
  delete env.NODE_OPTIONS;
  const r = spawnSync('python3', ['-c', 'import sys,json,fitz;d=fitz.open(sys.argv[1]);print(json.dumps([len(p.get_images()) for p in d]))', f], { encoding: 'utf8', env });
  return JSON.parse(r.stdout || '[]') as number[];
};
const ganti = (f: string, nama: string) => { const t = join(UNDUH, nama); spawnSync('mv', [f, t]); return t; };
const unduhLaporan = async (tombol: string, nama: string): Promise<number[]> => {
  await klik(tombol);
  await page.waitForSelector('[data-pdf-bytes]', { timeout: 120000 });
  const sebelum = readdirSync(UNDUH);
  await klik('Buka / Unduh');
  const f = await unduhanBaru(sebelum);
  return f ? gambarPdf(ganti(f, nama)) : [];
};
const unduhSertifikat = async (v: string, nama: string): Promise<number[]> => {
  await klik(v); // sets "Membuat…" synchronously; wait until it is gone and the result buttons are there
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].some((b) => b.textContent === 'Membuat…')
    && [...document.querySelectorAll('button')].some((b) => b.textContent === 'Bagikan' && b.closest('section')?.textContent?.includes('Sertifikat')), { timeout: 60000 });
  const sebelum = readdirSync(UNDUH);
  await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => x.textContent?.includes('Sertifikat pencapaian'))!; ([...s.querySelectorAll('button')].find((b) => b.textContent?.includes('Buka / Unduh')) as HTMLElement).click(); });
  const f = await unduhanBaru(sebelum);
  return f ? gambarPdf(ganti(f, nama)) : [];
};

try {
  await page.goto(URL_APP, { waitUntil: 'networkidle0' });
  await klik('Lanjutkan di browser');
  await pin('246810'); await pin('246810');
  await klik('Lewati dulu');
  cek(await ada('Selamat datang', 30000), 'PIN dibuat, aktivasi dilewati (tanpa kode privat)');

  // child with the YASI box ticked
  await klik('+ Anak');
  await isi('Nama lengkap', 'Budi Santoso'); await isi('Nama panggilan', 'Budi'); await isi('Tempat lahir', 'Bogor'); await isi('Tanggal lahir', '2019-06-20');
  await klik('Cerebral Palsy', { persis: true });
  cek((await kotakYasi()) === false, 'anak baru: kotak YASI default tidak dicentang');
  await klikKotakYasi(); await tunggu(150);
  cek((await kotakYasi()) === true, 'kotak YASI dicentang');
  await page.evaluate((t) => [...document.querySelectorAll('label')].find((x) => x.textContent?.includes(t))?.scrollIntoView({ block: 'center' }), KOTAK);
  await layar('form-anak-yasi');
  await klik('Simpan', { persis: true });
  cek(await ada('Mitra YASI'), 'profil: lencana Mitra YASI');

  // reload (cold, PIN) -> persisted
  await page.reload({ waitUntil: 'networkidle0' });
  await klik('Lanjutkan di browser').catch(() => undefined);
  await pin('246810');
  cek(await ada('Budi Santoso'), 'muat ulang + PIN: data anak ada');
  await page.goto(`${URL_APP}#/`); await tunggu(400);
  await klik('Budi Santoso');
  cek(await ada('Mitra YASI'), 'setelah muat ulang: lencana Mitra YASI tetap');
  await klik('Ubah', { persis: true });
  await page.waitForFunction((t) => document.body.innerText.includes(t), {}, KOTAK);
  cek((await kotakYasi()) === true, 'setelah muat ulang: kotak YASI tetap dicentang (IndexedDB)');
  await page.evaluate((t) => [...document.querySelectorAll('label')].find((x) => x.textContent?.includes(t))?.scrollIntoView({ block: 'center' }), KOTAK);
  await layar('form-anak-setelah-muat-ulang');
  await page.goto(`${URL_APP}#/`); await tunggu(400);

  // two evaluations (session-count warnings are confirmed by the dialog handler)
  await klik('Budi Santoso');
  await klik('Evaluasi Awal', { persis: true });
  await isi('Tanggal evaluasi', '2025-01-06');
  await klik('2. Kegiatan'); await nilaiKartu(() => 3);
  await klik('3. Sensori'); await nilaiKartu(() => 2);
  await klik('4. Refleks'); await nilaiKartu(() => 2);
  await klik('5. Program'); await nilaiKartu(() => 3);
  await klik('6. Ringkasan');
  await klik('Selesaikan evaluasi');
  await page.goto(`${URL_APP}#/`); await tunggu(400);
  await klik('Budi Santoso');
  await klik('Evaluasi Lanjutan', { persis: true });
  await isi('Tanggal evaluasi', '2025-07-01');
  await klik('Salin nilai evaluasi sebelumnya');
  await klik('2. Kegiatan'); await nilaiKartu((i) => (i % 2 ? 1 : 2));
  await klik('3. Sensori'); await nilaiKartu(() => 1);
  await klik('4. Refleks'); await nilaiKartu(() => 1);
  await klik('5. Program'); await nilaiKartu(() => 2);
  await klik('6. Ringkasan');
  await klik('Selesaikan evaluasi');
  cek(await ada('Tinjau narasi', 30000), 'layar Buat laporan');

  // new report (input from buatInput) -> logo on cover + approval page
  const baru = await unduhLaporan('Buat PDF laporan', 'laporan-baru-yasi.pdf');
  cek(baru.length >= 15, `PDF laporan ${baru.length} halaman`);
  await layar('pdf-laporan-yasi');

  // saved report screen + certificates
  await page.goto(`${URL_APP}#/`); await tunggu(400);
  await klik('Budi Santoso'); await klik('Laporan', { persis: true });
  cek(await ada('Logo YASI ditampilkan di sampul'), 'layar laporan: catatan logo YASI tampil');
  const simpanYa = await unduhLaporan('Buka PDF laporan', 'laporan-tersimpan-yasi.pdf');
  const a4 = await unduhSertifikat('A4 (cetak)', 'sertifikat-a4-yasi.pdf');
  const sosial = await unduhSertifikat('Versi sosial', 'sertifikat-sosial-yasi.pdf');
  await layar('laporan-sertifikat-yasi');

  // untick -> saved report re-renders without the logo (child's current flag wins)
  await page.goto(`${URL_APP}#/`); await tunggu(400);
  await klik('Budi Santoso'); await klik('Ubah', { persis: true });
  await page.waitForFunction((t) => document.body.innerText.includes(t), {}, KOTAK);
  await klikKotakYasi(); await tunggu(150);
  cek((await kotakYasi()) === false, 'kotak YASI dicentang ulang -> tidak');
  await klik('Simpan', { persis: true });
  cek(!(await ada('Mitra YASI', 1500)), 'profil: lencana Mitra YASI hilang');
  await klik('Laporan', { persis: true });
  cek(!(await ada('Logo YASI ditampilkan di sampul', 1500)), 'layar laporan: catatan logo YASI tidak tampil');
  const simpanTidak = await unduhLaporan('Buka PDF laporan', 'laporan-tersimpan-tanpa.pdf');
  const a4Tidak = await unduhSertifikat('A4 (cetak)', 'sertifikat-a4-tanpa.pdf');

  const n = baru.length;
  cek(simpanYa.length === n && simpanTidak.length === n, `jumlah halaman sama (${n}/${simpanYa.length}/${simpanTidak.length})`);
  cek(baru[0] === (simpanTidak[0] ?? 0) + 1 && baru[n - 1] === (simpanTidak[n - 1] ?? 0) + 1, `laporan baru: +1 gambar di sampul & pengesahan (${baru[0]}/${baru[n - 1]} vs ${simpanTidak[0]}/${simpanTidak[n - 1]})`);
  cek(JSON.stringify(simpanYa) === JSON.stringify(baru), 'laporan tersimpan (dicentang) = laporan baru');
  cek(baru.slice(1, -1).join() === simpanTidak.slice(1, -1).join(), 'halaman dalam: jumlah gambar tidak berubah');
  cek(a4[0] === (a4Tidak[0] ?? 0) + 1, `sertifikat A4: +1 gambar (${a4[0]} vs ${a4Tidak[0]})`);
  cek((sosial[0] ?? 0) >= 2, `sertifikat sosial: logo HNC + YASI (${sosial[0]} gambar)`);
} catch (e) {
  cek(false, `kesalahan: ${(e as Error).message}`);
  await layar('galat').catch(() => undefined);
} finally {
  cek(!luar.length, `permintaan eksternal: ${luar.length ? luar.slice(0, 5).join(', ') : 'tidak ada'}`);
  cek(!galatHalaman.length, `galat halaman/konsol: ${galatHalaman.length ? galatHalaman.slice(0, 5).join(' | ') : 'tidak ada'}`);
  await browser.close();
  server.close();
}
console.log(`\n${jumlahOk} OK, ${gagal.length} GAGAL. Layar + PDF: ${OUT}`);
process.exit(gagal.length ? 1 : 0);
