// Privacy guard: run before EVERY commit (after staging).
// 1) Path rules over `git ls-files` + staged files.
// 2) `git grep` over tracked (worktree) and staged (index) content for patterns derived AT RUNTIME from the
//    private data: the child's name parts (>= 4 letters, case-insensitive whole words), birth date (ISO and
//    Indonesian forms), the nickname form with 'Ananda', and the oracle's `terlarang` list.
// 3) The activation code (if generated) and byte hashes of the private signature PNGs.
// Nothing identifying is hard-coded here.
import { spawnSync } from 'node:child_process';
import { formatTanggal, parseIso, tokenNama } from '../src/core/index.ts';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { bacaDataAnak, bacaKodeAktivasi, bacaOracle, hashTandaTangan, sha256 } from './lib/data-privat.ts';
import { DIR_REPO } from './lib/jalur.ts';

const git = (args: string[]): { kode: number; keluaran: string } => {
  const r = spawnSync('git', ['-C', DIR_REPO, ...args], { encoding: 'utf8' });
  if (r.error) throw r.error;
  return { kode: r.status ?? 1, keluaran: r.stdout };
};
const baris = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

const ATURAN_JALUR: [RegExp, string][] = [
  [/(^|\/)_referensi(\/|$)/, 'folder _referensi'],
  [/(^|\/)data\//, 'folder data/'],
  [/ttd/i, 'berkas tanda tangan'],
  [/\.pdf$/i, 'PDF'],
  [/(^|\/)output\//, 'folder output/'],
  [/(^|\/)preview[^/]*\//, 'folder preview'],
  [/\.docx?$/i, 'dokumen Word'],
  [/\.jpe?g$/i, 'gambar JPEG'],
  [/^PLAN\.md$/, 'PLAN.md'],
  [/^\.agents\//, '.agents/'],
  [/(^|\/)review\.json$/, 'review.json'],
];

const masalah: string[] = [];

// --- 1. paths ------------------------------------------------------------------------------------------------
const terlacak = baris(git(['ls-files']).keluaran);
const staged = baris(git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).keluaran);
for (const f of new Set([...terlacak, ...staged])) {
  for (const [pola, alasan] of ATURAN_JALUR) if (pola.test(f)) masalah.push(`jalur terlarang (${alasan}): ${f}`);
  if (/\.png$/i.test(f) && !/^assets\/logo-(center|yasi)[^/]*\.png$/.test(f) && !/^app\/public\/(ikon-[a-z0-9-]+|logo-kecil)\.png$/.test(f)) masalah.push(`PNG di luar assets/logo-center*.png / assets/logo-yasi*.png: ${f}`);
}

// --- 2. content ----------------------------------------------------------------------------------------------
const anak = bacaDataAnak().anak;
const oracle = bacaOracle();
const bagianNama = [...new Set(`${anak.namaLengkap} ${anak.namaPanggilan}`.split(/\s+/).filter((k) => k.length >= 4))];
const t = parseIso(anak.tanggalLahir);
const dd = String(t.hari).padStart(2, '0');
const mm = String(t.bulan).padStart(2, '0');
const polaTetap = [
  anak.tanggalLahir,
  formatTanggal(anak.tanggalLahir),
  `${dd}/${mm}/${t.tahun}`,
  `${dd}-${mm}-${t.tahun}`,
  tokenNama(anak).anandaPanggilan,
  ...oracle.terlarang,
];

const cari = (pola: string[], kataUtuh: boolean): string[] => {
  const hasil: string[] = [];
  if (!pola.length) return hasil;
  const args = ['grep', '-n', '-I', '-F', ...(kataUtuh ? ['-w', '-i'] : [])];
  for (const p of pola) args.push('-e', p);
  for (const sumber of [[] as string[], ['--cached']]) {
    const r = git([...args.slice(0, 1), ...sumber, ...args.slice(1)]);
    if (r.kode === 0) hasil.push(...baris(r.keluaran).map((l) => `${sumber.length ? '[staged] ' : ''}${l}`));
    else if (r.kode !== 1) throw new Error(`git grep gagal (kode ${r.kode})`);
  }
  return hasil;
};
// Report only file:line, never the matched text itself.
const lokasi = (l: string) => l.split(':').slice(0, 2).join(':');
for (const l of cari(bagianNama, true)) masalah.push(`nama anak ditemukan: ${lokasi(l)}`);
for (const l of cari(polaTetap, false)) masalah.push(`pola terlarang/identitas ditemukan: ${lokasi(l)}`);
// Activation code (private file, if generated) and byte hashes of the signature PNGs.
const kode = bacaKodeAktivasi();
if (kode) for (const l of cari([kode, kode.replace(/-/g, '')], false)) masalah.push(`kode aktivasi ditemukan: ${lokasi(l)}`);
const hashTtd = hashTandaTangan();
for (const f of terlacak) {
  const berkas = join(DIR_REPO, f);
  if (existsSync(berkas) && statSync(berkas).isFile() && hashTtd.has(sha256(readFileSync(berkas)))) masalah.push(`berkas identik dengan tanda tangan: ${f}`);
}

if (masalah.length) {
  console.error(`cek:privasi GAGAL (${masalah.length} masalah):`);
  for (const m of [...new Set(masalah)]) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(`cek:privasi OK — ${terlacak.length} berkas terlacak, ${staged.length} staged; ${bagianNama.length + polaTetap.length + (kode ? 1 : 0)} pola + ${hashTtd.size} hash tanda tangan diperiksa.`);
