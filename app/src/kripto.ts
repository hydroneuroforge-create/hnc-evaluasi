// WebCrypto helpers: salted PBKDF2 PIN hash, and decryption of the activation payload (AES-GCM-256, key from
// PBKDF2-SHA256 over the activation code). Only the ciphertext ships with the app.
const enc = new TextEncoder();
export const keB64 = (b: Uint8Array): string => { let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s); };
export const dariB64 = (s: string): Uint8Array => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function pbkdf2(rahasia: string, garam: Uint8Array, iterasi: number, bit = 256): Promise<Uint8Array> {
  const kunci = await crypto.subtle.importKey('raw', enc.encode(rahasia), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: garam as BufferSource, iterations: iterasi }, kunci, bit));
}

export interface HashPin { garam: string; hash: string; iterasi: number }
export async function buatHashPin(pin: string): Promise<HashPin> {
  const garam = crypto.getRandomValues(new Uint8Array(16));
  const iterasi = 210000;
  return { garam: keB64(garam), hash: keB64(await pbkdf2(pin, garam, iterasi)), iterasi };
}
export async function cocokPin(pin: string, h: HashPin): Promise<boolean> {
  const x = keB64(await pbkdf2(pin, dariB64(h.garam), h.iterasi));
  let beda = x.length ^ h.hash.length;
  for (let i = 0; i < Math.min(x.length, h.hash.length); i++) beda |= x.charCodeAt(i) ^ h.hash.charCodeAt(i);
  return beda === 0;
}

/** Code as typed -> canonical form (uppercase, no separators). */
export const normalisasiKode = (k: string): string => k.toUpperCase().replace(/[^A-Z0-9]/g, '');

export interface PaketAktivasi { versi: 1; iterasi: number; garam: string; iv: string; data: string }
export interface IsiAktivasi { ttd: { fisioterapis?: string; terapis?: string }; str: string }

export async function bukaAktivasi(paket: PaketAktivasi, kode: string): Promise<IsiAktivasi> {
  const bits = await pbkdf2(normalisasiKode(kode), dariB64(paket.garam), paket.iterasi);
  const kunci = await crypto.subtle.importKey('raw', bits as BufferSource, 'AES-GCM', false, ['decrypt']);
  const polos = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: dariB64(paket.iv) as BufferSource }, kunci, dariB64(paket.data) as BufferSource);
  return JSON.parse(new TextDecoder().decode(polos)) as IsiAktivasi;
}
