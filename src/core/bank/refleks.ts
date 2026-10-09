// Reflex 'Gambaran Perkembangan' bank (PLAN.md §6.2). Blocks in order: pembuka, keterangan, bukti, catatan
// (input), manfaat, saran, penutup. Tokens: {nama} {anandaPanggilan} {sebelum} {sesudah} {kataArah} and kegiatan
// slots such as {ototInti.durasi}; flags: bukanTerbaik / terbaik.
import type { Syarat } from '../syarat.ts';
import type { RefleksId, TeksBank } from '../types.ts';

const D = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'DOKUMEN', ...(catatan ? { catatan } : {}) });
const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export type KelasPerubahan = 'membaik1' | 'membaik2' | 'membaik3' | 'tetapTerbaik' | 'tetapBelum' | 'memburuk';

export interface FrasaBukti { teks: TeksBank; syarat: Syarat[] }

export interface RefleksBank {
  /** Per-reflex DOKUMEN openings, overriding the generic one for that class. */
  pembuka?: Partial<Record<KelasPerubahan, TeksBank>>;
  /** Use the per-reflex opening even when AFTER is the best level (its wording makes no 'masih muncul' claim). */
  pembukaSaatTerbaik?: boolean;
  /** Extra explanation after the opening (Diving, when improved). */
  keterangan?: TeksBank;
  /** Verbatim evidence passage, used only when ALL conditions hold. */
  bukti?: { teks: TeksBank; syarat: Syarat[] };
  /** [BARU] evidence phrases for the fallback 'Perkembangan ini terlihat dari …'. */
  frasa: FrasaBukti[];
  manfaat?: TeksBank;
  saran?: TeksBank;
  penutup?: TeksBank;
}

export const PENGANTAR_GAMBARAN = D('Berikut adalah gambaran perkembangan penanganan refleks-refleks primitif yang sebelumnya masih muncul, dan berkurang seiring dengan adanya penanganan terapi:');

// At the best level the closing PENUTUP_TERBAIK carries the 'terkendali dengan baik' statement.
const ARTI = '[[#bukanTerbaik:, yang berarti refleks masih muncul namun intensitasnya berkurang]]';

export const PEMBUKA_UMUM: Record<KelasPerubahan, TeksBank> = {
  membaik1: B(`Pada refleks {nama}, {anandaPanggilan} menunjukkan kemajuan yang positif dengan {kataArah} nilai dari {sebelum} menjadi {sesudah}${ARTI}.`),
  membaik2: B(`Pada refleks {nama}, {anandaPanggilan} menunjukkan kemajuan sangat signifikan dengan {kataArah} nilai dari {sebelum} menjadi {sesudah}${ARTI}.`),
  membaik3: B('Pada refleks {nama}, {anandaPanggilan} menunjukkan kemajuan yang sangat signifikan dengan {kataArah} nilai dari {sebelum} menjadi {sesudah}.'),
  tetapTerbaik: B('Refleks {nama} sudah terkendali dengan baik sejak evaluasi awal (nilai {sebelum}) dan tetap bertahan pada nilai {sesudah}.', 'secara bawaan tidak dibuat paragraf; cukup disebut dalam Summary'),
  tetapBelum: B('Pada refleks {nama}, nilai {anandaPanggilan} tetap {sesudah} pada evaluasi awal maupun evaluasi lanjutan, sehingga refleks ini akan menjadi perhatian dalam program berikutnya.'),
  memburuk: B('Pada refleks {nama}, nilai {anandaPanggilan} tercatat {sebelum} pada evaluasi awal dan {sesudah} pada evaluasi lanjutan. Refleks ini akan menjadi perhatian dalam program berikutnya agar kontrolnya dapat kembali berkembang.'),
};

