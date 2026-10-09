// Program Hydroterapi master data: 3 chapters, 20 items — verbatim from the original document (brief §5D).
// Chapter 3 has no 'manfaat' column in the original.
import type { ProgramItemDef } from '../types.ts';

export interface BabDef { bab: 1 | 2 | 3; nama: string; namaInggris: string; kolomManfaat: boolean; kolomAktivitas: string; kolomTarget: string }

export const BAB_PROGRAM: readonly BabDef[] = [
  { bab: 1, nama: 'Adaptasi Air', namaInggris: 'Water Familiarization', kolomManfaat: true, kolomAktivitas: 'Aktivitas', kolomTarget: 'Target Refleks' },
  { bab: 2, nama: 'Stabilitas Inti', namaInggris: 'Core Stability', kolomManfaat: true, kolomAktivitas: 'Posisi & Aktivitas', kolomTarget: 'Target Refleks' },
  { bab: 3, nama: 'Wet Move to Learn', namaInggris: 'Wet Move to Learn', kolomManfaat: false, kolomAktivitas: 'Aktivitas', kolomTarget: 'Target Reflex Integration' },
];

export const PROGRAM: readonly ProgramItemDef[] = [
  { id: 'b1.feelingWater', bab: 1, no: 1, aktivitas: 'Feeling the Water (Walking, Crawling, Sitting, Kicking, Swinging)', targetRefleks: 'Moro Reflex', manfaat: 'Mengurangi kecemasan, meningkatkan rasa aman & nyaman di air, melatih toleransi sensorik' },
  { id: 'b1.mouthIn', bab: 1, no: 2, aktivitas: 'Mouth in (Blowing bubbles)', targetRefleks: 'Moro Reflex, Rooting/Sucking Reflex', manfaat: 'Melatih kontrol pernapasan, mempersiapkan koordinasi napas untuk berenang, mengurangi refleks mengemut' },
  { id: 'b1.faceIn', bab: 1, no: 3, aktivitas: 'Face in (Full face immersion)', targetRefleks: 'Moro Reflex, Rooting Reflex, Diving Reflex', manfaat: 'Meningkatkan kepercayaan diri, melatih toleransi sensorik wajah terhadap air' },
  { id: 'b1.comfortSplashing', bab: 1, no: 4, aktivitas: 'Comfort with splashing', targetRefleks: 'Moro Reflex, Tactile Defensiveness', manfaat: 'Desensitisasi terhadap sentuhan tak terduga, meningkatkan toleransi sensorik' },
  { id: 'b1.toleranceTemperature', bab: 1, no: 5, aktivitas: 'Tolerance to water temperature', targetRefleks: 'Moro Reflex', manfaat: 'Adaptasi terhadap perubahan sensori, regulasi sistem saraf' },

  { id: 'b2.liftHead', bab: 2, no: 1, posisi: 'PRONE (Tummy):', aktivitas: 'Lift head with kickboard', targetRefleks: 'TLR', manfaat: 'Menguatkan otot leher & punggung, meningkatkan kontrol kepala, stabilitas untuk pernapasan' },
  { id: 'b2.starfishFloat', bab: 2, no: 2, posisi: 'PRONE (Tummy):', aktivitas: 'Starfish float with noodle', targetRefleks: 'TLR, Moro Reflex', manfaat: 'Melatih keseimbangan anti-gravitasi, kepercayaan diri di posisi horizontal' },
  { id: 'b2.kickingPropping', bab: 2, no: 3, posisi: 'PRONE (Tummy):', aktivitas: 'Kicking while propping', targetRefleks: 'TLR, Spinal Galant', manfaat: 'Koordinasi kaki bilateral, kekuatan otot inti, inhibisi refleks hip fleksi' },
  { id: 'b2.backFloatingSupport', bab: 2, no: 4, posisi: 'SUPINE (Back):', aktivitas: 'Back floating with support', targetRefleks: 'TLR, Moro Reflex', manfaat: 'Relaksasi sistem saraf, kepercayaan diri di posisi rentan, regulasi vestibular' },
  { id: 'b2.legsExtension', bab: 2, no: 5, posisi: 'SUPINE (Back):', aktivitas: 'Legs extension with support', targetRefleks: 'TLR, Spinal Galant', manfaat: 'Kekuatan otot perut, stabilitas pelvis, kontrol postural' },
  { id: 'b2.sunflower', bab: 2, no: 6, posisi: 'SUPINE (Back):', aktivitas: 'Sunflower exercise', targetRefleks: 'TLR, ATNR, STNR', manfaat: 'Koordinasi cross-lateral, integrasi bilateral, kekuatan otot inti' },

  { id: 'b3.rolling', bab: 3, no: 1, aktivitas: 'Rolling', targetRefleks: 'ATNR, STNR, Neck/Body Righting Reaction' },
  { id: 'b3.gliding', bab: 3, no: 2, aktivitas: 'Gliding', targetRefleks: 'TLR, ATNR, STNR' },
  { id: 'b3.unilateralFlipFlops', bab: 3, no: 3, aktivitas: 'Unilateral Flip Flops', targetRefleks: 'ATNR, Amphibian Reflex' },
  { id: 'b3.crossPatternFlipFlops', bab: 3, no: 4, aktivitas: 'Cross Pattern Flip Flops', targetRefleks: 'ATNR, Amphibian Reflex, Body/Neck Righting Reaction' },
  { id: 'b3.stomachCrawling', bab: 3, no: 5, aktivitas: 'Stomach Crawling', targetRefleks: 'Palmar, Plantar, TLR, Spinal Galant' },
  { id: 'b3.backCrawling', bab: 3, no: 6, aktivitas: 'Back Crawling', targetRefleks: 'TLR, Spinal Galant, Amphibian Reflex' },
  { id: 'b3.rocking', bab: 3, no: 7, aktivitas: 'Rocking', targetRefleks: 'STNR, Palmar' },
  { id: 'b3.crossPatternWalking', bab: 3, no: 8, aktivitas: 'Cross Pattern Walking', targetRefleks: 'Integrated Reflexes' },
  { id: 'b3.crossPatternUnilateralCrawling', bab: 3, no: 9, aktivitas: 'Cross Pattern Unilateral Crawling', targetRefleks: 'ATNR, Amphibian Reflex, Body/Neck Righting Reaction, Palmar and Rooting reflex muscle tone' },
];

/** Master items followed by custom items, sorted by chapter then number. */
export function semuaItemProgram(tambahan: readonly ProgramItemDef[] = []): ProgramItemDef[] {
  return [...PROGRAM, ...tambahan].sort((a, b) => a.bab - b.bab || a.no - b.no);
}

/** Display name: position prefix + activity, e.g. 'PRONE (Tummy): Lift head with kickboard'. */
export const namaItemProgram = (d: ProgramItemDef): string => (d.posisi ? `${d.posisi} ${d.aktivitas}` : d.aktivitas);
