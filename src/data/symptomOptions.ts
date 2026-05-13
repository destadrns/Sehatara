import type { RedFlag } from '../types/sehatara'

export const durationOptions = ['Hari ini', '1-3 hari', 'Lebih dari 3 hari', 'Sering berulang']

export const symptomAreas = [
  'Kepala',
  'Dada',
  'Perut',
  'Tenggorokan',
  'Kulit',
  'Sendi/otot',
  'Lainnya',
]

export const redFlags: RedFlag[] = [
  { id: 'chest', label: 'Nyeri dada berat' },
  { id: 'breath', label: 'Sesak napas berat' },
  { id: 'stroke', label: 'Gejala stroke' },
  { id: 'bleeding', label: 'Perdarahan berat' },
  { id: 'self-harm', label: 'Ingin menyakiti diri' },
]
