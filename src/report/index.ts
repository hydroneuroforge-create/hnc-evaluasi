// Public API of the report renderer (browser-safe: imports only react, @react-pdf/renderer and src/).
export type { AsetRender, FaceKey } from './aset.ts';
export { FACES, registerFonts, type FaceFont } from './fonts.ts';
export * from './theme.ts';
export { renderDokumen, renderLaporanPdf, type OpsiRender } from './render.ts';
export { BAGIAN, LaporanDocument, type BagianId, type LaporanDocumentProps } from './LaporanDocument.tsx';
export * from './charts/index.ts';
export { TeksKaya, runsDari } from './components/TeksKaya.tsx';
export { Kartu } from './components/Kartu.tsx';
export { ChipStatus, Pil } from './components/ChipStatus.tsx';
export { Titik, type Waktu } from './components/Titik.tsx';
export { Bintang, titikBintang } from './components/Bintang.tsx';
export { Medali, IkonFokus } from './components/Medali.tsx';
export { JudulBagian, SubJudul, Label } from './components/JudulBagian.tsx';
export { Kop } from './components/Kop.tsx';
export { Footer, TEKS_RAHASIA } from './components/Footer.tsx';
export { HalamanIsi, Spanduk, gayaHalaman, type PropsBagian } from './components/Halaman.tsx';
