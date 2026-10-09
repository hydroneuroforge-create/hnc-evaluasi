// Encrypts the activation payload (both signature PNGs + the physiotherapist's STR) into app/public/aktivasi.json:
// AES-GCM-256 with a key from PBKDF2-SHA256 (600 000 iterations) over a random activation code (90 bits,
// XXXX-XXXX-XXXX-XXXX-XX, no ambiguous characters). The code is written ONLY to the private file
// BERKAS_KODE_AKTIVASI (reused if it already exists) and is never printed.
import { webcrypto as c } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KLINIK } from '../src/core/index.ts';
import { BERKAS_TTD } from './lib/aset-node.ts';
import { BERKAS_KODE_AKTIVASI, DIR_REPO } from './lib/jalur.ts';

const ABJAD = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 symbols = 5 bits each; no 0/O/1/I
const ITERASI = 600_000;

function kodeBaru(): string {
  const acak = c.getRandomValues(new Uint8Array(18));
  const s = [...acak].map((b) => ABJAD[b & 31]).join('');
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16)}`;
}

const kode = existsSync(BERKAS_KODE_AKTIVASI) ? readFileSync(BERKAS_KODE_AKTIVASI, 'utf8').trim() : kodeBaru();
if (!existsSync(BERKAS_KODE_AKTIVASI)) writeFileSync(BERKAS_KODE_AKTIVASI, `${kode}\n`, { mode: 0o600 });

const dataUri = (f: string) => `data:image/png;base64,${readFileSync(f).toString('base64')}`;
const isi = { ttd: { fisioterapis: dataUri(BERKAS_TTD.fisioterapis), terapis: dataUri(BERKAS_TTD.terapis) }, str: KLINIK.penandatangan[0].str };

const garam = c.getRandomValues(new Uint8Array(16));
const iv = c.getRandomValues(new Uint8Array(12));
const bahan = await c.subtle.importKey('raw', new TextEncoder().encode(kode.replace(/-/g, '')), 'PBKDF2', false, ['deriveBits']);
const bits = await c.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: garam, iterations: ITERASI }, bahan, 256);
const kunci = await c.subtle.importKey('raw', bits, 'AES-GCM', false, ['encrypt']);
const data = new Uint8Array(await c.subtle.encrypt({ name: 'AES-GCM', iv }, kunci, new TextEncoder().encode(JSON.stringify(isi))));
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const keluar = join(DIR_REPO, 'app', 'public', 'aktivasi.json');
writeFileSync(keluar, `${JSON.stringify({ versi: 1, iterasi: ITERASI, garam: b64(garam), iv: b64(iv), data: b64(data) })}\n`);
console.log(`aktivasi: ciphertext -> ${keluar} (${data.length} bytes); kode tersimpan di berkas privat.`);
