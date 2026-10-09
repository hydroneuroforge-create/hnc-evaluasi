// Kegiatan sentence bank (PLAN.md §6.1). DOKUMEN = the owner's original wording (brief §5A, bold per DOCX);
// BARU = newly drafted, needs clinical review. Tokens: slots of the same kegiatan ({durasi}, {sisiLemah},
// {jenisBantuan}), other kegiatan slots ({ototInti.durasi}), {ringkasSebelum}, {besaran}, name tokens.
import type { KegiatanId, Level, TeksBank } from '../types.ts';

const D = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'DOKUMEN', ...(catatan ? { catatan } : {}) });
const B = (teks: string, catatan?: string): TeksBank => ({ teks, sumber: 'BARU', ...(catatan ? { catatan } : {}) });

export interface LevelKegiatanBank {
  /** Short therapist-friendly label for the future picker. */
  label: string;
  /** Phrase used in 'Dari yang awalnya {ringkasSebelum}, kini …' when this level is the BEFORE level. */
  ringkas: string;
  ringkasDokumen?: boolean;
  sebelum: TeksBank;
  /** AFTER core text; defaults to `sebelum`. */
  sesudah?: TeksBank;
  sesudahNaik?: TeksBank;
  sesudahSama?: TeksBank;
  sesudahTurun?: TeksBank;
  sesudahTanpaSebelum?: TeksBank;
}

export interface KegiatanBank { level: Record<Level, LevelKegiatanBank>; tambahan: Record<string, TeksBank> }

/** Standard sentence for 'tidak dapat diobservasi' [DOKUMEN]. */
export const TEKS_TDO = D('Karena kondisi Ananda yang **tidak kondusif**[[ ({alasanTdo})]], observasi untuk parameter-parameter berikut **tidak dapat dilakukan secara optimal**.');
/** Short card text for a kegiatan not observable at BEFORE (D7). */
export const TEKS_TDO_KARTU_AWAL = 'Belum dapat diobservasi pada evaluasi awal';
export const TEKS_TDO_KARTU_LANJUTAN = 'Belum dapat diobservasi pada evaluasi lanjutan';

/** Generic AFTER variants (used when a level has no specific override). */
export const VARIAN_UMUM = {
  naik: B('Dari yang awalnya {ringkasSebelum}, kini {inti}', '{inti} = teks inti level sesudah, huruf pertamanya dikecilkan kecuali kata "Ananda"'),
  sama: B('{inti} Kondisi ini masih serupa dengan hasil evaluasi awal, sehingga stimulasi akan terus dilanjutkan.'),
  turun: B('{inti} Aspek ini akan mendapatkan perhatian lebih pada sesi-sesi berikutnya.'),
};

/** Improvement size wording for {besaran}. */
export const BESARAN: Record<'satu' | 'lebih', string> = { satu: 'yang positif', lebih: 'yang sangat signifikan' };
export const besaranUntuk = (delta: number): string | undefined => (delta >= 2 ? BESARAN.lebih : delta === 1 ? BESARAN.satu : undefined);

/** Add-ons available for every kegiatan. */
export const TAMBAHAN_UMUM_TEKS: Record<string, TeksBank> = {
  butuhPengingat: B('Ananda masih memerlukan pengingat sesekali agar tetap fokus pada aktivitas.'),
  mandiriTanpaBantuan: B('Ananda kini mampu melakukannya secara mandiri tanpa bantuan terapis.'),
};

