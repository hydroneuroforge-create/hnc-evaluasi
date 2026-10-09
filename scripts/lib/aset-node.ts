// Builds the AsetRender object from disk for Node scripts (D4). Fonts and logos come from the repo; signatures
// come from the private directory (HNC_TTD) and are only ever passed in at render time.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { KunciPenandatangan } from '../../src/core/index.ts';
import { FACES, type AsetRender, type FaceKey } from '../../src/report/index.ts';
import { DIR_REPO, DIR_TTD } from './jalur.ts';

export const DIR_ASET = join(DIR_REPO, 'assets');

export const dataUri = (berkas: string, mime: string): string => `data:${mime};base64,${readFileSync(berkas).toString('base64')}`;

/** Signature file per signatory (private). */
export const BERKAS_TTD: Record<KunciPenandatangan, string> = {
  fisioterapis: join(DIR_TTD, 'ttd-prasasti.png'),
  terapis: join(DIR_TTD, 'ttd-syaif.png'),
};

export function bacaAset(opsi: { ttd?: boolean; fontSebagaiDataUri?: boolean } = {}): AsetRender {
  const fonts = {} as Record<FaceKey, string>;
  for (const f of FACES) {
    const berkas = join(DIR_ASET, 'fonts', f.berkas);
    fonts[f.kunci] = opsi.fontSebagaiDataUri ? dataUri(berkas, 'font/ttf') : berkas;
  }
  const ttd: AsetRender['ttd'] = {};
  if (opsi.ttd !== false) {
    for (const [kunci, berkas] of Object.entries(BERKAS_TTD) as [KunciPenandatangan, string][]) {
      if (existsSync(berkas)) ttd[kunci] = dataUri(berkas, 'image/png');
      else console.warn(`peringatan: tanda tangan tidak ditemukan (${berkas}); baris tanda tangan dibiarkan kosong`);
    }
  }
  return {
    fonts,
    logoLockup: dataUri(join(DIR_ASET, 'logo-center-lockup.png'), 'image/png'),
    logoMark: dataUri(join(DIR_ASET, 'logo-center-mark.png'), 'image/png'),
    logoYasi: dataUri(join(DIR_ASET, 'logo-yasi.png'), 'image/png'),
    ttd,
  };
}
