export const storageKeys = {
  theme: 'sehatara-theme',
  symptomRecords: 'sehatara-symptom-records',
  medicineNotes: 'sehatara-medicine-notes',
  wellnessPlans: 'sehatara-wellness-plans',
  chatSession: 'sehatara-chat-session',
  symptomWorkspace: 'sehatara-symptom-workspace',
  medicineNoteProgress: 'sehatara-medicine-note-progress',
  wellnessPlanProgress: 'sehatara-wellness-plan-progress',
  calmSessionRecords: 'sehatara-calm-session-records',
} as const

export const storageLimits = {
  symptomRecords: 8,
  medicineNotes: 6,
  wellnessPlans: 6,
  calmSessionRecords: 20,
} as const

type StorageNormalizer<T> = (value: unknown) => T | null

export function readStorageText(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorageText(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function readStorageValue<T>(
  key: string,
  fallback: T,
  normalize?: StorageNormalizer<T>,
): T {
  const stored = readStorageText(key)

  if (!stored) {
    return fallback
  }

  try {
    const parsed = JSON.parse(stored) as unknown

    if (normalize) {
      return normalize(parsed) ?? fallback
    }

    return parsed as T
  } catch {
    return fallback
  }
}

export function writeStorageValue<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorageValue(key: string) {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function readStorageList<T>(
  key: string,
  normalizeItem?: StorageNormalizer<T>,
  limit?: number,
) {
  return readStorageValue<T[]>(key, [], (value) => {
    if (!Array.isArray(value)) {
      return null
    }

    const items = normalizeItem
      ? value
          .map((item): T | null => normalizeItem(item))
          .filter((item): item is T => Boolean(item))
      : (value as T[])

    return typeof limit === 'number' ? items.slice(0, limit) : items
  })
}

export function readStorageRecordMap<T>(
  key: string,
  normalizeValue: StorageNormalizer<T>,
) {
  return readStorageValue<Record<string, T>>(key, {}, (value) => {
    if (!isPlainRecord(value)) {
      return null
    }

    return Object.entries(value).reduce<Record<string, T>>((result, [id, item]) => {
      const normalized = normalizeValue(item)

      if (normalized) {
        result[id] = normalized
      }

      return result
    }, {})
  })
}

export function normalizeText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function normalizeStringList(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : []
}

export function normalizeOptionalStringList(value: unknown) {
  const list = normalizeStringList(value)
  return list.length > 0 ? list : undefined
}

export function normalizeDateString(value: unknown) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
    ? value
    : undefined
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
