import type { SymptomAiInput, SymptomAiResult } from '../types/sehatara'

export class GeminiAnalysisError extends Error {
  code: string
  status?: number

  constructor(message: string, code = 'GEMINI_ANALYSIS_ERROR', status?: number) {
    super(message)
    this.name = 'GeminiAnalysisError'
    this.code = code
    this.status = status
  }
}

export async function analyzeSymptom(input: SymptomAiInput): Promise<SymptomAiResult> {
  try {
    const response = await fetch('/api/gemini/symptom-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const payload = await readJsonResponse(response)

    if (!response.ok) {
      const code = getPayloadErrorCode(payload, response.status)
      throw new GeminiAnalysisError(createGeminiErrorMessage(code), code, response.status)
    }

    return normalizeAiResult(payload?.result)
  } catch (error) {
    if (error instanceof GeminiAnalysisError) {
      throw error
    }

    throw new GeminiAnalysisError(
      'Gemini API belum bisa dihubungi. Pastikan server lokal masih hidup dan koneksi internet tersedia.',
      'GEMINI_NETWORK_ERROR',
    )
  }
}

export function getGeminiAnalysisErrorMessage(error: unknown) {
  if (error instanceof GeminiAnalysisError) {
    return error.message
  }

  return 'Analisis Gemini gagal. Coba ulangi setelah memastikan API key dan server lokal sudah aktif.'
}

function normalizeAiResult(value: unknown): SymptomAiResult {
  if (!value || typeof value !== 'object') {
    throw new GeminiAnalysisError(
      'Gemini merespons, tetapi format datanya tidak sesuai dengan kebutuhan aplikasi.',
      'GEMINI_INVALID_RESPONSE',
    )
  }

  const record = value as Partial<SymptomAiResult>
  const urgencyLevel = parseUrgencyLevel(record.urgencyLevel)

  return {
    source: 'gemini',
    title: requireText(record.title, 'title'),
    summary: requireText(record.summary, 'summary'),
    urgencyLevel,
    redFlags: requireStringList(record.redFlags, 'redFlags'),
    recommendation: requireText(record.recommendation, 'recommendation'),
    careSteps: requireStringList(record.careSteps, 'careSteps'),
    questionsToTrack: requireStringList(record.questionsToTrack, 'questionsToTrack'),
    doctorVisitAdvice: requireStringList(record.doctorVisitAdvice, 'doctorVisitAdvice'),
    medicineNote: requireStringList(record.medicineNote, 'medicineNote'),
    recoveryPlan: requireStringList(record.recoveryPlan, 'recoveryPlan'),
    safetyMessage: requireText(record.safetyMessage, 'safetyMessage'),
  }
}

async function readJsonResponse(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new GeminiAnalysisError(
      'Endpoint Gemini memberi respons yang tidak bisa dibaca sebagai JSON.',
      'GEMINI_INVALID_JSON',
    )
  }
}

function getPayloadErrorCode(payload: unknown, status: number) {
  if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
    return payload.error
  }

  return `GEMINI_HTTP_${status}`
}

function createGeminiErrorMessage(code: string) {
  if (code === 'GEMINI_API_KEY_MISSING') {
    return 'Gemini API key belum terbaca. Isi GEMINI_API_KEY di .env.local, simpan, lalu restart server.'
  }

  if (code === 'GEMINI_REQUEST_FAILED') {
    return 'Request ke Gemini API gagal. Periksa apakah API key valid, model tersedia, dan akun Google AI Studio kamu aktif.'
  }

  if (code === 'GEMINI_EMPTY_RESPONSE') {
    return 'Gemini API tidak mengirim hasil analisis. Coba ulangi atau cek konfigurasi model.'
  }

  if (code === 'GEMINI_PROXY_ERROR') {
    return 'Server lokal gagal memproses request Gemini. Cek terminal/log dev server untuk detail error.'
  }

  return 'Gemini API belum bisa menyelesaikan analisis. Cek API key, koneksi, dan restart server lokal.'
}

function parseUrgencyLevel(value: unknown): SymptomAiResult['urgencyLevel'] {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value
  }

  throw new GeminiAnalysisError(
    'Gemini merespons, tetapi nilai urgencyLevel tidak sesuai schema.',
    'GEMINI_INVALID_RESPONSE',
  )
}

function requireText(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new GeminiAnalysisError(
      `Gemini merespons, tetapi field ${fieldName} kosong atau tidak valid.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  return value.trim()
}

function requireStringList(value: unknown, fieldName: string) {
  if (!Array.isArray(value)) {
    throw new GeminiAnalysisError(
      `Gemini merespons, tetapi field ${fieldName} bukan daftar teks.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)

  if (cleaned.length === 0) {
    throw new GeminiAnalysisError(
      `Gemini merespons, tetapi field ${fieldName} belum berisi data.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  return cleaned
}
