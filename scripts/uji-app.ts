// Scripted walkthrough of the built PWA (dist/) in headless Chromium with iPhone 15 emulation, using a FICTITIOUS
// child. PIN -> activation (private code file) -> child -> Evaluasi Awal -> 24 sessions -> Evaluasi Lanjutan with a
// Program Individual activity -> edit one narrative -> report PDF (pages, size, edited text) -> certificate ->
// backup -> wipe -> restore -> offline cold reload -> offline PDF. Screenshots + PDFs go to HNC_LAYAR
// (default /projects/sandbox/_referensi/output/app-screens). Run `npm run build` first.
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { Page } from 'puppeteer-core';
import { bacaKodeAktivasi } from './lib/data-privat.ts';
import { DIR_OUTPUT, DIR_REPO } from './lib/jalur.ts';

const DIST = join(DIR_REPO, 'dist');
const OUT = process.env.HNC_LAYAR ?? join(DIR_OUTPUT, 'app-screens');
const UNDUH = join(OUT, 'unduhan');
rmSync(UNDUH, { recursive: true, force: true });
mkdirSync(UNDUH, { recursive: true });
const BASE = '/hnc-evaluasi/';
const PORT = 4173;
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
const hasil: string[] = [];
const gagal: string[] = [];
const cek = (ok: boolean, pesan: string) => { (ok ? hasil : gagal).push(pesan); console.log(`${ok ? 'OK  ' : 'GAGAL'} ${pesan}`); };
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
/** Sets an input/textarea found by its label text (React-compatible). */
const isi = async (label: string, nilai: string) => {
  await page.waitForFunction((l) => [...document.querySelectorAll('label')].some((x) => x.querySelector('.label')?.textContent?.trim() === l), { timeout: 15000 }, label);
  await page.evaluate((l, v) => {
    const lab = [...document.querySelectorAll('label')].find((x) => x.querySelector('.label')?.textContent?.trim() === l)!;
    const el = lab.querySelector('input, textarea') as HTMLInputElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, label, nilai);
  await tunggu(80);
};
const setSel = async (sel: string, nilai: string, i = 0) => {
  await page.evaluate((s, v, i) => {
    const el = document.querySelectorAll(s)[i] as HTMLInputElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, sel, nilai, i);
  await tunggu(80);
};
const pin = async (p: string) => { await page.waitForSelector('button[aria-label="1"]'); for (const d of p) { await page.click(`button[aria-label="${d}"]`); await tunggu(40); } await tunggu(900); };
const ada = (teks: string, ms = 20000) => page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: ms }, teks).then(() => true, () => false);
/** Clicks, per card, the option button at index `pilih(i)` of the first option grid. */
const nilaiKartu = async (pilih: (i: number) => number) => {
  const n = await page.evaluate(() => document.querySelectorAll('main section.kartu .grid').length);
  for (let i = 0; i < n; i++) {
    await page.evaluate((i, j) => { const g = document.querySelectorAll('main section.kartu .grid')[i]!; (g.querySelectorAll('button')[j] as HTMLElement | undefined)?.click(); }, i, pilih(i));
    await tunggu(60);
  }
};
const unduhanBaru = async (sebelum: string[], ms = 60000): Promise<string | null> => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const baru = readdirSync(UNDUH).filter((f) => !sebelum.includes(f) && !f.endsWith('.crdownload'));
    if (baru.length) { await tunggu(300); return join(UNDUH, baru[0]!); }
    await tunggu(300);
  }
  return null;
};
const infoPdf = (f: string, cari: string): { halaman: number; ada: boolean } => {
  const r = spawnSync('python3', ['-c', `import sys,pymupdf;d=pymupdf.open(sys.argv[1]);t=''.join(p.get_text() for p in d);print(d.page_count, int(sys.argv[2] in t))`, f, cari], { encoding: 'utf8', env: { ...process.env, PYENV_VERSION: '3.11.15' } });
  const [h, a] = r.stdout.trim().split(' ');
  return { halaman: Number(h), ada: a === '1' };
};

