export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getIntensityLabel(value: number, language = 'id') {
  if (value <= 3) {
    return language === 'en' ? 'Mild' : 'Ringan'
  }

  if (value <= 6) {
    return language === 'en' ? 'Moderate' : 'Sedang'
  }

  return language === 'en' ? 'Severe' : 'Berat'
}
