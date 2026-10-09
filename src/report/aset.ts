// Render-time assets (D4). src/ never reads files: the caller passes fonts, logos and signatures in as strings
// (data URIs, or any source react-pdf accepts for fonts). Signatures are runtime inputs only.
import type { KunciPenandatangan } from '../core/index.ts';

export type FaceKey =
  | 'light' | 'regular' | 'italic' | 'medium' | 'semibold' | 'semiboldItalic' | 'bold' | 'boldItalic' | 'extrabold';

export interface AsetRender {
  /** One font source per face (see FACES in fonts.ts). */
  fonts: Record<FaceKey, string>;
  /** Full logo lockup (assets/logo-center-lockup.png) as a data URI. */
  logoLockup: string;
  /** Logo symbol only (assets/logo-center-mark.png) as a data URI, used in the kop. */
  logoMark: string;
  /** Transparent signature PNGs as data URIs; a missing one renders an empty signing line. */
  ttd: Partial<Record<KunciPenandatangan, string>>;
}