export const BANK_KEGIATAN: Record<KegiatanId, KegiatanBank> = {
  responEkspresi: {
    level: {
      1: { label: 'Sering Menolak', ringkas: 'sering menunjukkan penolakan dan sulit diarahkan',
        sebelum: B('**Ananda masih sering menunjukkan penolakan** saat diberikan instruksi. Ananda memerlukan waktu dan pendampingan penuh dari terapis untuk dapat merasa tenang dan mulai terlibat dalam kegiatan.') },
      2: { label: 'Dinamis, Belum Stabil', ringkas: 'menunjukkan respons yang dinamis dan cukup intens',
        sebelum: D('**Ananda menunjukkan respons yang dinamis dan cukup intens**. Ananda datang dengan antusiasme tinggi, ditandai dengan merengek dan ketidaksabaran untuk segera masuk ke kolam, namun hal ini juga dibarengi dengan kecemasan dan sikap menolak saat diberikan instruksi yang tidak sesuai dengan keinginannya. Ananda cenderung berusaha untuk mengontrol dan mendominasi situasi terapi.') },
      3: { label: 'Cukup Tenang & Kooperatif', ringkas: 'cukup tenang dan kooperatif',
        sebelum: B('**Ananda cukup tenang dan kooperatif** selama sesi. Ananda mampu mengikuti sebagian besar arahan terapis[[ dengan {jenisBantuan}]], meskipun sesekali masih memerlukan waktu untuk menyesuaikan diri dengan aktivitas baru.'),
        sesudahNaik: D('**Ananda menunjukkan perkembangan positif** dalam hal respons terhadap instruksi. Ananda terlihat cukup tenang saat diminta untuk mengambil media, dan tidak lagi menunjukkan ekspresi kekecewaan ketika diberikan instruksi untuk melakukan aktivitas di area kolam yang lebih dalam.[[ Ananda mampu mengikuti arahan hanya dengan {jenisBantuan}.]]') },
      4: { label: 'Tenang & Teregulasi', ringkas: 'tenang dan mampu meregulasi emosinya',
        sebelum: B('**Ananda tampak tenang dan mampu meregulasi emosinya dengan baik** selama sesi. Ananda menerima arahan terapis dengan antusias dan dapat beradaptasi dengan perubahan aktivitas tanpa respons penolakan.') },
    },
    tambahan: {
      penolakanDurasi: D('Namun, terlihat adanya respons penolakan ketika instruksi yang diberikan memaksanya untuk berada di dalam air melebihi rentang waktu yang biasa dijalani.'),
    },
  },

  eyeContact: {
    level: {
      1: { label: 'Belum Tampak', ringkas: 'belum tampak',
        sebelum: B('**Kontak mata belum tampak.** Ananda masih kesulitan memusatkan pandangan pada lawan bicara dan memerlukan stimulasi untuk mulai menjalin kontak mata.') },
      2: { label: 'Ada, Belum Konsisten', ringkas: 'belum konsisten', ringkasDokumen: true,
        sebelum: D('**Sudah ada, namun belum konsisten.** Ananda mampu melakukan kontak mata, tetapi belum dapat mempertahankannya secara terus-menerus selama sesi.') },
      3: { label: 'Mulai Konsisten', ringkas: 'mulai konsisten',
        sebelum: B('**Kontak mata sudah mulai konsisten.** Ananda mampu menjalin kontak mata dengan cukup baik selama sesi, meskipun durasinya masih perlu ditingkatkan.'),
        sesudahNaik: D('Dari yang awalnya {ringkasSebelum}, kini Ananda mulai **menunjukkan peningkatan** dalam menjalin kontak mata, baik frekuensi maupun durasinya. Masih perlu stimulasi lanjutan untuk mencapai intensitas yang optimal.') },
      4: { label: 'Konsisten', ringkas: 'sudah konsisten',
        sebelum: B('**Kontak mata sudah konsisten.** Ananda mampu mempertahankan kontak mata dengan baik selama berinteraksi dan mengikuti arahan terapis.') },
    },
    tambahan: {},
  },

  pemahamanInstruksi: {
    level: {
      1: { label: 'Belum Memahami', ringkas: 'belum dapat memahami instruksi sederhana',
        sebelum: B('**Ananda belum dapat memahami instruksi sederhana** secara konsisten. Ananda masih memerlukan contoh langsung dan bantuan fisik untuk memulai suatu aktivitas.') },
      2: { label: 'Instruksi Sederhana', ringkas: 'baru memahami instruksi sederhana dengan pengulangan',
        sebelum: D('**Baik untuk instruksi sederhana.** Ananda menunjukkan kemampuan memahami perintah-perintah dasar, tetapi masih memerlukan pengulangan instruksi untuk memastikan pemahaman dan memicu respons.') },
      3: { label: 'Dua Instruksi Berurutan', ringkas: 'mampu mengikuti dua instruksi berurutan',
        sebelum: D('Kemampuan Ananda dalam memahami instruksi mulai **berkembang dengan baik**. Ananda cukup mampu mengikuti dua instruksi sederhana secara berurutan. Meski demikian, Ananda masih memerlukan pengingat untuk tetap fokus pada kegiatan dan tidak beralih pada aktivitas bermain.'),
        sesudahNaik: D('Kemampuan Ananda dalam memahami instruksi mulai **berkembang dengan baik**. Ananda cukup mampu mengikuti dua instruksi sederhana secara berurutan. Meski demikian, Ananda masih memerlukan pengingat untuk tetap fokus pada kegiatan dan tidak beralih pada aktivitas bermain.') },
      4: { label: 'Beberapa Instruksi', ringkas: 'memahami instruksi dengan baik',
        sebelum: B('**Ananda memahami instruksi dengan baik.** Ananda mampu mengikuti beberapa instruksi secara berurutan dan tetap fokus pada kegiatan hingga selesai.') },
    },
    tambahan: {},
  },

  kekuatanLeher: {
    level: {
      1: { label: 'Belum Mampu Menahan', ringkas: 'belum mampu menahan posisi kepala',
        sebelum: B('**Kekuatan leher Ananda masih lemah.** Ananda belum mampu menahan posisi kepala secara mandiri saat beraktivitas di dalam air dan memerlukan topangan penuh.') },
      2: { label: 'Mulai Menahan', ringkas: 'baru mampu menahan kepala dalam waktu singkat',
        sebelum: B('**Kekuatan leher Ananda mulai berkembang.** Ananda mampu menahan posisi kepala dalam waktu singkat[[ ({durasi})]], namun masih memerlukan bantuan untuk mempertahankannya.') },
      3: { label: 'Cukup Kuat', ringkas: 'cukup kooperatif dalam aktivitas penguatan leher',
        sebelum: D('**Ananda cukup kooperatif** saat diberikan aktivitas untuk meningkatkan kekuatan leher.[[ Ia mampu mengikuti kegiatan dengan durasi {durasi} sebelum meminta istirahat.]]') },
      4: { label: 'Kuat & Stabil', ringkas: 'memiliki kekuatan leher yang baik',
        sebelum: B('**Kekuatan leher Ananda sudah baik.** Ananda mampu mengontrol dan mempertahankan posisi kepala dengan stabil selama aktivitas di dalam air[[ hingga {durasi}]].') },
    },
    tambahan: {},
  },

  proning: {
    level: {
      1: { label: 'Belum Nyaman', ringkas: 'belum nyaman dalam posisi tengkurap',
        sebelum: B('Ananda **belum nyaman berada dalam posisi tengkurap** dan cenderung menolak ketika diarahkan ke posisi tersebut.') },
      2: { label: 'Dengan Bantuan', ringkas: 'masih memerlukan bantuan dalam posisi tengkurap',
        sebelum: B('Ananda mulai dapat berada dalam posisi tengkurap, namun **masih memerlukan bantuan** terapis untuk mempertahankan posisinya.') },
      3: { label: 'Cukup Mampu', ringkas: 'cukup mampu beraktivitas dalam posisi tengkurap',
        sebelum: D('Ananda cukup mampu mengikuti aktivitas dalam posisi tengkurap dengan baik.') },
      4: { label: 'Mandiri', ringkas: 'mampu beraktivitas dalam posisi tengkurap secara mandiri',
        sebelum: B('Ananda **mampu beraktivitas dalam posisi tengkurap secara mandiri** dengan kontrol tubuh yang baik.') },
    },
    tambahan: {
      kepalaMasukAir: D('Bahkan, Ananda menunjukkan keberanian untuk memasukkan kepalanya ke dalam air.'),
    },
  },

  reaksiVerbal: {
    level: {
      1: { label: 'Belum Verbal', ringkas: 'belum menggunakan kata-kata',
        sebelum: B('**Belum Verbal.** Ananda masih mengekspresikan keinginannya melalui gerakan, suara, atau tangisan, dan belum menggunakan kata-kata.') },
      2: { label: 'Mulai Verbal', ringkas: 'baru mulai menggunakan suara atau kata tunggal',
        sebelum: B('**Mulai Verbal.** Ananda mulai menggunakan suara atau kata tunggal untuk menyampaikan keinginannya, meskipun belum konsisten.') },
      3: { label: 'Verbal Sederhana', ringkas: 'menggunakan kata-kata sederhana',
        sebelum: B('**Verbal Sederhana.** Ananda mampu menggunakan kata-kata sederhana untuk menyampaikan keinginan dan menanggapi pertanyaan terapis.') },
      4: { label: 'Sudah Verbal', ringkas: 'sudah verbal',
        sebelum: D('**Sudah Verbal.** Ananda telah memiliki kemampuan verbal untuk mengekspresikan keinginan atau ketidaksukaannya.'),
        sesudahSama: D('**Sudah Verbal.** Ananda telah memiliki kemampuan verbal untuk mengekspresikan keinginan atau ketidaksukaannya.') },
    },
    tambahan: {},
  },

  motorikTangan: {
    level: {
      1: { label: 'Sangat Lemah', ringkas: 'belum mampu menggenggam media dengan kuat',
        sebelum: B('**Kekuatan genggaman Ananda masih sangat lemah.** Ananda belum mampu mempertahankan genggaman pada media dan memerlukan bantuan penuh saat memegang alat.') },
      2: { label: 'Masih Lemah', ringkas: 'tonus otot dan kekuatan genggamannya masih lemah',
        sebelum: D('**Tonus otot dan kekuatan genggaman masih lemah** dan memerlukan penguatan lebih lanjut.') },
      3: { label: 'Cukup Baik', ringkas: 'kekuatan genggamannya cukup baik',
        sebelum: D('Kekuatan genggaman Ananda sudah **cukup baik**. Saat berenang, ia mampu mempertahankan genggaman pada media yang dipegang hingga mencapai tujuan yang diinstruksikan, dengan tingkat fokus yang konsisten.'),
        sesudahNaik: D('Kekuatan genggaman Ananda sudah **cukup baik**. Saat berenang, ia mampu mempertahankan genggaman pada media yang dipegang hingga mencapai tujuan yang diinstruksikan, dengan tingkat fokus yang konsisten.') },
      4: { label: 'Kuat & Terkoordinasi', ringkas: 'kekuatan genggamannya sudah baik',
        sebelum: B('Kekuatan genggaman Ananda **sudah baik dan terkoordinasi**. Ananda mampu memegang dan memindahkan media dengan mantap secara mandiri.') },
    },
    tambahan: {},
  },

  motorikKaki: {
    level: {
      1: { label: 'Sangat Lemah', ringkas: 'belum mampu menggerakkan kaki secara aktif',
        sebelum: B('**Kekuatan otot kaki Ananda masih sangat lemah.** Ananda belum mampu menggerakkan kedua kaki secara aktif untuk menghasilkan dorongan di dalam air.') },
      2: { label: 'Tahap Pengembangan', ringkas: 'kekuatan otot kakinya masih dalam tahap pengembangan',
        sebelum: D('**Kekuatan otot kaki masih dalam tahap pengembangan** dan membutuhkan stimulasi untuk meningkatkan daya dorong dan stabilitas.') },
      3: { label: 'Cukup Konsisten', ringkas: 'cukup konsisten menggerakkan kedua kaki',
        sebelum: D('Ananda sudah cukup konsisten dalam menggerakkan kedua kaki secara bergantian. Masih perlu dikembangkan keseimbangan kekuatan otot kaki kanan dan kiri[[, terutama pada kaki {sisiLemah} yang masih memerlukan stimulus tambahan untuk meningkatkan daya dorong dan stabilitas]].'),
        sesudahNaik: D('Ananda sudah cukup konsisten dalam menggerakkan kedua kaki secara bergantian. Masih perlu dikembangkan keseimbangan kekuatan otot kaki kanan dan kiri[[, terutama pada kaki {sisiLemah} yang masih memerlukan stimulus tambahan untuk meningkatkan daya dorong dan stabilitas]].') },
      4: { label: 'Kuat & Seimbang', ringkas: 'kekuatan kedua kakinya sudah seimbang',
        sebelum: B('**Kekuatan otot kaki Ananda sudah baik dan seimbang.** Ananda mampu menggerakkan kedua kaki secara bergantian dengan daya dorong dan stabilitas yang baik.') },
    },
    tambahan: {},
  },

  ototInti: {
    level: {
      1: { label: 'Kelemahan Otot Inti', ringkas: 'mengalami kelemahan otot inti',
        sebelum: D('**Mengalami kelemahan (Core Muscle Weakness).** Hal ini terlihat dari ketidakmampuan Ananda untuk mempertahankan posisi tubuh yang stabil di dalam air. Tubuhnya cenderung pasif dan mudah terbawa arus, menunjukkan kebutuhan mendesak untuk penguatan otot inti (_Core Muscle_).') },
      2: { label: 'Mulai Berkembang', ringkas: 'kekuatan otot intinya mulai berkembang',
        sebelum: B('**Kekuatan otot inti Ananda mulai berkembang.** Ananda mulai mampu mempertahankan posisi tubuh di dalam air[[ selama {durasi}]], namun masih memerlukan bantuan untuk menjaga stabilitasnya.') },
      3: { label: 'Cukup Stabil', ringkas: 'cukup mampu mempertahankan postur yang stabil',
        sebelum: B('**Kekuatan otot inti Ananda cukup baik.** Ananda cukup mampu mempertahankan postur tubuh yang stabil[[ dalam rentang waktu {durasi}]].'),
        sesudahNaik: D('Ananda **menunjukkan perkembangan {besaran}** pada kekuatan otot intinya. Ananda cukup mampu mempertahankan postur tubuh yang stabil[[ dalam rentang waktu {durasi}]].', '{besaran}: selisih 1 = "yang positif", selisih ≥ 2 = "yang sangat signifikan"') },
      4: { label: 'Kuat & Stabil', ringkas: 'memiliki kekuatan otot inti yang baik',
        sebelum: B('**Kekuatan otot inti Ananda sudah baik.** Ananda mampu mempertahankan postur tubuh yang stabil di dalam air secara mandiri[[ selama {durasi}]].') },
    },
    tambahan: {
      waterTrap: D('Ananda kini telah mampu melakukan **_water trap_ di kolam dalam**, sebuah kemampuan yang membutuhkan kekuatan core muscle yang matang serta koordinasi tubuh yang baik.'),
    },
  },

  berjalanMajuMundur: {
    level: {
      1: { label: 'Belum Mampu', ringkas: 'belum mampu berjalan maju dan mundur di air',
        sebelum: B('Ananda **belum mampu berjalan maju maupun mundur** di dalam air tanpa bantuan penuh dari terapis.') },
      2: { label: 'Dengan Bantuan', ringkas: 'masih memerlukan bantuan untuk berjalan maju dan mundur',
        sebelum: B('Ananda mulai dapat berjalan maju di dalam air, namun **masih memerlukan bantuan** untuk berjalan mundur dan menjaga keseimbangannya.') },
      3: { label: 'Mengikuti Instruksi', ringkas: 'mampu berjalan maju dan mundur dengan arahan',
        sebelum: D('Ananda cukup kondusif dan **mampu mengikuti instruksi** untuk berjalan maju maupun mundur dengan baik dengan pendekatan yang tepat.') },
      4: { label: 'Mandiri & Seimbang', ringkas: 'mampu berjalan maju dan mundur secara mandiri',
        sebelum: B('Ananda **mampu berjalan maju maupun mundur secara mandiri** dengan keseimbangan dan koordinasi yang baik.') },
    },
    tambahan: {},
  },

  posturTulangBelakang: {
    level: {
      1: { label: 'Perlu Perhatian Khusus', ringkas: 'posturnya masih memerlukan perhatian khusus',
        sebelum: B('Postur tulang belakang Ananda **masih memerlukan perhatian khusus**. Ananda masih mengalami keterbatasan saat bergerak di dalam air, sehingga setiap gerakan perlu didampingi dengan cermat.') },
      2: { label: 'Perlu Penguatan', ringkas: 'posturnya masih memerlukan penguatan',
        sebelum: B('Postur tulang belakang Ananda **masih memerlukan penguatan**. Ananda dapat bergerak di dalam air, namun keselarasan tubuhnya belum konsisten.') },
      3: { label: 'Cukup Baik', ringkas: 'posturnya cukup baik',
        sebelum: B('Postur tulang belakang Ananda **cukup baik**. Ananda dapat bergerak dengan nyaman di dalam air, meskipun keselarasan tubuhnya masih perlu dioptimalkan.') },
      4: { label: 'Baik', ringkas: 'posturnya dalam kondisi baik',
        sebelum: D('Postur tulang belakang Ananda **dalam kondisi baik dan tidak menunjukkan hambatan** yang berarti selama menjalani aktivitas di dalam air. Kelenturan dan keselarasan tulang belakangnya mendukung optimalisasi gerakan, sehingga Ananda dapat bergerak dengan leluasa tanpa keterbatasan struktural.') },
    },
    tambahan: {},
  },

  bahu: {
    level: {
      1: { label: 'Belum Seimbang', ringkas: 'keseimbangan bahunya belum terbentuk',
        sebelum: B('Keseimbangan bahu kanan dan kiri Ananda **belum terbentuk**. Ananda masih kesulitan menjaga posisi tubuh tetap seimbang saat berada di air.') },
      2: { label: 'Mulai Seimbang', ringkas: 'keseimbangan bahunya mulai terbentuk',
        sebelum: B('Keseimbangan bahu kanan dan kiri Ananda **mulai terbentuk**. Koordinasi kedua bahu masih perlu dilatih agar posisi tubuh lebih stabil di dalam air.') },
      3: { label: 'Cukup Baik', ringkas: 'keseimbangan bahunya cukup baik',
        sebelum: D('Keseimbangan bahu kanan dan kiri Ananda **menunjukkan perkembangan yang cukup baik**. Koordinasi antara kedua bahu dalam menjaga keseimbangan tubuh selama berada di air sudah mulai terintegrasi dengan baik. Hal ini terlihat dari kemampuannya mempertahankan posisi tubuh saat melakukan berbagai gerakan di dalam kolam. Kemampuan ini akan terus distimulasi untuk mencapai simetri dan stabilitas bahu yang lebih optimal.') },
      4: { label: 'Simetris & Stabil', ringkas: 'bahunya sudah seimbang dan stabil',
        sebelum: B('Keseimbangan bahu kanan dan kiri Ananda **sudah simetris dan stabil**. Kedua bahu bekerja sama dengan baik dalam menjaga keseimbangan tubuh selama berbagai gerakan di dalam kolam.') },
    },
    tambahan: {},
  },

  kakiAyun: {
    level: {
      1: { label: 'Belum Mampu', ringkas: 'belum mampu mengayunkan kaki secara terarah',
        sebelum: B('Ananda **belum mampu mengayunkan kaki** ke depan dan ke belakang secara terarah dan masih memerlukan bantuan penuh.') },
      2: { label: 'Belum Konsisten', ringkas: 'belum konsisten mengayunkan kaki',
        sebelum: B('Ananda **mulai mampu mengayunkan kaki** ke depan dan ke belakang, namun polanya belum konsisten dan masih sering dilakukan secara bersamaan.') },
      3: { label: 'Cukup Konsisten', ringkas: 'cukup konsisten mengayunkan kaki',
        sebelum: D('**Ananda cukup konsisten** dalam mengayunkan kaki ke depan dan ke belakang. Sesekali ia masih melakukannya secara bersamaan, namun secara umum pola gerak sudah menunjukkan arah yang positif.') },
      4: { label: 'Konsisten & Terarah', ringkas: 'konsisten mengayunkan kaki secara terarah',
        sebelum: B('**Ananda konsisten** mengayunkan kaki ke depan dan ke belakang secara bergantian dengan pola gerak yang terarah dan terkoordinasi.') },
    },
    tambahan: {},
  },

  backFloating: {
    level: {
      1: { label: 'Belum Nyaman', ringkas: 'belum nyaman dalam posisi telentang',
        sebelum: B('Ananda **belum nyaman berada dalam posisi telentang** di permukaan air dan memerlukan topangan penuh dari terapis.') },
      2: { label: 'Dengan Bantuan', ringkas: 'masih memerlukan bantuan untuk mengapung telentang',
        sebelum: D('Ananda masih memerlukan bantuan[[ {jenisBantuan}]] untuk dapat mengikuti aktivitas ini dengan optimal.') },
      3: { label: 'Bantuan Minimal', ringkas: 'mampu mengapung telentang dengan bantuan minimal',
        sebelum: B('Ananda **mampu melakukan back floating dengan bantuan minimal** dan terlihat cukup nyaman berada dalam posisi telentang.') },
      4: { label: 'Mandiri', ringkas: 'mampu mengapung telentang secara mandiri',
        sebelum: B('Ananda **mampu melakukan back floating secara mandiri** dengan posisi tubuh yang rileks dan stabil.') },
    },
    tambahan: {
      inisiatifSendiri: D('Meski demikian, terkadang ia **menunjukkan inisiatif untuk melakukannya** sendiri tanpa menunggu instruksi.'),
    },
  },
};

/** Text of an add-on (kegiatan-specific first, then the general ones). */
export const teksTambahan = (id: KegiatanId, tambahan: string): TeksBank | undefined =>
  BANK_KEGIATAN[id].tambahan[tambahan] ?? TAMBAHAN_UMUM_TEKS[tambahan];
