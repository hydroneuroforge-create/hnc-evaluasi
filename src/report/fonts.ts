// Plus Jakarta Sans registration (local sources only, no CDN). Idempotent; hyphenation disabled so Indonesian
// words are never split with English rules.
import { Font } from '@react-pdf/renderer';
import type { FaceKey } from './aset.ts';
import { FONT } from './theme.ts';

export interface FaceFont { kunci: FaceKey; berkas: string; fontWeight: number; fontStyle: 'normal' | 'italic' }

/** Faces used by the report and certificate (file names under assets/fonts). */
export const FACES: readonly FaceFont[] = [
  { kunci: 'light', berkas: 'PlusJakartaSans-Light.ttf', fontWeight: 300, fontStyle: 'normal' },
  { kunci: 'regular', berkas: 'PlusJakartaSans-Regular.ttf', fontWeight: 400, fontStyle: 'normal' },
  { kunci: 'italic', berkas: 'PlusJakartaSans-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
  { kunci: 'medium', berkas: 'PlusJakartaSans-Medium.ttf', fontWeight: 500, fontStyle: 'normal' },
  { kunci: 'semibold', berkas: 'PlusJakartaSans-SemiBold.ttf', fontWeight: 600, fontStyle: 'normal' },
  { kunci: 'semiboldItalic', berkas: 'PlusJakartaSans-SemiBoldItalic.ttf', fontWeight: 600, fontStyle: 'italic' },
  { kunci: 'bold', berkas: 'PlusJakartaSans-Bold.ttf', fontWeight: 700, fontStyle: 'normal' },
  { kunci: 'boldItalic', berkas: 'PlusJakartaSans-BoldItalic.ttf', fontWeight: 700, fontStyle: 'italic' },
  { kunci: 'extrabold', berkas: 'PlusJakartaSans-ExtraBold.ttf', fontWeight: 800, fontStyle: 'normal' },
];

let terdaftar: string | null = null;

/** Registers the font family once per distinct set of sources. */
export function registerFonts(fonts: Record<FaceKey, string>): void {
  const kunci = FACES.map((f) => fonts[f.kunci]?.slice(0, 64) + ':' + (fonts[f.kunci]?.length ?? 0)).join('|');
  Font.registerHyphenationCallback((kata) => [kata]);
  if (terdaftar === kunci) return;
  for (const f of FACES) if (!fonts[f.kunci]) throw new Error(`font "${f.kunci}" (${f.berkas}) tidak diberikan`);
  Font.register({
    family: FONT,
    fonts: FACES.map((f) => ({ src: fonts[f.kunci], fontWeight: f.fontWeight, fontStyle: f.fontStyle })),
  });
  terdaftar = kunci;
}
