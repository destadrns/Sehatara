import type { LanguageMode, RedFlag } from '../types/sehatara'

const localizedSymptomOptions: Record<LanguageMode, {
  durationOptions: string[]
  symptomAreas: string[]
  redFlags: RedFlag[]
}> = {
  id: {
    durationOptions: ['Hari ini', '1-3 hari', 'Lebih dari 3 hari', 'Sering berulang'],
    symptomAreas: [
      'Kepala',
      'Dada',
      'Perut',
      'Tenggorokan',
      'Kulit',
      'Sendi/otot',
      'Lainnya',
    ],
    redFlags: [
      { id: 'chest', label: 'Nyeri dada berat' },
      { id: 'breath', label: 'Sesak napas berat' },
      { id: 'stroke', label: 'Gejala stroke' },
      { id: 'bleeding', label: 'Perdarahan berat' },
      { id: 'self-harm', label: 'Ingin menyakiti diri' },
    ],
  },
  en: {
    durationOptions: ['Today', '1-3 days', 'More than 3 days', 'Often recurring'],
    symptomAreas: [
      'Head',
      'Chest',
      'Stomach',
      'Throat',
      'Skin',
      'Joints/muscles',
      'Other',
    ],
    redFlags: [
      { id: 'chest', label: 'Severe chest pain' },
      { id: 'breath', label: 'Severe shortness of breath' },
      { id: 'stroke', label: 'Stroke symptoms' },
      { id: 'bleeding', label: 'Heavy bleeding' },
      { id: 'self-harm', label: 'Wanting to hurt myself' },
    ],
  },
}

export function getSymptomOptions(language: LanguageMode) {
  return localizedSymptomOptions[language]
}

export const durationOptions = localizedSymptomOptions.id.durationOptions
export const symptomAreas = localizedSymptomOptions.id.symptomAreas
export const redFlags = localizedSymptomOptions.id.redFlags
