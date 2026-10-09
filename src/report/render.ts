// renderLaporanPdf: one code path for Node and browsers — pdf(doc).toBlob() -> Uint8Array.
import { pdf } from '@react-pdf/renderer';
import { Buffer as BufferPolyfill } from 'buffer';
import { createElement, type ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import type { LaporanSiap } from '../core/index.ts';
import type { AsetRender } from './aset.ts';
import { registerFonts } from './fonts.ts';
import { LaporanDocument, type BagianId } from './LaporanDocument.tsx';

export interface OpsiRender {
  bagian?: readonly BagianId[];
  spanduk?: string;
}

// R8: @react-pdf/layout reads the global `Buffer` to set image cache keys; without it (browsers) every page
// re-embeds the logo and the PDF grows ~5x. Provide it once when missing.
const g = globalThis as { Buffer?: unknown };
if (typeof g.Buffer === 'undefined') g.Buffer = BufferPolyfill;

/** Renders any react-pdf <Document> element to bytes (shared with the certificate). */
export async function renderDokumen(doc: Parameters<typeof pdf>[0]): Promise<Uint8Array> {
  const blob = await pdf(doc).toBlob();
  return new Uint8Array(await blob.arrayBuffer());
}

export async function renderLaporanPdf(siap: LaporanSiap, aset: AsetRender, opsi: OpsiRender = {}): Promise<Uint8Array> {
  registerFonts(aset.fonts);
  // LaporanDocument renders a <Document> root, which is what pdf() expects.
  return renderDokumen(createElement(LaporanDocument, { siap, aset, ...opsi }) as unknown as ReactElement<DocumentProps>);
}
