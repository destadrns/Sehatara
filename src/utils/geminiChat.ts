import type { ChatAiInput, ChatAiResult } from '../types/sehatara'
import {
  GeminiError,
  extractErrorCode,
  readGeminiJsonResponse,
  requireStringListField,
  requireTextField,
} from './geminiCommon'

export async function askGeminiChat(input: ChatAiInput): Promise<ChatAiResult> {
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const payload = await readGeminiJsonResponse(response)

    if (!response.ok) {
      const code = extractErrorCode(payload, response.status)
      throw new GeminiError(createGeminiChatErrorMessage(code, input.language), code, response.status)
    }

    return normalizeChatResult(payload?.result)
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

export function getGeminiChatErrorMessage(error: unknown, language = 'id') {
  if (error instanceof GeminiError) {
    return error.message
  }

  return language === 'en'
    ? 'Ask AI failed to get a Gemini answer. Try again after making sure the API key and local server are active.'
    : 'Tanya AI gagal mengambil jawaban Gemini. Coba ulangi setelah memastikan API key dan server lokal aktif.'
}

function normalizeChatResult(value: unknown): ChatAiResult {
  if (!value || typeof value !== 'object') {
    throw new GeminiError(
      'Gemini merespons, tetapi format jawaban chat tidak sesuai kebutuhan aplikasi.',
      'GEMINI_INVALID_RESPONSE',
    )
  }

  const record = value as Partial<ChatAiResult>
  const warning = typeof record.warning === 'string' ? record.warning.trim() : ''

  return {
    source: 'gemini',
    title: requireTextField(record.title, 'title'),
    body: requireTextField(record.body, 'body'),
    points: requireStringListField(record.points, 'points'),
    warning: warning || undefined,
    nextStep: requireTextField(record.nextStep, 'nextStep'),
    medicineNote: requireStringListField(record.medicineNote, 'medicineNote'),
    recoveryPlan: requireStringListField(record.recoveryPlan, 'recoveryPlan'),
    handoffSummary: requireTextField(record.handoffSummary, 'handoffSummary'),
    safetyMessage: requireTextField(record.safetyMessage, 'safetyMessage'),
  }
}

function createGeminiChatErrorMessage(code: string, language = 'id') {
  const en = language === 'en'

  if (code === 'GEMINI_API_KEY_MISSING') {
    return en
      ? 'Gemini API key is not detected. Fill GEMINI_API_KEY in .env.local, save it, then restart the server.'
      : 'Gemini API key belum terbaca. Isi GEMINI_API_KEY di .env.local, simpan, lalu restart server.'
  }

  if (code === 'GEMINI_CHAT_INPUT_MISSING') {
    return en
      ? 'Write a question before sending it to Gemini.'
      : 'Tulis pertanyaan terlebih dahulu sebelum mengirim ke Gemini.'
  }

  if (code === 'GEMINI_REQUEST_FAILED') {
    return en
      ? 'The chat request to Gemini API failed. Check the API key, model, and Google AI Studio account.'
      : 'Request chat ke Gemini API gagal. Periksa API key, model, dan akun Google AI Studio.'
  }

  if (code === 'GEMINI_QUOTA_EXCEEDED') {
    return en
      ? 'Gemini API quota is exhausted or rate-limited. Wait a moment, then send again.'
      : 'Kuota Gemini API sedang habis atau terkena rate limit. Tunggu beberapa saat, lalu coba kirim ulang.'
  }

  if (code === 'GEMINI_EMPTY_RESPONSE') {
    return en
      ? 'Gemini API did not send a chat answer. Try again or check the model configuration.'
      : 'Gemini API tidak mengirim jawaban chat. Coba ulangi atau cek konfigurasi model.'
  }

  if (code === 'GEMINI_PROXY_ERROR') {
    return en
      ? 'The local server failed to process Gemini chat. Check the terminal or restart the local server.'
      : 'Server lokal gagal memproses chat Gemini. Cek terminal atau restart server lokal.'
  }

  return en
    ? 'Gemini API cannot answer the chat yet. Check the API key, connection, and restart the local server.'
    : 'Gemini API belum bisa menjawab chat. Cek API key, koneksi, dan restart server lokal.'
}
