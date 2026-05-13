import type { LanguageMode } from '../types/sehatara'

const localizedMentalData = {
  id: {
    breathingSteps: [
      'Tarik napas 4 hitungan',
      'Tahan 2 hitungan',
      'Buang perlahan 6 hitungan',
      'Ulangi 3 kali',
    ],
    groundingSteps: [
      'Sebutkan 5 hal yang kamu lihat.',
      'Sentuh 4 benda di sekitarmu.',
      'Dengarkan 3 suara terdekat.',
      'Sadari 2 aroma atau sensasi.',
      'Pilih 1 langkah kecil setelah ini.',
    ],
  },
  en: {
    breathingSteps: [
      'Breathe in for 4 counts',
      'Hold for 2 counts',
      'Exhale slowly for 6 counts',
      'Repeat 3 times',
    ],
    groundingSteps: [
      'Name 5 things you can see.',
      'Touch 4 objects around you.',
      'Listen for 3 nearby sounds.',
      'Notice 2 smells or sensations.',
      'Choose 1 small next step.',
    ],
  },
}

export function getMentalData(language: LanguageMode) {
  return localizedMentalData[language]
}

export const breathingSteps = localizedMentalData.id.breathingSteps
export const groundingSteps = localizedMentalData.id.groundingSteps
