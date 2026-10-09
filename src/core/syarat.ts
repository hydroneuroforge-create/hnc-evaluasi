// Conditions used by reflex evidence passages/phrases and recommendation triggers.
// Every condition reads the scale definitions (no direction logic here).
import { kegiatanDef, tambahanKegiatan } from './master/kegiatan.ts';
import { PROGRAM } from './master/program.ts';
import { refleksDef } from './master/refleks.ts';
import { sensoriDef } from './master/sensori.ts';
import { itemMembaik } from './skor.ts';
import { peringkat, terbaik, type DefinisiSkala, type SetSkala } from './skala.ts';
import type { KegiatanId, LaporanInput, Level, NilaiKegiatan, ProgramItemDef, RefleksId, SensoriId } from './types.ts';

/** 'kegiatan:<id>' | 'sensori:<id>' | 'refleks:<id>' | 'program:<itemId>' */
export type RefItem = `kegiatan:${KegiatanId}` | `sensori:${SensoriId}` | `refleks:${RefleksId}` | `program:${string}`;

export type Syarat =
  /** Improved, or BEFORE not observed and AFTER rank >= 3. */
  | { membaik: RefItem }
  /** AFTER rank >= nilai. */
  | { minimal: RefItem; nilai: Level }
  /** AFTER observed and below the best level. */
  | { belumTerbaik: RefItem }
  /** Add-on '<kegiatan>.<addon>' selected at AFTER. */
  | { tambahan: `${KegiatanId}.${string}` }
  /** Slot '<kegiatan>.<slot>' filled at AFTER. */
  | { slot: `${KegiatanId}.${string}` }
  | { salahSatu: Syarat[] };

export interface KonteksSyarat { input: LaporanInput; set: SetSkala; itemProgram: readonly ProgramItemDef[] }

const pecah = (r: RefItem): [string, string] => {
  const i = r.indexOf(':');
  return [r.slice(0, i), r.slice(i + 1)];
};

function nilaiItem(k: KonteksSyarat, r: RefItem): { s: DefinisiSkala; sebelum: NilaiKegiatan | Level | null | undefined; sesudah: NilaiKegiatan | Level | null | undefined } {
  const [area, id] = pecah(r);
  const { sebelum: b, sesudah: a } = k.input;
  switch (area) {
    case 'kegiatan': return { s: k.set.skala.kegiatan, sebelum: b.kegiatan[id as KegiatanId]?.level, sesudah: a.kegiatan[id as KegiatanId]?.level };
    case 'sensori': return { s: k.set.skala.sensori, sebelum: b.sensori[id as SensoriId], sesudah: a.sensori[id as SensoriId] };
    case 'refleks': return { s: k.set.skala.refleks, sebelum: b.refleks[id as RefleksId], sesudah: a.refleks[id as RefleksId] };
    case 'program': return { s: k.set.skala.program, sebelum: b.program[id], sesudah: a.program[id] };
    default: throw new Error(`syarat: area tidak dikenal "${area}"`);
  }
}

const ada = (v: unknown): v is Level => typeof v === 'number';

export function cekSyarat(s: Syarat, k: KonteksSyarat): boolean {
  if ('salahSatu' in s) return s.salahSatu.some((x) => cekSyarat(x, k));
  if ('membaik' in s) { const n = nilaiItem(k, s.membaik); return itemMembaik(n.s, n.sebelum, n.sesudah); }
  if ('minimal' in s) { const n = nilaiItem(k, s.minimal); return ada(n.sesudah) && peringkat(n.s, n.sesudah) >= s.nilai; }
  if ('belumTerbaik' in s) { const n = nilaiItem(k, s.belumTerbaik); return ada(n.sesudah) && n.sesudah !== terbaik(n.s); }
  if ('tambahan' in s) {
    const [kg, id] = s.tambahan.split('.') as [KegiatanId, string];
    return k.input.sesudah.kegiatan[kg]?.tambahan?.includes(id) ?? false;
  }
  const [kg, id] = s.slot.split('.') as [KegiatanId, string];
  const v = k.input.sesudah.kegiatan[kg]?.slot?.[id];
  return typeof v === 'string' && v.trim() !== '';
}

export const semuaSyarat = (xs: readonly Syarat[], k: KonteksSyarat) => xs.every((x) => cekSyarat(x, k));

// --- plain-language description (review doc) --------------------------------------------------------------
const namaRef = (r: RefItem): string => {
  const [area, id] = pecah(r);
  if (area === 'kegiatan') return `kegiatan “${kegiatanDef(id as KegiatanId).nama.replace(/_/g, '')}”`;
  if (area === 'sensori') return `sistem “${sensoriDef(id as SensoriId).nama}”`;
  if (area === 'refleks') return `refleks “${refleksDef(id as RefleksId).namaKalimat}”`;
  const p = PROGRAM.find((x) => x.id === id);
  return `aktivitas program “${p ? (p.posisi ? `${p.posisi} ${p.aktivitas}` : p.aktivitas) : id}”`;
};

export function jelaskanSyarat(s: Syarat): string {
  if ('salahSatu' in s) return `salah satu dari: ${s.salahSatu.map(jelaskanSyarat).join('; ')}`;
  if ('membaik' in s) return `${namaRef(s.membaik)} membaik (atau baru teramati dengan level ≥ 3)`;
  if ('minimal' in s) return `${namaRef(s.minimal)} minimal pada tingkat ${s.nilai} (urutan perkembangan)`;
  if ('belumTerbaik' in s) return `${namaRef(s.belumTerbaik)} belum mencapai tingkat terbaik`;
  if ('tambahan' in s) {
    const [kg, id] = s.tambahan.split('.') as [KegiatanId, string];
    const t = tambahanKegiatan(kg).find((x) => x.id === id);
    return `kalimat tambahan “${t?.label ?? id}” dipilih pada ${namaRef(`kegiatan:${kg}`)}`;
  }
  const [kg, id] = s.slot.split('.') as [KegiatanId, string];
  const sl = kegiatanDef(kg).slot.find((x) => x.id === id);
  return `isian “${sl?.label ?? id}” pada ${namaRef(`kegiatan:${kg}`)} diisi`;
}
