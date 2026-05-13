const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

export async function handleGeminiSymptomAnalysis(req, res, env = process.env) {
  try {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED' })
      return
    }

    const apiKey = env.GEMINI_API_KEY?.trim()

    if (!apiKey) {
      sendJson(res, 503, { error: 'GEMINI_API_KEY_MISSING' })
      return
    }

    const input = await readJsonBody(req)
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash'
    const geminiResponse = await fetch(
      `${GEMINI_ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: buildSymptomPrompt(input) }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: buildSymptomResponseSchema(),
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text()
      const failure = getGeminiRequestFailure(detail, geminiResponse.status)
      sendJson(res, failure.statusCode, {
        error: failure.error,
        detail: detail.slice(0, 500),
      })
      return
    }

    const payload = await geminiResponse.json()
    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('')

    if (!text) {
      sendJson(res, 502, { error: 'GEMINI_EMPTY_RESPONSE' })
      return
    }

    sendJson(res, 200, { result: JSON.parse(text) })
  } catch (error) {
    sendJson(res, 500, {
      error: 'GEMINI_PROXY_ERROR',
      detail: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export async function handleGeminiChat(req, res, env = process.env) {
  try {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED' })
      return
    }

    const apiKey = env.GEMINI_API_KEY?.trim()

    if (!apiKey) {
      sendJson(res, 503, { error: 'GEMINI_API_KEY_MISSING' })
      return
    }

    const input = await readJsonBody(req)
    const message = typeof input.message === 'string' ? input.message.trim() : ''

    if (!message) {
      sendJson(res, 400, { error: 'GEMINI_CHAT_INPUT_MISSING' })
      return
    }

    const model = env.GEMINI_MODEL || 'gemini-2.5-flash'
    const geminiResponse = await fetch(
      `${GEMINI_ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: buildChatPrompt(input) }],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: 'application/json',
            responseSchema: buildChatResponseSchema(),
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text()
      const failure = getGeminiRequestFailure(detail, geminiResponse.status)
      sendJson(res, failure.statusCode, {
        error: failure.error,
        detail: detail.slice(0, 500),
      })
      return
    }

    const payload = await geminiResponse.json()
    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('')

    if (!text) {
      sendJson(res, 502, { error: 'GEMINI_EMPTY_RESPONSE' })
      return
    }

    sendJson(res, 200, { result: JSON.parse(text) })
  } catch (error) {
    sendJson(res, 500, {
      error: 'GEMINI_PROXY_ERROR',
      detail: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

function getGeminiRequestFailure(detail, status) {
  if (
    status === 429 ||
    detail.includes('RESOURCE_EXHAUSTED') ||
    detail.toLowerCase().includes('quota exceeded')
  ) {
    return {
      statusCode: 429,
      error: 'GEMINI_QUOTA_EXCEEDED',
    }
  }

  return {
    statusCode: 502,
    error: 'GEMINI_REQUEST_FAILED',
  }
}

function buildSymptomPrompt(input) {
  const outputLanguage = input.language === 'en' ? 'English' : 'Bahasa Indonesia'
  const areas = Array.isArray(input.areas) && input.areas.length > 0
    ? input.areas.join(', ')
    : input.area || 'Tidak disebutkan'
  const prioritySignals =
    Array.isArray(input.flags) && input.flags.length > 0 ? input.flags.join(', ') : 'Tidak ada'

  return `
Kamu adalah asisten edukasi kesehatan awal untuk aplikasi Sehatara.

Tugas:
- Tulis semua field JSON dalam ${outputLanguage}.
- Berikan analisis edukatif yang terasa personal, bernilai, dan tidak seperti template.
- Rangkum pola keluhan user dengan bahasa yang hangat, jelas, dan cukup lengkap.
- Jelaskan kemungkinan kategori umum secara hati-hati bila relevan, misalnya infeksi ringan, masalah pencernaan, kelelahan, dehidrasi, kurang tidur, atau iritasi. Jangan menyatakan diagnosis final.
- Jika area keluhan lebih dari satu, hubungkan konteks antar area dan jelaskan kenapa perlu dipantau bersama.
- Jangan memberi resep, dosis personal, merek obat, atau instruksi mengganti obat dokter.
- Untuk medicineNote, boleh berikan kategori obat bebas yang umum untuk dipelajari bila relevan, plus hal yang perlu dicek di label atau ditanyakan ke apoteker.
- Jika obat bukan langkah utama, jelaskan kenapa dan arahkan ke pemantauan, hidrasi, istirahat, makanan ringan, atau konsultasi.
- Jika ada kondisi prioritas, keluhan berat, atau kombinasi gejala yang mengkhawatirkan, arahkan ke bantuan medis lebih cepat.
- Tulis seperti panduan yang dibaca keluarga di rumah: ramah, sederhana, tidak kaku, dan mudah dipindai.
- Pakai kalimat pendek-menengah. Hindari paragraf terlalu panjang, sapaan berlebihan, tanda seru, dan bahasa yang menakut-nakuti.
- Gunakan "kamu" atau kalimat netral, jangan terlalu formal seperti surat rumah sakit.

Data user:
- Keluhan: ${input.symptomText}
- Area: ${areas}
- Durasi: ${input.duration}
- Tingkat keluhan: ${input.intensity}/10
- Kondisi prioritas dipilih: ${prioritySignals}

Aturan isi JSON:
- title: judul spesifik dari keluhan, bukan judul generik.
- summary: 3-4 kalimat natural. Buat ringkas, jelas, dan tidak seperti template.
- recommendation: 2-3 kalimat arahan utama yang praktis dan menenangkan.
- careSteps: 4 langkah pendek untuk 24 jam ke depan. Setiap item maksimal 18 kata.
- questionsToTrack: 4 hal yang perlu dipantau. Tulis sebagai pertanyaan atau pengamatan singkat.
- doctorVisitAdvice: 4 kondisi kapan perlu konsultasi atau mencari bantuan medis. Tulis jelas dan tidak bertele-tele.
- medicineNote: 4 catatan obat umum yang aman untuk dipelajari. Setiap item harus mudah dibaca orang tua, tanpa dosis, merek, atau resep.
- recoveryPlan: 4 rencana pulih ringan yang bisa disimpan. Tulis sebagai langkah harian yang konkret.
- safetyMessage: satu kalimat penegasan bahwa ini edukasi awal, bukan diagnosis final.

Balas hanya JSON sesuai schema. Jangan bungkus dengan markdown.
`.trim()
}

function buildSymptomResponseSchema() {
  return {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      summary: { type: 'STRING' },
      urgencyLevel: {
        type: 'STRING',
        enum: ['low', 'medium', 'high'],
      },
      redFlags: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      recommendation: { type: 'STRING' },
      careSteps: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      questionsToTrack: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      doctorVisitAdvice: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      medicineNote: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      recoveryPlan: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      safetyMessage: { type: 'STRING' },
    },
    required: [
      'title',
      'summary',
      'urgencyLevel',
      'redFlags',
      'recommendation',
      'careSteps',
      'questionsToTrack',
      'doctorVisitAdvice',
      'medicineNote',
      'recoveryPlan',
      'safetyMessage',
    ],
  }
}

function buildChatPrompt(input) {
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  const recentHistory = formatChatHistory(input.history)
  const outputLanguage = input.language === 'en' ? 'English' : 'Bahasa Indonesia'

  return `
Kamu adalah Sehatara, asisten AI edukasi kesehatan awal untuk pengguna umum.

Tugas:
- Tulis semua field JSON dalam ${outputLanguage}.
- Jawab pertanyaan terbaru dengan bahasa yang hangat, natural, dan mudah dipahami keluarga di rumah.
- Jawaban harus terasa membantu, bukan template kosong.
- Fokus pada edukasi awal, persiapan informasi, pemantauan, pertanyaan untuk tenaga kesehatan, dan langkah ringan yang aman.
- Jangan memberi diagnosis final, resep, dosis personal, merek obat wajib, atau instruksi mengganti obat dokter.
- Jika pertanyaan kurang detail, tetap beri arahan awal dan minta detail yang paling penting.
- Jika ada tanda bahaya seperti sesak berat, nyeri dada, pingsan, lemas satu sisi, kebingungan berat, perdarahan banyak, kejang, atau keluhan memburuk cepat, arahkan pengguna mencari bantuan medis segera.
- Jika pertanyaan bukan tentang kesehatan, arahkan kembali secara singkat ke bantuan kesehatan awal.
- Hindari sapaan berlebihan, tanda seru, kalimat menakut-nakuti, dan paragraf terlalu panjang.
- Gunakan "kamu" atau kalimat netral. Jangan terlalu formal seperti surat rumah sakit.

Percakapan terakhir:
${recentHistory}

Pertanyaan terbaru:
${message}

Aturan isi JSON:
- title: judul spesifik yang merangkum kebutuhan user.
- body: 3-4 kalimat natural yang menjawab inti pertanyaan.
- points: 4 poin penting, masing-masing singkat dan mudah dipindai.
- warning: isi dengan peringatan singkat bila ada risiko/tanda bahaya. Jika tidak ada, isi string kosong.
- nextStep: satu langkah berikutnya yang paling masuk akal.
- medicineNote: 3 catatan obat yang aman untuk dipelajari atau ditanyakan. Jika obat tidak relevan, isi dengan catatan kehati-hatian umum, bukan kosong.
- recoveryPlan: 3 langkah ringan yang bisa disimpan sebagai rencana pulih. Buat konkret dan realistis.
- handoffSummary: 1-2 kalimat ringkasan konteks untuk disimpan ke fitur lain.
- safetyMessage: satu kalimat bahwa jawaban ini edukasi awal, bukan diagnosis atau pengganti tenaga medis.

Balas hanya JSON sesuai schema. Jangan bungkus dengan markdown.
`.trim()
}

function buildChatResponseSchema() {
  return {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      body: { type: 'STRING' },
      points: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      warning: { type: 'STRING' },
      nextStep: { type: 'STRING' },
      medicineNote: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      recoveryPlan: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      handoffSummary: { type: 'STRING' },
      safetyMessage: { type: 'STRING' },
    },
    required: [
      'title',
      'body',
      'points',
      'warning',
      'nextStep',
      'medicineNote',
      'recoveryPlan',
      'handoffSummary',
      'safetyMessage',
    ],
  }
}

function formatChatHistory(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return 'Belum ada percakapan sebelumnya.'
  }

  const lines = history
    .slice(-8)
    .map((item) => {
      const role = item?.role === 'assistant' ? 'Sehatara' : 'Pengguna'
      const text = typeof item?.text === 'string' ? item.text.trim() : ''

      if (!text) {
        return ''
      }

      return `- ${role}: ${text.slice(0, 520)}`
    })
    .filter(Boolean)

  return lines.length > 0 ? lines.join('\n') : 'Belum ada percakapan sebelumnya.'
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch (error) {
        reject(error)
      }
    })

    req.on('error', reject)
  })
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}
