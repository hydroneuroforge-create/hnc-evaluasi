// The 3 sensory systems ('English / Indonesian' label pattern; spelling per owner decision).
import type { SensoriId } from '../types.ts';

export interface SensoriDef { id: SensoriId; no: number; nama: string; namaInggris: string; namaIndonesia: string }

export const SENSORI: readonly SensoriDef[] = [
  { id: 'vestibular', no: 1, nama: 'Vestibular / Keseimbangan', namaInggris: 'Vestibular', namaIndonesia: 'Keseimbangan' },
  { id: 'taktil', no: 2, nama: 'Tactile / Perasa Kulit', namaInggris: 'Tactile', namaIndonesia: 'Perasa Kulit' },
  { id: 'proprioseptif', no: 3, nama: 'Proprioceptive / Tonus Otot', namaInggris: 'Proprioceptive', namaIndonesia: 'Tonus Otot' },
];

export const sensoriDef = (id: SensoriId): SensoriDef => SENSORI.find((s) => s.id === id)!;
