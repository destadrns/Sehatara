import type { ChatAiInput, ChatAiResult } from '../types/sehatara'

export class GeminiChatError extends Error {
  code: string
  status?: number

  constructor(message: string, code = 'GEMINI_CHAT_ERROR', status?: number) {
    super(message)
    this.name = 'GeminiChatError'
    this.code = code
    this.status = status
  }
}

export async function askGeminiChat(input: ChatAiInput): Promise<ChatAiResult> {
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const payload = await readJsonResponse(response)

    if (!response.ok) {
      const code = getPayloadErrorCode(payload, response.status)
      throw new GeminiChatError(createGeminiChatErrorMessage(code), code, response.status)
    }

    return normalizeChatResult(payload?.result)
  } catch (error) {
    if (error instanceof GeminiChatError) {
      throw error
    }

    throw new GeminiChatError(
      'Gemini API belum bisa dihubungi. Pastikan server lokal masih hidup dan koneksi internet tersedia.',
      'GEMINI_NETWORK_ERROR',
    )
  }
}

export function getGeminiChatErrorMessage(error: unknown) {
  if (error instanceof GeminiChatError) {
    return error.message
  }

  return 'Tanya AI gagal mengambil jawaban Gemini. Coba ulangi setelah memastikan API key dan server lokal aktif.'
}

function normalizeChatResult(value: unknown): ChatAiResult {
  if (!value || typeof value !== 'object') {
    throw new GeminiChatError(
      'Gemini merespons, tetapi format jawaban chat tidak sesuai kebutuhan aplikasi.',
      'GEMINI_INVALID_RESPONSE',
    )
  }

  const record = value as Partial<ChatAiResult>
  const warning = typeof record.warning === 'string' ? record.warning.trim() : ''

  return {
    source: 'gemini',
    title: requireText(record.title, 'title'),
    body: requireText(record.body, 'body'),
    points: requireStringList(record.points, 'points'),
    warning: warning || undefined,
    nextStep: requireText(record.nextStep, 'nextStep'),
    medicineNote: requireStringList(record.medicineNote, 'medicineNote'),
    recoveryPlan: requireStringList(record.recoveryPlan, 'recoveryPlan'),
    handoffSummary: requireText(record.handoffSummary, 'handoffSummary'),
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
    throw new GeminiChatError(
      'Endpoint Gemini memberi respons chat yang tidak bisa dibaca sebagai JSON.',
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

function createGeminiChatErrorMessage(code: string) {
  if (code === 'GEMINI_API_KEY_MISSING') {
    return 'Gemini API key belum terbaca. Isi GEMINI_API_KEY di .env.local, simpan, lalu restart server.'
  }

  if (code === 'GEMINI_CHAT_INPUT_MISSING') {
    return 'Tulis pertanyaan terlebih dahulu sebelum mengirim ke Gemini.'
  }

  if (code === 'GEMINI_REQUEST_FAILED') {
    return 'Request chat ke Gemini API gagal. Periksa API key, model, dan akun Google AI Studio.'
  }

  if (code === 'GEMINI_QUOTA_EXCEEDED') {
    return 'Kuota Gemini API sedang habis atau terkena rate limit. Tunggu beberapa saat, lalu coba kirim ulang.'
  }

  if (code === 'GEMINI_EMPTY_RESPONSE') {
    return 'Gemini API tidak mengirim jawaban chat. Coba ulangi atau cek konfigurasi model.'
  }

  if (code === 'GEMINI_PROXY_ERROR') {
    return 'Server lokal gagal memproses chat Gemini. Cek terminal atau restart server lokal.'
  }

  return 'Gemini API belum bisa menjawab chat. Cek API key, koneksi, dan restart server lokal.'
}

function requireText(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new GeminiChatError(
      `Gemini merespons, tetapi field ${fieldName} kosong atau tidak valid.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  return value.trim()
}

function requireStringList(value: unknown, fieldName: string) {
  if (!Array.isArray(value)) {
    throw new GeminiChatError(
      `Gemini merespons, tetapi field ${fieldName} bukan daftar teks.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)

  if (cleaned.length === 0) {
    throw new GeminiChatError(
      `Gemini merespons, tetapi field ${fieldName} belum berisi data.`,
      'GEMINI_INVALID_RESPONSE',
    )
  }

  return cleaned
}
