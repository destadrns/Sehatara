import { Bot, Brain, Leaf, Pill, Stethoscope } from 'lucide-react'
import type { FeatureConfig } from '../types/sehatara'

export const features: FeatureConfig[] = [
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
    icon: Stethoscope,
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
    icon: Pill,
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
    icon: Leaf,
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
    icon: Brain,
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
    icon: Bot,
    highlights: ['Tanya bebas', 'Jawaban edukatif', 'Tetap ada batas aman'],
    panelTitle: 'Aturan chat',
    panelItems: [
      'Tidak menggantikan dokter atau tenaga medis.',
      'Tidak memberi resep, diagnosis final, atau dosis personal.',
      'Untuk tanda bahaya, prioritaskan bantuan medis langsung.',
    ],
  },
]
