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
              parts: [{ text: buildPrompt(input) }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: buildResponseSchema(),
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const detail = await geminiResponse.text()
      sendJson(res, 502, {
        error: 'GEMINI_REQUEST_FAILED',
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

function buildPrompt(input) {
  const areas = Array.isArray(input.areas) && input.areas.length > 0
    ? input.areas.join(', ')
    : input.area || 'Tidak disebutkan'
  const prioritySignals =
    Array.isArray(input.flags) && input.flags.length > 0 ? input.flags.join(', ') : 'Tidak ada'

  return `
Kamu adalah asisten edukasi kesehatan awal untuk aplikasi Sehatara.

Tugas:
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

function buildResponseSchema() {
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
