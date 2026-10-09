// Privacy gate for anything that leaves the machine: scans one or more directory trees (the publish tree and
// dist/) byte-wise for the reference child's name parts (case-insensitive whole words), birth date forms, the
// activation code, the signature PNGs (file hash and base64 prefix), and forbidden paths. Prints only locations.
// Usage: tsx scripts/cek-publik.ts <dir> [<dir> …]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { formatTanggal, parseIso } from '../src/core/index.ts';
import { BERKAS_TTD } from './lib/aset-node.ts';
import { bacaDataAnak, bacaKodeAktivasi, bacaOracle, hashTandaTangan, sha256 } from './lib/data-privat.ts';

const dirs = process.argv.slice(2);
if (!dirs.length) { console.error('pemakaian: cek-publik.ts <dir> …'); process.exit(2); }

const anak = bacaDataAnak().anak;
const kata = [...new Set(`${anak.namaLengkap} ${anak.namaPanggilan}`.split(/\s+/).filter((k) => k.length >= 4).map((k) => k.toLowerCase()))];
const t = parseIso(anak.tanggalLahir);
const dd = String(t.hari).padStart(2, '0');
const mm = String(t.bulan).padStart(2, '0');
// Birth-date forms: whitespace-tolerant, case-insensitive. Everything else: exact bytes (as cek:privasi).
const tanggal = [anak.tanggalLahir, formatTanggal(anak.tanggalLahir), `${dd}/${mm}/${t.tahun}`, `${dd}-${mm}-${t.tahun}`];
const frasa = [...bacaOracle().terlarang];
const kode = bacaKodeAktivasi();
if (kode) frasa.push(kode, kode.replace(/-/g, ''));
for (const f of Object.values(BERKAS_TTD)) frasa.push(readFileSync(f).toString('base64').slice(100, 160));
const hashTtd = hashTandaTangan();
const JALUR = [/(^|\/)_referensi(\/|$)/, /(^|\/)_pratinjau(\/|$)/, /(^|\/)PLAN\.md$/, /(^|\/)\.agents(\/|$)/, /ttd/i, /(^|\/)\.git(\/|$)/];
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const reKata = new RegExp(`(?<![\\p{L}\\p{N}])(${kata.map(escape).join('|')})(?![\\p{L}\\p{N}])`, 'iu');
const reTeks = (f: string) => new RegExp(escape(f).replace(/\s+/g, '(?:\\s|\\\\u00a0|&nbsp;|%20)+'), 'iu');
const reTetap = [...tanggal.map(reTeks), ...frasa.filter(Boolean).map((f) => new RegExp(escape(f)))];

const masalah: string[] = [];
function jelajah(akar: string, dir: string): void {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const rel = relative(akar, p);
    if (n === '.git' && dir === akar) continue; // the publish repo's own metadata (fresh history) is checked by content below
    if (JALUR.some((r) => r.test(rel))) masalah.push(`jalur terlarang: ${akar}/${rel}`);
    if (statSync(p).isDirectory()) { jelajah(akar, p); continue; }
    const b = readFileSync(p);
    if (hashTtd.has(sha256(b))) masalah.push(`berkas tanda tangan: ${akar}/${rel}`);
    const s = b.toString('latin1');
    const u = b.toString('utf8');
    if (reKata.test(u) || reKata.test(rel)) masalah.push(`nama anak: ${akar}/${rel}`);
    reTetap.forEach((r, i) => { if (r.test(u) || r.test(s)) masalah.push(`pola terlarang #${i}: ${akar}/${rel}`); });
  }
}
for (const d of dirs) jelajah(d, d);
if (masalah.length) {
  console.error(`cek:publik GAGAL (${masalah.length}):`);
  for (const m of [...new Set(masalah)]) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(`cek:publik OK — ${dirs.join(', ')}: ${kata.length} nama + ${reTetap.length} pola + ${hashTtd.size} hash diperiksa.`);