export const AWALAN_FRASA = B('Perkembangan ini terlihat dari {daftar}.', 'dipakai bila tidak semua syarat kutipan bukti dokumen terpenuhi');
export const PENUTUP_UMUM = B('Meski demikian, refleks {nama} belum terintegrasi sepenuhnya, sehingga diperlukan latihan yang konsisten agar kemajuan tetap bertambah dan menetap secara optimal.');
export const PENUTUP_TERBAIK = B('Refleks ini kini sudah terkendali dengan baik; latihan tetap dilanjutkan agar kemampuan ini menetap.', 'dipakai bila nilai sesudah adalah tingkat terbaik (bagian manfaat dilewati)');

const MEMBAIK_SEMUA = (t: TeksBank): Partial<Record<KelasPerubahan, TeksBank>> => ({ membaik1: t, membaik2: t, membaik3: t });

export const BANK_REFLEKS: Record<RefleksId, RefleksBank> = {
  atnr: {
    pembuka: { membaik1: D('Pada refleks ATNR, terlihat perhatian Ananda saat sesi terapi sudah mulai berkembang. {anandaPanggilan} menunjukkan perkembangan dari nilai {sebelum} menjadi {sesudah}, yang berarti refleks masih muncul namun intensitasnya berkurang.') },
    bukti: {
      teks: D('Perkembangan ini terlihat dari meningkatnya koordinasi mata-tangan, terbukti dari kemampuannya mempertahankan genggaman pada media hingga mencapai tujuan. Kemampuan gerakan menyilang garis tubuh (_crossing midline_) yang lebih teratur dan meningkat, konsistensi gerakan kaki bergantian, koordinasi bahu kanan-kiri yang mulai terintegrasi, serta ayunan kaki ke depan-belakang yang mulai semakin teratur, serta keseimbangan dan postur tubuh yang semakin stabil berkat penguatan otot inti yang memungkinkannya mempertahankan posisi stabil {ototInti.durasi} dan melakukan water trap di kolam dalam.'),
      syarat: [
        { membaik: 'kegiatan:motorikTangan' }, { membaik: 'program:b3.crossPatternWalking' }, { membaik: 'kegiatan:motorikKaki' },
        { membaik: 'kegiatan:bahu' }, { membaik: 'kegiatan:kakiAyun' }, { membaik: 'kegiatan:ototInti' },
        { slot: 'ototInti.durasi' }, { tambahan: 'ototInti.waterTrap' },
      ],
    },
    frasa: [
      { teks: B('meningkatnya koordinasi mata-tangan saat mempertahankan genggaman pada media'), syarat: [{ membaik: 'kegiatan:motorikTangan' }] },
      { teks: B('gerakan menyilang garis tengah tubuh (_crossing midline_) yang semakin teratur'), syarat: [{ membaik: 'program:b3.crossPatternWalking' }] },
      { teks: B('gerakan kaki bergantian yang semakin konsisten'), syarat: [{ membaik: 'kegiatan:motorikKaki' }] },
      { teks: B('koordinasi bahu kanan-kiri yang mulai terintegrasi'), syarat: [{ membaik: 'kegiatan:bahu' }] },
    ],
    manfaat: B('Jika refleks ATNR terintegrasi sempurna, Ananda akan lebih mudah mengoordinasikan gerakan mata, tangan, dan kedua sisi tubuh, misalnya saat menulis, membaca, maupun bermain bola.'),
    penutup: D('Meski demikian, refleks ATNR belum terintegrasi sempurna, sehingga diperlukan latihan yang konsisten agar kemajuan tetap bertambah dan menetap secara optimal.'),
  },

  stnr: {
    pembuka: { membaik1: D('Pada refleks STNR, Ananda menunjukkan perkembangan setelah melakukan terapi dari nilai {sebelum} menjadi {sesudah}, yang berarti refleks masih muncul namun intensitasnya berkurang.') },
    bukti: {
      teks: D('Perkembangan ini terlihat dari meningkatnya atensi selama sesi terapi, kemampuan koordinasi mata-tangan yang lebih baik, serta postur duduk yang mulai tegak dan stabil sehingga Ananda dapat belajar lebih tahan lama tanpa mudah lelah.'),
      syarat: [{ membaik: 'kegiatan:pemahamanInstruksi' }, { membaik: 'kegiatan:motorikTangan' }, { membaik: 'kegiatan:posturTulangBelakang' }],
    },
    frasa: [
      { teks: B('meningkatnya atensi selama sesi terapi'), syarat: [{ membaik: 'kegiatan:pemahamanInstruksi' }] },
      { teks: B('koordinasi mata-tangan yang lebih baik'), syarat: [{ membaik: 'kegiatan:motorikTangan' }] },
      { teks: B('postur tubuh yang semakin tegak dan stabil'), syarat: [{ membaik: 'kegiatan:posturTulangBelakang' }] },
    ],
    manfaat: D('Jika refleks STNR terintegrasi sempurna, Ananda akan mampu melakukan koordinasi mata-tangan secara efisien dalam berbagai aktivitas seperti tugas kreatif, praktikum, dan olahraga, serta lebih mandiri dalam navigasi dan organisasi.'),
    penutup: D('Meski demikian, refleks STNR belum terintegrasi sepenuhnya, sehingga diperlukan latihan yang konsisten agar kemajuan tetap bertambah dan menetap secara optimal.'),
  },

  tlr: {
    pembuka: { membaik1: D('Pada refleks TLR, {anandaPanggilan} menunjukkan perkembangan dari nilai {sebelum} menjadi {sesudah}.', 'nama anak lain pada dokumen asli diganti token nama') },
    bukti: {
      teks: D('Kemajuan ini terlihat dari meningkatnya keseimbangan dan orientasi tubuh terhadap gravitasi semakin baik, ditandai dengan kemampuannya mempertahankan postur stabil di air selama {ototInti.durasi} serta keberhasilan melakukan water trap di kolam dalam. Koordinasi tubuh yang terintegrasi, terlihat dari konsistensi gerakan kaki bergantian, keseimbangan bahu kanan-kiri yang semakin simetris, serta kemampuan berjalan maju-mundur dengan baik. Ananda juga mulai mampu memposisikan duduk dengan lebih tenang dan menunjukkan keberanian dalam posisi tengkurap hingga memasukkan kepala ke air.'),
      syarat: [
        { slot: 'ototInti.durasi' }, { tambahan: 'ototInti.waterTrap' }, { membaik: 'kegiatan:motorikKaki' }, { membaik: 'kegiatan:bahu' },
        { membaik: 'kegiatan:berjalanMajuMundur' }, { membaik: 'kegiatan:responEkspresi' }, { tambahan: 'proning.kepalaMasukAir' },
      ],
    },
    frasa: [
      { teks: B('postur tubuh yang semakin stabil di dalam air'), syarat: [{ membaik: 'kegiatan:ototInti' }] },
      { teks: B('gerakan kaki bergantian yang semakin konsisten'), syarat: [{ membaik: 'kegiatan:motorikKaki' }] },
      { teks: B('keseimbangan bahu kanan-kiri yang semakin simetris'), syarat: [{ membaik: 'kegiatan:bahu' }] },
      { teks: B('kemampuan berjalan maju-mundur dengan baik'), syarat: [{ membaik: 'kegiatan:berjalanMajuMundur' }] },
      { teks: B('keberanian memasukkan kepala ke air dalam posisi tengkurap'), syarat: [{ tambahan: 'proning.kepalaMasukAir' }] },
    ],
    manfaat: D('Jika refleks TLR terintegrasi sempurna, Ananda akan memiliki keseimbangan stabil saat beraktivitas di permukaan tidak rata, orientasi tubuh yang baik sehingga tidak mudah pusing saat berguling, berputar, ataupun kegiatan yang melibatkan gravitasi, serta koordinasi terintegrasi yang mendukung kemampuan olahraga dan konsentrasi akademik.'),
    saran: D('Kegiatan seperti berjalan di garis lurus, bermain papan keseimbangan, atau outbound dapat semakin mengoptimalkan perkembangannya.'),
  },

  palmarGrasp: {
    pembuka: { membaik1: D('Pada refleks ini {anandaPanggilan} menunjukkan kemajuan yang positif dengan {kataArah} nilai dari {sebelum} menjadi {sesudah}, yang berarti refleks masih muncul namun intensitasnya berkurang.') },
    bukti: {
      teks: D('Perkembangan ini terlihat nyata dari peningkatan kekuatan genggaman tangan, di mana Ananda kini mampu mempertahankan genggaman pada media yang dipegang hingga mencapai tujuan yang diinstruksikan dengan tingkat fokus yang konsisten. Kemampuan ini mencerminkan koordinasi mata-tangan yang semakin matang, didukung pula oleh meningkatnya pemahaman instruksi (mampu mengikuti dua perintah berurutan) serta atensi yang lebih baik.'),
      syarat: [{ membaik: 'kegiatan:motorikTangan' }, { minimal: 'kegiatan:pemahamanInstruksi', nilai: 3 }],
    },
    frasa: [
      { teks: B('kekuatan genggaman tangan yang meningkat'), syarat: [{ membaik: 'kegiatan:motorikTangan' }] },
      { teks: B('pemahaman instruksi yang semakin baik'), syarat: [{ minimal: 'kegiatan:pemahamanInstruksi', nilai: 3 }] },
    ],
    manfaat: D('Jika refleks Palmar Grasp terintegrasi sempurna, Ananda akan memiliki keterampilan motorik halus yang optimal, seperti memegang alat tulis dengan benar, menulis dengan lancar, serta mengerjakan tugas-tugas kreatif yang membutuhkan ketangkasan tangan.'),
    penutup: D('Meski demikian, refleks Palmar Grasp belum sepenuhnya terintegrasi, sehingga diperlukan latihan yang konsisten agar kemajuan tetap bertambah dan menetap secara optimal.'),
  },

  plantarBabinski: {
    pembuka: { membaik2: D('Plantar dan Babinski {anandaPanggilan} menunjukkan kemajuan sangat signifikan dengan {kataArah} nilai dari {sebelum} menjadi {sesudah}.') },
    bukti: {
      teks: D('Perkembangan ini terlihat dari membaiknya keseimbangan dan stabilitas pergelangan kaki, ditandai dengan kemampuan mempertahankan postur stabil di air selama {ototInti.durasi}, berjalan maju-mundur dengan baik, serta konsistensi gerakan kaki bergantian dan ayunan kaki ke depan-belakang.'),
      syarat: [{ slot: 'ototInti.durasi' }, { membaik: 'kegiatan:berjalanMajuMundur' }, { membaik: 'kegiatan:motorikKaki' }, { membaik: 'kegiatan:kakiAyun' }],
    },
    frasa: [
      { teks: B('stabilitas postur di dalam air yang meningkat'), syarat: [{ membaik: 'kegiatan:ototInti' }] },
      { teks: B('kemampuan berjalan maju-mundur dengan baik'), syarat: [{ membaik: 'kegiatan:berjalanMajuMundur' }] },
      { teks: B('gerakan kaki bergantian yang semakin konsisten'), syarat: [{ membaik: 'kegiatan:motorikKaki' }] },
      { teks: B('ayunan kaki ke depan-belakang yang semakin teratur'), syarat: [{ membaik: 'kegiatan:kakiAyun' }] },
    ],
    manfaat: D('Jika terintegrasi sempurna, Ananda akan memiliki keseimbangan optimal dan koordinasi mata-kaki yang baik untuk berlari, melompat, maupun memakai sepatu dengan nyaman.'),
  },

  moro: {
    pembuka: MEMBAIK_SEMUA(D('Pada refleks Moro, Ananda mulai berkembang diperhatikan pada saat sesi terapi, Ananda kini lebih mampu meregulasi emosi dan sosial.', 'kata "Moro" disisipkan; dokumen asli tidak menyebut nama refleks')),
    pembukaSaatTerbaik: true,
    bukti: {
      teks: D('Dengan kemampuan ini memberikan ketenangan dalam menghadapi situasi baru, tidak mudah terkejut atau cemas, sabar dalam menyelesaikan tugas, serta tidak lagi impulsif atau agresif.'),
      syarat: [{ membaik: 'kegiatan:responEkspresi' }],
    },
    frasa: [
      { teks: B('respons emosi yang semakin tenang selama sesi'), syarat: [{ membaik: 'kegiatan:responEkspresi' }] },
      { teks: B('rasa aman dan nyaman di air yang meningkat'), syarat: [{ membaik: 'program:b1.feelingWater' }] },
    ],
    manfaat: D('Regulasi emosi yang matang memungkinkannya untuk membangun relasi positif dalam sosial, berkonsentrasi secara optimal, serta mampu menenangkan diri setelah melakukan banyak aktivitas.'),
    penutup: D('Dengan adanya perkembangan dalam regulasi emosi, akan membuat {anandaPanggilan} dapat dengan mudah untuk beradaptasi dan bersosialisasi di lingkungan sekolah maupun lingkungan sekitar.'),
  },

  spinalGalant: {
    pembuka: { membaik1: D('Pada refleks Spinal Galant {anandaPanggilan} menunjukkan kemajuan signifikan dengan {kataArah} nilai dari {sebelum} menjadi {sesudah}, yang berarti refleks masih muncul namun intensitasnya berkurang.') },
    bukti: {
      teks: D('Perkembangan ini terlihat dari berkurangnya keresahan motorik (fidgeting), di mana Ananda kini mampu duduk lebih tenang tanpa terus-menerus menggeliat. Atensi serta fokus yang meningkat, ditandai dengan kemampuan mengikuti dua instruksi berurutan dan mempertahankannya hingga tugas selesai. Serta postur duduk yang mulai tegak dan stabil, serta sensitivitas terhadap rangsangan di area punggung berkurang sehingga Ananda lebih nyaman saat beraktivitas.'),
      syarat: [{ membaik: 'kegiatan:responEkspresi' }, { minimal: 'kegiatan:pemahamanInstruksi', nilai: 3 }, { membaik: 'kegiatan:posturTulangBelakang' }, { membaik: 'sensori:taktil' }],
    },
    frasa: [
      { teks: B('kemampuan duduk lebih tenang dengan keresahan motorik yang berkurang'), syarat: [{ membaik: 'kegiatan:responEkspresi' }] },
      { teks: B('atensi dan fokus yang meningkat'), syarat: [{ minimal: 'kegiatan:pemahamanInstruksi', nilai: 3 }] },
      { teks: B('sensitivitas area punggung yang berkurang'), syarat: [{ membaik: 'sensori:taktil' }] },
    ],
    manfaat: D('Jika terintegrasi sempurna, Ananda akan memiliki konsentrasi optimal dan postur yang baik tanpa gangguan gerakan tak sadar.'),
    penutup: D('Meski kemajuan sangat berarti, latihan konsisten tetap diperlukan agar hasilnya terus meningkat dan menetap secara optimal.'),
  },

  suckingRooting: {
    frasa: [
      { teks: B('kontrol pernapasan saat meniup gelembung yang semakin baik'), syarat: [{ membaik: 'program:b1.mouthIn' }] },
      { teks: B('toleransi wajah terhadap air yang meningkat'), syarat: [{ membaik: 'program:b1.faceIn' }] },
    ],
    manfaat: B('Jika refleks Sucking & Rooting terintegrasi sempurna, Ananda akan memiliki kontrol otot mulut dan pernapasan yang baik, yang mendukung kemampuan makan, berbicara, dan mengatur napas saat berenang.'),
  },

  amphibian: {
    pembuka: { membaik1: D('Pada refleks Amphibian {anandaPanggilan} menunjukkan kemajuan signifikan dengan {kataArah} nilai dari {sebelum} menjadi {sesudah}, yang berarti refleks masih muncul namun intensitasnya berkurang.') },
    bukti: {
      teks: D('Perkembangan ini terlihat dari postur duduk yang lebih tegak dan stabil, berkurangnya keresahan motorik (fidgeting) sehingga Ananda mampu duduk lebih tenang, serta peningkatan konsentrasi dalam mengikuti instruksi hingga tugas selesai.'),
      syarat: [{ membaik: 'kegiatan:posturTulangBelakang' }, { membaik: 'kegiatan:responEkspresi' }, { minimal: 'kegiatan:pemahamanInstruksi', nilai: 3 }],
    },
    frasa: [
      { teks: B('postur duduk yang lebih tegak dan stabil'), syarat: [{ membaik: 'kegiatan:posturTulangBelakang' }] },
      { teks: B('kemampuan duduk lebih tenang'), syarat: [{ membaik: 'kegiatan:responEkspresi' }] },
      { teks: B('konsentrasi yang meningkat dalam mengikuti instruksi'), syarat: [{ minimal: 'kegiatan:pemahamanInstruksi', nilai: 3 }] },
      { teks: B('gerakan kaki yang semakin terkoordinasi'), syarat: [{ membaik: 'kegiatan:motorikKaki' }] },
    ],
    manfaat: D('Jika terintegrasi sempurna, Ananda akan memiliki postur optimal, mampu duduk tenang dalam waktu lama, serta terbebas dari sensitivitas berlebihan di area pinggang.'),
    penutup: D('Meski kemajuan sangat berarti, refleks ini belum sepenuhnya terintegrasi sehingga diperlukan latihan konsisten agar hasil yang dicapai terus meningkat dan menetap secara optimal.'),
  },

  diving: {
    pembuka: { membaik2: D('Pada _Diving reflex_ {anandaPanggilan} menunjukkan kemajuan sangat signifikan dengan {kataArah} nilai dari {sebelum} menjadi {sesudah}.') },
    keterangan: D('Refleks ini merupakan mekanisme perlindungan alami yang justru perlu berfungsi optimal, refleks fisiologis ini kini berfungsi secara adaptif, tidak berlebihan, sehingga risikonya diminimalkan.'),
    bukti: {
      teks: D('Perkembangan terlihat dari keberaniannya memasukkan kepala ke air, mampu melakukan water trap, serta inisiatif back floating tanpa disertai respons berlebihan seperti pusing atau blackout.'),
      syarat: [{ tambahan: 'proning.kepalaMasukAir' }, { tambahan: 'ototInti.waterTrap' }, { tambahan: 'backFloating.inisiatifSendiri' }],
    },
    frasa: [
      { teks: B('keberanian memasukkan kepala ke air'), syarat: [{ tambahan: 'proning.kepalaMasukAir' }] },
      { teks: B('kemampuan melakukan water trap'), syarat: [{ tambahan: 'ototInti.waterTrap' }] },
      { teks: B('inisiatif melakukan back floating tanpa respons berlebihan'), syarat: [{ tambahan: 'backFloating.inisiatifSendiri' }] },
      { teks: B('toleransi wajah terhadap air yang meningkat'), syarat: [{ membaik: 'program:b1.faceIn' }] },
    ],
    manfaat: D('Dengan refleks yang terkendali, Ananda semakin percaya diri dan aman saat beraktivitas di air.'),
    penutup: D('Stimulasi dan pengawasan tetap diperlukan agar fungsi refleks ini terus mendukung keselamatan dan keterampilan akuatiknya.'),
  },
};
