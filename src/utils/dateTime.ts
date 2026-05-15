export function createIsoTimestamp() {
  return new Date().toISOString()
}

export function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
}

export function isSameLocalDate(value: string, date: Date) {
  const parsedDate = new Date(value)

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getFullYear() === date.getFullYear() &&
    parsedDate.getMonth() === date.getMonth() &&
    parsedDate.getDate() === date.getDate()
  )
}

export function formatShortDateTime(value: string, fallback = 'baru saja', language = 'id') {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  const locale = language === 'en' ? 'en-US' : 'id-ID'

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
