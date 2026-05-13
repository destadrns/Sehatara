import { Bot, Brain, Leaf, Pill, Stethoscope } from 'lucide-react'
import type { FeatureConfig, LanguageMode } from '../types/sehatara'

const featureIcons = {
  symptom: Stethoscope,
  medicine: Pill,
  preventive: Leaf,
  mental: Brain,
  chat: Bot,
} as const

const localizedFeatures: Record<LanguageMode, FeatureConfig[]> = {
  id: [
    {
      id: 'symptom',
      label: 'Cerita Gejala',
      navLabel: 'Gejala',
      eyebrow: 'Panduan gejala',
      title: 'Ceritakan gejalamu. Sehatara bantu susun.',
      homeTitle: 'Cerita Gejala',
      description:
        'Rangkum beberapa area keluhan, durasi, intensitas, dan arahan awal dari Gemini.',
      longDescription:
        'Isi beberapa detail singkat, lalu Sehatara bantu membuat rangkuman awal. Fokusnya bukan menebak diagnosis, tapi membantu kamu tahu informasi apa yang penting dan kapan perlu mencari bantuan medis.',
      accent: 'sage',
      icon: featureIcons.symptom,
      highlights: ['Multi-area', 'Analisis Gemini', 'Langkah 24 jam'],
      panelTitle: 'Yang dibantu di sini',
      panelItems: [
        'Merapikan cerita gejala agar lebih mudah dibaca.',
        'Membaca beberapa area keluhan dalam satu analisis.',
        'Menjaga hasil tetap sebagai panduan awal, bukan diagnosis.',
      ],
    },
    {
      id: 'medicine',
      label: 'Catatan Obat',
      navLabel: 'Catatan Obat',
      eyebrow: 'Catatan obat aman',
      title: 'Simpan catatan obat. Pahami sebelum memakai.',
      homeTitle: 'Catatan Obat',
      description:
        'Simpan catatan dari gejala/chat, cek batas aman, dan siapkan pertanyaan ke apoteker.',
      longDescription:
        'Halaman ini dibuat seperti lembar bantu baca obat. Kamu bisa membawa catatan dari fitur lain, memilih konteks, melihat batas aman, dan menyiapkan pertanyaan yang lebih rapi untuk tenaga kesehatan.',
      accent: 'teal',
      icon: featureIcons.medicine,
      highlights: ['Catatan tersimpan', 'Checklist aman', 'Pertanyaan apoteker'],
      panelTitle: 'Batas aman',
      panelItems: [
        'Tidak memberi dosis personal.',
        'Tidak menyarankan berhenti obat dokter.',
        'Alergi, kehamilan, dan obat lain tetap perlu dikonsultasikan.',
      ],
    },
    {
      id: 'preventive',
      label: 'Rencana Pulih',
      navLabel: 'Rencana Pulih',
      eyebrow: 'Perawatan ringan',
      title: 'Ubah saran ringan jadi rencana pulih.',
      homeTitle: 'Rencana Pulih',
      description:
        'Simpan saran perawatan ringan lalu susun target kecil untuk tujuh hari.',
      longDescription:
        'Daripada target besar yang cepat berhenti, halaman ini membantu menyimpan saran ringan dari fitur lain, memilih satu kebiasaan kecil, dan membuat rencana tujuh hari yang masih realistis.',
      accent: 'amber',
      icon: featureIcons.preventive,
      highlights: ['Saran tersimpan', 'Rencana 7 hari', 'Tidak ekstrem'],
      panelTitle: 'Biar mudah dijalani',
      panelItems: [
        'Mulai dari satu kebiasaan yang paling gampang dilakukan.',
        'Hindari target yang terlalu berat di awal.',
        'Nilai dari konsistensi, bukan dari sempurna setiap hari.',
      ],
    },
    {
      id: 'mental',
      label: 'Ruang Tenang',
      navLabel: 'Tenang',
      eyebrow: 'Mental wellness dasar',
      title: 'Masuk ke ruang tenang. Mulai dari napas.',
      homeTitle: 'Ruang Tenang',
      description:
        'Latihan napas, grounding, dan langkah kecil saat pikiran terasa penuh.',
      longDescription:
        'Saat cemas atau sulit fokus, mulai dari hal yang bisa dikendalikan sekarang. Halaman ini berisi latihan singkat, bukan pengganti psikolog atau psikiater.',
      accent: 'violet',
      icon: featureIcons.mental,
      highlights: ['Napas terarah', 'Grounding', 'Langkah kecil'],
      panelTitle: 'Batas dukungan',
      panelItems: [
        'Tidak menggantikan psikolog atau psikiater.',
        'Tidak memberi label diagnosis.',
        'Jika terasa krisis, hubungi bantuan darurat atau orang terpercaya.',
      ],
    },
    {
      id: 'chat',
      label: 'Tanya Sehatara',
      navLabel: 'Tanya AI',
      eyebrow: 'Asisten AI',
      title: 'Butuh tanya bebas? Pakai ruang chat khusus.',
      homeTitle: 'Tanya Sehatara',
      description:
        'Ruang chat untuk pertanyaan kesehatan awal yang tidak cocok dimasukkan ke fitur lain.',
      longDescription:
        'Chat disediakan sebagai ruang terpisah agar fitur lain tidak semuanya terasa seperti chatbot. Jawaban tetap dibatasi sebagai edukasi dan panduan awal.',
      accent: 'clay',
      icon: featureIcons.chat,
      highlights: ['Tanya bebas', 'Jawaban edukatif', 'Tetap ada batas aman'],
      panelTitle: 'Aturan chat',
      panelItems: [
        'Tidak menggantikan dokter atau tenaga medis.',
        'Tidak memberi resep, diagnosis final, atau dosis personal.',
        'Untuk tanda bahaya, prioritaskan bantuan medis langsung.',
      ],
    },
  ],
  en: [
    {
      id: 'symptom',
      label: 'Symptom Story',
      navLabel: 'Symptoms',
      eyebrow: 'Symptom guide',
      title: 'Tell us what you feel. Sehatara helps organize it.',
      homeTitle: 'Symptom Story',
      description:
        'Summarize multiple complaint areas, duration, intensity, and early guidance from Gemini.',
      longDescription:
        'Add a few short details and Sehatara helps create an early summary. The goal is not to guess a diagnosis, but to help you see which information matters and when to seek medical help.',
      accent: 'sage',
      icon: featureIcons.symptom,
      highlights: ['Multi-area', 'Gemini analysis', '24-hour steps'],
      panelTitle: 'What this helps with',
      panelItems: [
        'Organize symptom stories so they are easier to read.',
        'Read several complaint areas in one analysis.',
        'Keep the result as early guidance, not a diagnosis.',
      ],
    },
    {
      id: 'medicine',
      label: 'Medicine Notes',
      navLabel: 'Medicine Notes',
      eyebrow: 'Safer medicine notes',
      title: 'Save medicine notes. Understand before using.',
      homeTitle: 'Medicine Notes',
      description:
        'Save notes from symptoms/chat, check safety limits, and prepare questions for a pharmacist.',
      longDescription:
        'This page works like a helper sheet for reading medicine information. You can bring notes from other features, choose a context, review safety limits, and prepare clearer questions for health professionals.',
      accent: 'teal',
      icon: featureIcons.medicine,
      highlights: ['Saved notes', 'Safety checklist', 'Pharmacist questions'],
      panelTitle: 'Safety boundaries',
      panelItems: [
        'Does not provide personal dosages.',
        'Does not suggest stopping doctor-prescribed medicine.',
        'Allergies, pregnancy, and other medicines still need professional advice.',
      ],
    },
    {
      id: 'preventive',
      label: 'Recovery Plan',
      navLabel: 'Recovery Plan',
      eyebrow: 'Light care',
      title: 'Turn simple advice into a recovery plan.',
      homeTitle: 'Recovery Plan',
      description:
        'Save light-care suggestions and shape them into small seven-day targets.',
      longDescription:
        'Instead of big targets that are easy to abandon, this page helps save light suggestions from other features, choose one small habit, and build a realistic seven-day plan.',
      accent: 'amber',
      icon: featureIcons.preventive,
      highlights: ['Saved suggestions', '7-day plan', 'Not extreme'],
      panelTitle: 'Keep it doable',
      panelItems: [
        'Start with one habit that feels easiest to do.',
        'Avoid goals that are too heavy at the beginning.',
        'Value consistency, not perfection every day.',
      ],
    },
    {
      id: 'mental',
      label: 'Calm Room',
      navLabel: 'Calm',
      eyebrow: 'Basic mental wellness',
      title: 'Enter the calm room. Start with breathing.',
      homeTitle: 'Calm Room',
      description:
        'Breathing practice, grounding, and small steps when your mind feels full.',
      longDescription:
        'When anxiety or focus feels difficult, start with something you can control now. This page contains short exercises, not a replacement for a psychologist or psychiatrist.',
      accent: 'violet',
      icon: featureIcons.mental,
      highlights: ['Guided breathing', 'Grounding', 'Small steps'],
      panelTitle: 'Support boundaries',
      panelItems: [
        'Does not replace a psychologist or psychiatrist.',
        'Does not label a diagnosis.',
        'If it feels like a crisis, contact emergency help or someone you trust.',
      ],
    },
    {
      id: 'chat',
      label: 'Ask Sehatara',
      navLabel: 'Ask AI',
      eyebrow: 'AI assistant',
      title: 'Need an open question? Use the dedicated chat room.',
      homeTitle: 'Ask Sehatara',
      description:
        'A chat room for early health questions that do not fit neatly into other features.',
      longDescription:
        'Chat is separated so the other features do not all feel like chatbots. Answers remain limited to education and early guidance.',
      accent: 'clay',
      icon: featureIcons.chat,
      highlights: ['Open questions', 'Educational answers', 'Safety boundaries'],
      panelTitle: 'Chat rules',
      panelItems: [
        'Does not replace doctors or medical professionals.',
        'Does not provide prescriptions, final diagnoses, or personal dosages.',
        'For danger signs, prioritize direct medical help.',
      ],
    },
  ],
}

export function getFeatures(language: LanguageMode) {
  return localizedFeatures[language]
}

export const features = getFeatures('id')
