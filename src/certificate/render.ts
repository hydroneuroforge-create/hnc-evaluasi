// renderSertifikatPdf: same code path as the report (Node and browsers) — pdf(doc).toBlob() -> Uint8Array.
import { createElement, type ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import type { SertifikatSiap } from '../core/index.ts';
import type { AsetRender } from '../report/aset.ts';
import { registerFonts } from '../report/fonts.ts';
import { renderDokumen } from '../report/render.ts';
import { SertifikatDocument, type VarianSertifikat } from './SertifikatDocument.tsx';

export interface OpsiSertifikat {
  /** 'a4' (A4 landscape, default) or 'sosial' (540×675 pt; rasterise at zoom 2 for a 1080×1350 PNG). */
  varian?: VarianSertifikat;
  /** Real signatures; default true for 'a4', false for 'sosial'. */
  tandaTangan?: boolean;
}

export async function renderSertifikatPdf(siap: SertifikatSiap, aset: AsetRender, opsi: OpsiSertifikat = {}): Promise<Uint8Array> {
  registerFonts(aset.fonts);
  return renderDokumen(createElement(SertifikatDocument, { siap, aset, ...opsi }) as unknown as ReactElement<DocumentProps>);
}
