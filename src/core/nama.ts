// Name tokens and the wrong-name guard. Names enter text ONLY through these tokens:
//   {anandaPanggilan} -> 'Ananda <namaPanggilan>'      {anandaLengkap} -> 'Ananda <namaLengkap>'
// Plain 'Ananda' is literal text.
import type { Anak } from './types.ts';

export const TOKEN_NAMA = ['anandaPanggilan', 'anandaLengkap'] as const;

export function tokenNama(anak: Pick<Anak, 'namaLengkap' | 'namaPanggilan'>): Record<(typeof TOKEN_NAMA)[number], string> {
  return {
    anandaPanggilan: `Ananda ${anak.namaPanggilan.trim()}`,
    anandaLengkap: `Ananda ${anak.namaLengkap.trim()}`,
  };
}

export interface TemuanNama { kata: string; konteks: string }

/**
 * Flags every 'Ananda <Capitalised word>' whose word is not part of the child's name
 * (catches copy-paste leftovers such as another child's name).
 */
export function periksaNama(teks: string, anak: Pick<Anak, 'namaLengkap' | 'namaPanggilan'>): TemuanNama[] {
  const sah = new Set(
    `${anak.namaLengkap} ${anak.namaPanggilan}`.split(/\s+/).filter(Boolean).map((k) => k.toLocaleLowerCase('id')),
  );
  const polos = teks.replace(/\*\*|_/g, '');
  const temuan: TemuanNama[] = [];
  for (const m of polos.matchAll(/\bAnanda[ \t]+(\p{Lu}[\p{L}'-]*)/gu)) {
    const kata = m[1]!;
    if (!sah.has(kata.toLocaleLowerCase('id'))) {
      const i = m.index ?? 0;
      temuan.push({ kata, konteks: polos.slice(Math.max(0, i - 30), i + m[0].length + 30) });
    }
  }
  return temuan;
}
