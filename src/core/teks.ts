// Template engine + markup (PLAN.md §6.0, D11).
//
// Template syntax:
//   {token} / {kegiatan.slot}   required token; a missing token throws Error('templat <id>: token <t>')
//   [[ … ]]                      optional segment, dropped unless every token inside resolves
//   [[#flag: … ]]                rendered only when the flag is true (and its tokens resolve)
// Markup: **bold**, _italic_ (may nest: **_water trap_ di kolam dalam**).
import type { Paragraf, Run, SumberTeks } from './types.ts';

export interface KonteksTemplat {
  token: Record<string, string | number | undefined | null>;
  flag?: Record<string, boolean | undefined>;
}

const POLA_TOKEN = /\{([A-Za-z][\w.]*)\}/g;
const POLA_SEGMEN = /\[\[((?:(?!\[\[)[\s\S])*?)\]\]/;
const POLA_FLAG = /^#([\w.]+):/;

const nilaiToken = (ctx: KonteksTemplat, nama: string): string | undefined => {
  const v = ctx.token[nama];
  if (v === undefined || v === null) return undefined;
  const s = String(v);
  return s.trim() === '' ? undefined : s;
};

const gantiToken = (s: string, ctx: KonteksTemplat, id: string): string =>
  s.replace(POLA_TOKEN, (_, nama: string) => {
    const v = nilaiToken(ctx, nama);
    if (v === undefined) throw new Error(`templat ${id}: token ${nama}`);
    return v;
  });

const semuaTokenAda = (s: string, ctx: KonteksTemplat): boolean =>
  [...s.matchAll(POLA_TOKEN)].every((m) => nilaiToken(ctx, m[1]!) !== undefined);

/** Fills a template and tidies spacing. */
export function isiTemplat(id: string, templat: string, ctx: KonteksTemplat): string {
  let s = templat;
  // Resolve optional segments innermost-first.
  for (let m = POLA_SEGMEN.exec(s); m; m = POLA_SEGMEN.exec(s)) {
    let isi = m[1]!;
    let tampil = true;
    const f = POLA_FLAG.exec(isi);
    if (f) {
      tampil = ctx.flag?.[f[1]!] === true;
      isi = isi.slice(f[0].length);
    }
    const hasil = tampil && semuaTokenAda(isi, ctx) ? gantiToken(isi, ctx, id) : '';
    s = s.slice(0, m.index) + hasil + s.slice(m.index + m[0].length);
  }
  return rapikanSpasi(gantiToken(s, ctx, id));
}

/** Tokens referenced by a template (for the review doc and validation). */
export function daftarToken(templat: string): string[] {
  return [...new Set([...templat.matchAll(POLA_TOKEN)].map((m) => m[1]!))];
}

/** Collapses whitespace, removes spaces before , . ; : and trims. */
export function rapikanSpasi(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/ +([,.;:])/g, '$1').trim();
}

const POLA_AWAL = /^([*_\s]*)(\p{L})/u;

/** Capitalises the first letter (markup prefixes are skipped). */
export function kapitalAwal(s: string): string {
  return s.replace(POLA_AWAL, (_, pre: string, h: string) => pre + h.toLocaleUpperCase('id'));
}

/** Lower-cases the first letter unless the first word is 'Ananda' (never lower-cased). */
export function kecilAwal(s: string): string {
  const m = /^[*_\s]*(\p{L}+)/u.exec(s);
  if (!m || m[1] === 'Ananda') return s;
  return s.replace(POLA_AWAL, (_, pre: string, h: string) => pre + h.toLocaleLowerCase('id'));
}

/** Joins sentences/blocks with a space, capitalising each block's first letter. */
export function gabungKalimat(bagian: (string | undefined | null | false)[]): string {
  return rapikanSpasi(bagian.filter((b): b is string => !!b && b.trim() !== '').map(kapitalAwal).join(' '));
}

/** 'a' · 'a dan b' · 'a, b, dan c' (or '… serta c'). */
export function gabungDaftar(xs: string[], kata: 'dan' | 'serta' = 'dan'): string {
  if (xs.length === 0) return '';
  if (xs.length === 1) return xs[0]!;
  if (xs.length === 2) return `${xs[0]} ${kata} ${xs[1]}`;
  return `${xs.slice(0, -1).join(', ')}, ${kata} ${xs[xs.length - 1]}`;
}

/** Parses **bold** / _italic_ markup into runs (adjacent runs with equal style are merged). */
export function keRuns(markup: string): Run[] {
  const runs: Run[] = [];
  let tebal = false;
  let miring = false;
  let buf = '';
  const dorong = () => {
    if (!buf) return;
    const akhir = runs[runs.length - 1];
    if (akhir && !!akhir.tebal === tebal && !!akhir.miring === miring) akhir.teks += buf;
    else runs.push({ teks: buf, ...(tebal ? { tebal: true } : {}), ...(miring ? { miring: true } : {}) });
    buf = '';
  };
  for (let i = 0; i < markup.length; i++) {
    if (markup.startsWith('**', i)) { dorong(); tebal = !tebal; i++; continue; }
    if (markup[i] === '_') { dorong(); miring = !miring; continue; }
    buf += markup[i];
  }
  dorong();
  return runs;
}

/** Runs back to markup (italic inside bold). */
export function runsKeMarkup(runs: Run[]): string {
  return runs.map((r) => {
    let t = r.teks;
    if (r.miring) t = `_${t}_`;
    if (r.tebal) t = `**${t}**`;
    return t;
  }).join('');
}

/** Plain text without markup. */
export function teksPolos(markup: string): string {
  return keRuns(markup).map((r) => r.teks).join('');
}

export function buatParagraf(id: string, markup: string, sumber: Paragraf['sumber']): Paragraf {
  return { id, markup, runs: keRuns(markup), sumber };
}

/** Combines the provenance of the parts of a paragraph. */
export function gabungSumber(xs: (SumberTeks | 'INPUT' | 'CAMPURAN')[]): Paragraf['sumber'] {
  const u = [...new Set(xs)];
  if (u.length === 1) return u[0]!;
  return 'CAMPURAN';
}
