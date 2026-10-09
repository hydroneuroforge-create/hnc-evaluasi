// Lazily loaded PDF chunk: core view model + react-pdf renderers + locally bundled fonts/logos (precached).
import { siapkanLaporan, siapkanSertifikat, type KunciPenandatangan, type LaporanInput } from '../../src/core/index.ts';
import { renderSertifikatPdf } from '../../src/certificate/index.ts';
import { FACES, renderLaporanPdf, type AsetRender, type FaceKey } from '../../src/report/index.ts';
import logoLockupUrl from '../../assets/logo-center-lockup.png?url';
import logoMarkUrl from '../../assets/logo-center-mark.png?url';

const fontUrl = import.meta.glob('../../assets/fonts/*.ttf', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

async function keDataUri(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((ok, gagal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => gagal(r.error);
    r.readAsDataURL(blob);
  });
}

let asetDasar: Promise<Omit<AsetRender, 'ttd'>> | null = null;
function muatAset(): Promise<Omit<AsetRender, 'ttd'>> {
  asetDasar ??= (async () => {
    const fonts = {} as Record<FaceKey, string>;
    for (const f of FACES) {
      const url = Object.entries(fontUrl).find(([k]) => k.endsWith(`/${f.berkas}`))?.[1];
      if (!url) throw new Error(`font ${f.berkas} tidak ditemukan`);
      fonts[f.kunci] = new URL(url, location.href).href;
    }
    const [logoLockup, logoMark] = await Promise.all([keDataUri(logoLockupUrl), keDataUri(logoMarkUrl)]);
    return { fonts, logoLockup, logoMark };
  })();
  asetDasar.catch(() => { asetDasar = null; });
  return asetDasar;
}

export type Ttd = Partial<Record<KunciPenandatangan, string>>;

export async function buatPdfLaporan(input: LaporanInput, ttd: Ttd): Promise<Uint8Array> {
  const siap = siapkanLaporan(input);
  return renderLaporanPdf(siap, { ...(await muatAset()), ttd });
}

export async function buatPdfSertifikat(input: LaporanInput, ttd: Ttd, varian: 'a4' | 'sosial'): Promise<Uint8Array> {
  const siap = siapkanSertifikat(input);
  return renderSertifikatPdf(siap, { ...(await muatAset()), ttd }, { varian, tandaTangan: varian === 'a4' });
}
