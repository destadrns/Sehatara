import type { SymptomAiInput, SymptomAiResult } from '../types/sehatara'
import {
  GeminiError,
  extractErrorCode,
  readGeminiJsonResponse,
  requireStringListField,
  requireTextField,
} from './geminiCommon'

export async function analyzeSymptom(input: SymptomAiInput): Promise<SymptomAiResult> {
  try {
    const response = await fetch('/api/gemini/symptom-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const payload = await readGeminiJsonResponse(response)

    if (!response.ok) {
      const code = extractErrorCode(payload, response.status)
      throw new GeminiError(createGeminiErrorMessage(code, input.language), code, response.status)
    }

    return normalizeAiResult(payload?.result)
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error
    }

    throw new GeminiError(
      input.language === 'en'
        ? 'Gemini API cannot be reached yet. Make sure the local server is running and the internet connection is available.'
        : 'Gemini API belum bisa dihubungi. Pastikan server lokal masih hidup dan koneksi internet tersedia.',
      'GEMINI_NETWORK_ERROR',
    )
  }
}

export function getGeminiAnalysisErrorMessage(error: unknown, language = 'id') {
  if (error instanceof GeminiError) {
    return error.message
  }

  return language === 'en'
    ? 'Gemini analysis failed. Try again after making sure the API key and local server are active.'
    : 'Analisis Gemini gagal. Coba ulangi setelah memastikan API key dan server lokal sudah aktif.'
}

function normalizeAiResult(value: unknown): SymptomAiResult {
  if (!value || typeof value !== 'object') {
    throw new GeminiError(
      'Gemini merespons, tetapi format datanya tidak sesuai dengan kebutuhan aplikasi.',
      'GEMINI_INVALID_RESPONSE',
    )
  }

  const record = value as Partial<SymptomAiResult>
  const urgencyLevel = parseUrgencyLevel(record.urgencyLevel)

  return {
    source: 'gemini',
    title: requireTextField(record.title, 'title'),
    summary: requireTextField(record.summary, 'summary'),
    urgencyLevel,
    redFlags: requireStringListField(record.redFlags, 'redFlags'),
    recommendation: requireTextField(record.recommendation, 'recommendation'),
    careSteps: requireStringListField(record.careSteps, 'careSteps'),
    questionsToTrack: requireStringListField(record.questionsToTrack, 'questionsToTrack'),
    doctorVisitAdvice: requireStringListField(record.doctorVisitAdvice, 'doctorVisitAdvice'),
    medicineNote: requireStringListField(record.medicineNote, 'medicineNote'),
    recoveryPlan: requireStringListField(record.recoveryPlan, 'recoveryPlan'),
    safetyMessage: requireTextField(record.safetyMessage, 'safetyMessage'),
  }
}

function createGeminiErrorMessage(code: string, language = 'id') {
  const en = language === 'en'

  if (code === 'GEMINI_API_KEY_MISSING') {
    return en
      ? 'Gemini API key is not detected. Fill GEMINI_API_KEY in .env.local, save it, then restart the server.'
      : 'Gemini API key belum terbaca. Isi GEMINI_API_KEY di .env.local, simpan, lalu restart server.'
  }

  if (code === 'GEMINI_REQUEST_FAILED') {
    return en
      ? 'The Gemini API request failed. Check that the API key is valid, the model is available, and the Google AI Studio account is active.'
      : 'Request ke Gemini API gagal. Periksa apakah API key valid, model tersedia, dan akun Google AI Studio kamu aktif.'
  }

  if (code === 'GEMINI_QUOTA_EXCEEDED') {
    return en
      ? 'Gemini API quota is exhausted or rate-limited. Wait a moment, then analyze again.'
      : 'Kuota Gemini API sedang habis atau terkena rate limit. Tunggu beberapa saat, lalu coba analisis ulang.'
  }

  if (code === 'GEMINI_EMPTY_RESPONSE') {
    return en
      ? 'Gemini API did not send analysis results. Try again or check the model configuration.'
      : 'Gemini API tidak mengirim hasil analisis. Coba ulangi atau cek konfigurasi model.'
  }

  if (code === 'GEMINI_PROXY_ERROR') {
    return en
      ? 'The local server failed to process the Gemini request. Check the terminal or dev server logs for details.'
      : 'Server lokal gagal memproses request Gemini. Cek terminal/log dev server untuk detail error.'
  }

  return en
    ? 'Gemini API cannot complete the analysis yet. Check the API key, connection, and restart the local server.'
    : 'Gemini API belum bisa menyelesaikan analisis. Cek API key, koneksi, dan restart server lokal.'
}

function parseUrgencyLevel(value: unknown): SymptomAiResult['urgencyLevel'] {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value
  }

  throw new GeminiError(
    'Gemini merespons, tetapi nilai urgencyLevel tidak sesuai schema.',
    'GEMINI_INVALID_RESPONSE',
  )
}
