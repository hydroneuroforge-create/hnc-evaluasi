// The 10 primitive reflexes of the Central Nervous System table.
import type { RefleksId } from '../types.ts';

export interface RefleksDef {
  id: RefleksId;
  no: number;
  /** CNS table name (markup; English long names in italics). */
  namaTabel: string;
  /** Name inside the generated Summary (markup, DOCX italics). */
  namaRingkasan: string;
  /** Heading of the 'Gambaran Perkembangan' card. */
  judulGambaran: string;
  /** Name used inside generic sentences ('Pada refleks {nama}, …'). */
  namaKalimat: string;
}

export const REFLEKS: readonly RefleksDef[] = [
  { id: 'atnr', no: 1, namaTabel: 'ATNR – _Asymmetrical Tonic Neck Reflex_', namaRingkasan: 'ATNR', judulGambaran: 'ATNR', namaKalimat: 'ATNR' },
  { id: 'stnr', no: 2, namaTabel: 'STNR – _Symmetrical Tonic Neck Reflex_', namaRingkasan: 'STNR', judulGambaran: 'STNR', namaKalimat: 'STNR' },
  { id: 'tlr', no: 3, namaTabel: 'TLR – _Tonic Labyrinthine Reflex_', namaRingkasan: 'TLR', judulGambaran: 'TLR', namaKalimat: 'TLR' },
  { id: 'palmarGrasp', no: 4, namaTabel: 'Palmar Grasp', namaRingkasan: '_Palmar Grasp_', judulGambaran: 'Palmar Grasp', namaKalimat: 'Palmar Grasp' },
  { id: 'plantarBabinski', no: 5, namaTabel: 'Plantar & Babinski', namaRingkasan: '_Plantar & Babinski_', judulGambaran: 'Plantar & Babinski Reflex', namaKalimat: 'Plantar & Babinski' },
  { id: 'moro', no: 6, namaTabel: 'Moro', namaRingkasan: 'Moro', judulGambaran: 'Moro Reflex', namaKalimat: 'Moro' },
  { id: 'spinalGalant', no: 7, namaTabel: 'Spinal Galant', namaRingkasan: '_Spinal Galant_', judulGambaran: 'Spinal Galant', namaKalimat: 'Spinal Galant' },
  { id: 'suckingRooting', no: 8, namaTabel: 'Sucking & Rooting', namaRingkasan: '_Sucking & Rooting_', judulGambaran: 'Sucking & Rooting', namaKalimat: 'Sucking & Rooting' },
  { id: 'amphibian', no: 9, namaTabel: 'Amphibian Reflex', namaRingkasan: '_Amphibian Reflex_', judulGambaran: 'Amphibian Reflex', namaKalimat: 'Amphibian' },
  { id: 'diving', no: 10, namaTabel: 'Diving Reflex', namaRingkasan: '_Diving Reflex_', judulGambaran: 'Diving Reflex', namaKalimat: 'Diving' },
];

export const refleksDef = (id: RefleksId): RefleksDef => REFLEKS.find((r) => r.id === id)!;
