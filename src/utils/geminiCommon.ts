export class GeminiError extends Error {
  code: string
  status?: number

  constructor(message: string, code = 'GEMINI_ERROR', status?: number) {
    super(message)
    this.name = 'GeminiError'
    this.code = code
    this.status = status
  }
}

export async function readGeminiJsonResponse(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new GeminiError(
      'Respons Gemini tidak bisa dibaca sebagai JSON.',
      'GEMINI_INVALID_JSON',
    )
  }
}

export function extractErrorCode(payload: unknown, status: number) {
  if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
    return payload.error
  }

  return `GEMINI_HTTP_${status}`
}

export function requireTextField(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new GeminiError(
      `Gemini merespons, tetapi field ${fieldName} kosong atau tidak valid.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  return value.trim()
}

export function requireStringListField(value: unknown, fieldName: string) {
  if (!Array.isArray(value)) {
    throw new GeminiError(
      `Gemini merespons, tetapi field ${fieldName} bukan daftar teks.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)

  if (cleaned.length === 0) {
    throw new GeminiError(
      `Gemini merespons, tetapi field ${fieldName} belum berisi data.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  return cleaned
}