const EDIT = 'UJICOBA SUNTING: Ananda Budi menunjukkan semangat yang luar biasa selama program.';
try {
  await page.goto(URL_APP, { waitUntil: 'networkidle0' });
  cek(await ada('Tambahkan ke Layar Utama'), 'panduan pasang tampil di browser (bukan standalone)');
  await layar('panduan-pasang');
  await klik('Lanjutkan di browser');
  await pin('246810'); await pin('246810');
  cek(await ada('Masukkan kode aktivasi'), 'PIN dibuat; layar aktivasi tampil');
  const kode = bacaKodeAktivasi();
  if (!kode) throw new Error('kode aktivasi privat tidak ditemukan');
  await setSel('input', kode);
  await klik('Aktifkan', { persis: true });
  cek(await ada('Selamat datang', 30000), 'aktivasi dengan kode asli berhasil');
  await layar('beranda-kosong');

  // child
  await klik('+ Anak');
  await isi('Nama lengkap', 'Budi Santoso'); await isi('Nama panggilan', 'Budi'); await isi('Tempat lahir', 'Bogor'); await isi('Tanggal lahir', '2019-06-20');
  await page.select('select[aria-label="Bergabung sejak bulan"]', '6');
  await page.type('input[aria-label="Bergabung sejak tahun"]', '2024');
  await klik('Cerebral Palsy', { persis: true });
  await layar('form-anak');
  await klik('Simpan', { persis: true });
  cek(await ada('Budi Santoso'), 'anak fiktif ditambahkan');
  cek(await ada('Bergabung sejak Juni'), 'profil: Bergabung sejak Juni 2024');

  // Evaluasi Awal (Jan 2025)
  await klik('Evaluasi Awal', { persis: true });
  await isi('Tanggal evaluasi', '2025-01-06');
  await klik('2. Kegiatan'); await nilaiKartu((i) => (i === 5 ? 4 : 3)); // level 1 (index 3), one 'tdo'
  await klik('3. Sensori'); await nilaiKartu(() => 2);
  await klik('4. Refleks'); await nilaiKartu(() => 2);
  await klik('5. Program'); await nilaiKartu((i) => (i % 3 === 0 ? 4 : 3));
  await klik('6. Ringkasan');
  cek(await ada('Siap diselesaikan.'), 'Evaluasi Awal lengkap');
  await klik('Selesaikan evaluasi');

  // 24 sessions after the first evaluation
  await page.waitForSelector('input[aria-label="Tanggal sesi"]');
  for (let i = 0; i < 24; i++) {
    const d = new Date(Date.UTC(2025, 0, 8 + i * 7));
    await setSel('input[aria-label="Tanggal sesi"]', d.toISOString().slice(0, 10));
    await klik('Tambah', { persis: true });
  }
  cek(await ada('Sesi terapi (24)'), '24 sesi tercatat');
  await page.goto(`${URL_APP}#/`); await tunggu(500);
  cek(await ada('24/24') && await ada('Siap evaluasi'), 'beranda: 24/24 dan lencana Siap evaluasi');
  await layar('beranda-siap-evaluasi');

  // Evaluasi Lanjutan (Jul 2025) with a Program Individual activity
  await klik('Budi Santoso');
  await klik('Evaluasi Lanjutan', { persis: true });
  await isi('Tanggal evaluasi', '2025-07-01');
  await klik('Salin nilai evaluasi sebelumnya');
  await klik('2. Kegiatan'); await nilaiKartu((i) => (i % 2 ? 1 : 2));
  await layar('form-kegiatan');
  await klik('3. Sensori'); await nilaiKartu(() => 1);
  await klik('4. Refleks'); await nilaiKartu((i) => (i % 2 ? 0 : 1));
  await klik('5. Program'); await nilaiKartu((i) => (i % 2 ? 1 : 2));
  await klik('+ Tambah aktivitas individual');
  await isi('Nama aktivitas', 'Rolling log dengan pelampung'); await isi('Target refleks', 'TLR, ATNR'); await isi('Manfaat', 'Melatih rotasi tubuh dan koordinasi bilateral');
  await klik('Tambah', { persis: true });
  await tunggu(400);
  await page.evaluate(() => { const k = [...document.querySelectorAll('main section.kartu')].find((s) => s.textContent?.includes('Rolling log'))!; (k.querySelectorAll('.grid button')[1] as HTMLElement).click(); });
  cek(await ada('Program Individual'), 'aktivitas Program Individual ditambahkan');
  await klik('6. Ringkasan');
  await klik('Selesaikan evaluasi');

  // report: edit one narrative, generate
  cek(await ada('Tinjau narasi', 30000), 'layar Buat laporan + tinjau narasi');
  const nomor = await page.evaluate(() => (([...document.querySelectorAll('label')].find((l) => l.textContent?.includes('Nomor laporan'))!.querySelector('input') as HTMLInputElement).value));
  cek(/^HNC\/EV\/\d{4}\/\d{2}\/001$/.test(nomor), `nomor laporan otomatis ${nomor}`);
  const pratinjau = await page.evaluate(() => document.querySelector('[data-pratinjau-periode] b')?.textContent ?? '');
  cek(pratinjau.startsWith('Juni\u00a02024 – '), `pratinjau periode: ${pratinjau}`);
  await klik('Kesimpulan', { persis: false, indeks: 0 });
  await setSel('[data-paragraf="kesimpulan.p1"] textarea', EDIT);
  cek(await ada('Kembalikan ke teks otomatis'), 'narasi diubah (tombol kembalikan tampil)');
  await layar('tinjau-narasi');
  await klik('Buat PDF laporan');
  await page.waitForSelector('[data-pdf-bytes]', { timeout: 120000 });
  await layar('pdf-siap');
  let sebelum = readdirSync(UNDUH);
  await klik('Buka / Unduh');
  const pdf = await unduhanBaru(sebelum);
  if (pdf) {
    const b = statSync(pdf).size; const inf = infoPdf(pdf, 'UJICOBA SUNTING');
    cek(/Laporan-HNC-Budi-\d{4}-\d{2}-\d{2}\.pdf$/.test(pdf), `nama berkas ${pdf.split('/').pop()}`);
    cek(inf.halaman >= 15, `PDF laporan ${inf.halaman} halaman`);
    cek(b <= 1.5 * 1024 * 1024, `ukuran PDF browser ${(b / 1024 / 1024).toFixed(2)} MB (≤ 1,5 MB)`);
    cek(inf.ada, 'teks yang diubah ada di PDF');
    // period on cover / Ringkasan / Pengesahan; no attended-session count; no sessions-per-month chart
    const r = spawnSync('python3', ['-c', `import sys,json,pymupdf;d=pymupdf.open(sys.argv[1]);print(json.dumps([p.get_text() for p in d]))`, pdf], { encoding: 'utf8', env: { ...process.env, PYENV_VERSION: '3.11.15' } });
    const hal: string[] = JSON.parse(r.stdout).map((t: string) => t.replace(/[\s\u00a0]+/g, ' '));
    const per = /Juni 2024 – \S+ \d{4}|Juni 2024 –\s*\S+ \d{4}/;
    const iRing = hal.findIndex((t) => t.includes('Ringkasan untuk Orang Tua') && t.includes('Pencapaian Utama'));
    const iSah = hal.findIndex((t) => t.includes('Lembar Pengesahan') && /Bogor, \d{1,2} \S+ \d{4}/.test(t));
    cek(per.test(hal[0] ?? ''), `periode di sampul: ${(hal[0] ?? '').match(per)?.[0] ?? '–'}`);
    cek(iRing >= 0 && per.test(hal[iRing]!) && hal[iRing]!.includes('Selama periode Juni 2024'), 'periode di Ringkasan (strip + kalimat pembuka)');
    cek(iSah >= 0 && per.test(hal[iSah]!), 'periode di Lembar Pengesahan (tanggal tanda tangan tetap lengkap)');
    const semua = hal.join(' ');
    const angkaSesi = [...semua.matchAll(/\d+ sesi\b(?! berikutnya)/gi)].map((m) => m[0]).filter((m) => !/^24 Sesi$/.test(m) || !semua.includes('Target 24 Sesi Berikutnya'));
    cek(!angkaSesi.length && !/Jumlah Sesi/i.test(semua), `tanpa jumlah sesi di PDF${angkaSesi.length ? `: ${angkaSesi.join(', ')}` : ''}`);
    cek(!semua.includes('Kehadiran Sesi per Bulan'), 'grafik sesi per bulan tidak ada');
  } else cek(false, 'PDF laporan terunduh');

  // certificate (social variant + A4)
  await page.goto(`${URL_APP}#/`); await tunggu(400);
  await klik('Budi Santoso'); await klik('Laporan', { persis: true });
  cek(await ada('Sertifikat pencapaian'), 'layar laporan tersimpan + sertifikat');
  for (const v of ['Versi sosial', 'A4 (cetak)']) {
    await klik(v);
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent === 'Bagikan' && b.closest('section')?.textContent?.includes('Sertifikat')), { timeout: 60000 });
    sebelum = readdirSync(UNDUH);
    await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => x.textContent?.includes('Sertifikat pencapaian'))!; ([...s.querySelectorAll('button')].find((b) => b.textContent?.includes('Buka / Unduh')) as HTMLElement).click(); });
    const f = await unduhanBaru(sebelum);
    cek(!!f && /Sertifikat-HNC-Budi-.*\.pdf$/.test(f), `sertifikat ${v}: ${f?.split('/').pop()}`);
  }
  await layar('laporan-sertifikat');

  // backup -> wipe -> restore
  await page.goto(`${URL_APP}#/pengaturan`); await tunggu(400);
  sebelum = readdirSync(UNDUH);
  await klik('Cadangkan sekarang');
  const cad = await unduhanBaru(sebelum, 20000);
  cek(!!cad && /HNC-Cadangan-.*\.json$/.test(cad), 'berkas cadangan dibuat');
  const isiCad = cad ? readFileSync(cad, 'utf8') : '';
  cek(!!cad && !isiCad.includes('image/png;base64') && !isiCad.includes('"aktivasi"'), 'cadangan tanpa tanda tangan/aktivasi');
  await page.goto(`${URL_APP}#/`); await tunggu(300);
  await klik('Budi Santoso'); await klik('Ubah', { persis: true }); await klik('Hapus anak');
  cek(await ada('Selamat datang'), 'data dihapus (wipe)');
  await page.goto(`${URL_APP}#/pengaturan`); await tunggu(400);
  const inp = await page.$('input[type=file]');
  await inp!.uploadFile(cad!);
  cek(await ada('Ganti semua'), 'ringkasan pemulihan tampil');
  await layar('pulihkan');
  await klik('Ganti semua');
  await page.goto(`${URL_APP}#/`); await tunggu(500);
  cek(await ada('Budi Santoso'), 'data dipulihkan');

  // offline: stop the server, cold reload, PIN, render the report PDF again
  await page.waitForFunction(() => !!navigator.serviceWorker?.controller, { timeout: 20000 }).catch(() => undefined);
  await new Promise<void>((ok) => { server.close(() => ok()); server.closeAllConnections(); });
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: 'load' });
  await klik('Lanjutkan di browser').catch(() => undefined);
  await pin('246810');
  cek(await ada('Budi Santoso'), 'offline: aplikasi terbuka dari cache (cold reload + PIN)');
  await klik('Budi Santoso'); await klik('Laporan', { persis: true });
  await klik('Buka PDF laporan');
  const okOffline = await page.waitForSelector('[data-pdf-bytes]', { timeout: 120000 }).then(() => true, () => false);
  cek(okOffline, 'offline: PDF laporan dibuat tanpa jaringan');
  await layar('offline-pdf');
} catch (e) {
  cek(false, `kesalahan: ${(e as Error).message}`);
  await layar('galat').catch(() => undefined);
} finally {
  cek(!luar.length, `permintaan eksternal: ${luar.length ? luar.slice(0, 5).join(', ') : 'tidak ada'}`);
  const g = galatHalaman.filter((x) => !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(x));
  cek(!g.length, `galat halaman/konsol: ${g.length ? g.slice(0, 5).join(' | ') : 'tidak ada'}`);
  await browser.close();
  server.close();
}
console.log(`\n${hasil.length} OK, ${gagal.length} GAGAL. Layar: ${OUT}`);
process.exit(gagal.length ? 1 : 0);
