export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getIntensityLabel(value: number) {
  if (value <= 3) {
    return 'Ringan'
  }

  if (value <= 6) {
    return 'Sedang'
  }

  return 'Berat'
}
