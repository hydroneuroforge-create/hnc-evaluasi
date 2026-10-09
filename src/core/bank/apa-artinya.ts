// 'Apa artinya untuk Ananda?' per sensory system and RANK (1 = least … 4 = most developed), so the texts are
// independent of the scale direction. All [BARU].
import type { Level, SensoriId, TeksBank } from '../types.ts';

const B = (teks: string): TeksBank => ({ teks, sumber: 'BARU' });

export const JUDUL_APA_ARTINYA = 'Apa artinya untuk Ananda?';

export const APA_ARTINYA: Record<SensoriId, Record<Level, TeksBank>> = {
  vestibular: {
    4: B('Ananda dapat menjaga keseimbangan dengan baik saat bergerak, berputar, atau berpindah posisi, sehingga lebih percaya diri bermain dan beraktivitas.'),
    3: B('Ananda cukup mampu menjaga keseimbangan; sesekali masih tampak ragu atau mudah goyah pada gerakan yang menantang.'),
    2: B('Ananda masih sering kesulitan menjaga keseimbangan, misalnya mudah goyah atau menghindari gerakan berputar dan berayun.'),
    1: B('Ananda sangat kesulitan menjaga keseimbangan sehingga aktivitas bergerak masih memerlukan pendampingan penuh.'),
  },
  taktil: {
    4: B('Ananda nyaman menerima berbagai sentuhan dan tekstur, termasuk percikan air, sehingga dapat fokus pada aktivitas.'),
    3: B('Ananda cukup nyaman dengan sentuhan dan percikan air, meskipun sesekali masih menunjukkan rasa kurang nyaman pada rangsangan tertentu.'),
    2: B('Ananda masih sering merasa tidak nyaman terhadap sentuhan atau percikan air tertentu, sehingga partisipasinya kadang terganggu.'),
    1: B('Ananda sangat sensitif terhadap sentuhan dan percikan air, sehingga memerlukan pendekatan yang sangat bertahap.'),
  },
  proprioseptif: {
    4: B('Ananda memiliki kesadaran posisi tubuh dan tonus otot yang baik, sehingga gerakannya terarah dan kekuatannya terkontrol.'),
    3: B('Ananda cukup memahami posisi tubuhnya; kekuatan dan arah gerakan masih perlu diperhalus pada aktivitas tertentu.'),
    2: B('Ananda masih kesulitan mengatur kekuatan dan arah gerakan, misalnya tampak terlalu lemah atau terlalu kuat saat bergerak.'),
    1: B('Ananda sangat kesulitan merasakan posisi tubuh dan mengatur tonus ototnya, sehingga gerakan masih memerlukan bantuan penuh.'),
  },
};
