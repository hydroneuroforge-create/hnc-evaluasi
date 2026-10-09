// The 8 radar domains (brief §8, PLAN.md §7). Order = display order and highlight tie-break order.
import type { KegiatanId } from '../types.ts';

export type DomainId = 'emosi' | 'komunikasi' | 'pemahaman' | 'motorik' | 'stabilitas' | 'sensori' | 'refleks' | 'akuatik';

export interface DomainDef {
  id: DomainId;
  nama: string;
  /** Short radar label. */
  namaSingkat: string;
  /** Kegiatan members; the sensori/refleks/akuatik domains pool their whole area. */
  kegiatan?: readonly KegiatanId[];
  area?: 'sensori' | 'refleks' | 'program';
}

export const DOMAIN: readonly DomainDef[] = [
  { id: 'emosi', nama: 'Emosi & Perilaku', namaSingkat: 'Emosi & Perilaku', kegiatan: ['responEkspresi'] },
  { id: 'komunikasi', nama: 'Komunikasi & Interaksi', namaSingkat: 'Komunikasi', kegiatan: ['eyeContact', 'reaksiVerbal'] },
  { id: 'pemahaman', nama: 'Pemahaman Instruksi', namaSingkat: 'Pemahaman Instruksi', kegiatan: ['pemahamanInstruksi'] },
  { id: 'motorik', nama: 'Motorik', namaSingkat: 'Motorik', kegiatan: ['motorikTangan', 'motorikKaki', 'berjalanMajuMundur', 'kakiAyun', 'bahu'] },
  { id: 'stabilitas', nama: 'Stabilitas Inti & Postur', namaSingkat: 'Stabilitas Inti', kegiatan: ['kekuatanLeher', 'proning', 'ototInti', 'posturTulangBelakang', 'backFloating'] },
  { id: 'sensori', nama: 'Integrasi Sensori', namaSingkat: 'Integrasi Sensori', area: 'sensori' },
  { id: 'refleks', nama: 'Integrasi Refleks', namaSingkat: 'Integrasi Refleks', area: 'refleks' },
  { id: 'akuatik', nama: 'Keterampilan Akuatik', namaSingkat: 'Keterampilan Akuatik', area: 'program' },
];

export const domainKegiatan = (id: KegiatanId): DomainDef => {
  const d = DOMAIN.find((x) => x.kegiatan?.includes(id));
  if (!d) throw new Error(`kegiatan ${id} tidak termasuk domain mana pun`);
  return d;
};
