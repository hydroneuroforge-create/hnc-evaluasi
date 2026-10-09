// Glossary (conservative, plain language). All [BARU]; needs clinical review.
import type { TeksBank } from '../types.ts';

const B = (teks: string): TeksBank => ({ teks, sumber: 'BARU' });

export interface EntriGlosarium { istilah: string; definisi: TeksBank }

export const GLOSARIUM: readonly EntriGlosarium[] = [
  { istilah: 'ATNR (_Asymmetrical Tonic Neck Reflex_)', definisi: B('Refleks bayi ketika kepala menoleh ke satu sisi, lengan dan kaki di sisi tersebut cenderung lurus sementara sisi lainnya menekuk. Bila belum terintegrasi, dapat memengaruhi koordinasi mata-tangan dan gerakan menyilang garis tengah tubuh.') },
  { istilah: 'STNR (_Symmetrical Tonic Neck Reflex_)', definisi: B('Refleks yang menghubungkan gerakan kepala menunduk atau menengadah dengan tekukan lengan dan kaki. Berperan dalam postur duduk, merangkak, dan koordinasi tubuh bagian atas dan bawah.') },
  { istilah: 'TLR (_Tonic Labyrinthine Reflex_)', definisi: B('Refleks yang berkaitan dengan posisi kepala terhadap gravitasi. Berpengaruh pada keseimbangan, tonus otot, dan orientasi tubuh.') },
  { istilah: 'Moro', definisi: B('Refleks kejut alami pada bayi sebagai respons terhadap rangsangan mendadak. Bila masih menonjol, anak dapat lebih mudah terkejut, cemas, atau sulit menenangkan diri.') },
  { istilah: 'Palmar Grasp', definisi: B('Refleks menggenggam ketika telapak tangan disentuh. Integrasinya mendukung keterampilan motorik halus, seperti memegang alat tulis.') },
  { istilah: 'Plantar & Babinski', definisi: B('Refleks pada telapak kaki ketika disentuh. Integrasinya mendukung keseimbangan, pijakan kaki, dan pola berjalan.') },
  { istilah: 'Spinal Galant', definisi: B('Refleks ketika area punggung di samping tulang belakang disentuh, tubuh cenderung melengkung ke sisi tersebut. Bila masih menonjol, anak dapat tampak gelisah saat duduk.') },
  { istilah: 'Sucking & Rooting', definisi: B('Refleks menghisap dan mencari sumber sentuhan di sekitar mulut. Integrasinya berkaitan dengan kontrol otot mulut, makan, dan berbicara.') },
  { istilah: 'Amphibian Reflex', definisi: B('Refleks yang membantu gerakan menekuk panggul dan lutut secara terpisah pada tiap sisi tubuh. Berperan dalam gerak merangkak dan pola gerak kaki yang terkoordinasi.') },
  { istilah: 'Diving Reflex', definisi: B('Respons perlindungan alami tubuh ketika wajah terkena air, misalnya menahan napas secara spontan. Diharapkan berfungsi secara adaptif dan tidak berlebihan.') },
  { istilah: 'Sistem vestibular', definisi: B('Sistem keseimbangan di telinga bagian dalam yang membantu tubuh merasakan gerakan, kecepatan, dan posisi kepala.') },
  { istilah: 'Sistem taktil', definisi: B('Sistem perasa kulit yang mengolah sentuhan, tekanan, suhu, dan tekstur.') },
  { istilah: 'Sistem proprioseptif', definisi: B('Sistem yang membantu tubuh merasakan posisi sendi dan otot, sehingga gerakan dan kekuatan dapat diatur dengan tepat.') },
  { istilah: 'Otot inti (_core muscle_)', definisi: B('Kelompok otot perut, punggung, dan panggul yang menjaga tubuh tetap stabil dan tegak.') },
  { istilah: '_Water trap_', definisi: B('Kemampuan mempertahankan posisi tubuh tetap stabil di kolam dalam dengan gerakan tangan dan kaki yang terkoordinasi.') },
  { istilah: '_Back floating_', definisi: B('Mengapung dalam posisi telentang di permukaan air.') },
  { istilah: '_Prone_ / _Supine_', definisi: B('_Prone_ berarti posisi tengkurap; _supine_ berarti posisi telentang.') },
  { istilah: '_Crossing midline_', definisi: B('Kemampuan menggerakkan tangan atau kaki melewati garis tengah tubuh, misalnya tangan kanan meraih benda di sisi kiri.') },
  { istilah: 'Integrasi refleks', definisi: B('Proses ketika refleks primitif bayi secara bertahap terkendali oleh sistem saraf, sehingga gerakan menjadi lebih sadar dan terarah.') },
  { istilah: 'Program Individual', definisi: B('Gerakan yang dirancang khusus untuk anak tertentu setelah konsultasi dengan fisioterapis, di luar materi program standar.') },
];
