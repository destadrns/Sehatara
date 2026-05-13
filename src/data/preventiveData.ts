import type { LanguageMode } from '../types/sehatara'

const localizedPreventiveData = {
  id: {
    habitFocusOptions: [
      {
        id: 'sleep',
        label: 'Tidur',
        benefit: 'Membantu tubuh pulih, menjaga fokus, dan mengurangi rasa lelah yang menumpuk.',
        target: 'Mulai dari 20 menit lebih awal dari biasanya, bukan langsung memaksa tidur sempurna.',
        plan: ['Tentukan jam tidur realistis', 'Matikan layar 20 menit sebelum tidur', 'Catat kualitas tidur besok pagi'],
        checkIn: 'Besok pagi, nilai apakah badan terasa sedikit lebih segar atau tetap berat.',
      },
      {
        id: 'water',
        label: 'Hidrasi',
        benefit: 'Membantu tubuh tetap stabil saat lemas, pusing ringan, atau aktivitas belajar panjang.',
        target: 'Tambah satu kebiasaan minum yang mudah diingat, misalnya setelah bangun atau sebelum belajar.',
        plan: ['Siapkan botol minum', 'Minum setelah bangun', 'Tambah satu gelas saat belajar'],
        checkIn: 'Pantau warna urin, rasa haus, dan apakah pusing terasa berkurang.',
      },
      {
        id: 'movement',
        label: 'Gerak ringan',
        benefit: 'Membantu badan tidak kaku dan memberi jeda untuk leher, bahu, serta pikiran.',
        target: 'Cukup 8-10 menit gerak ringan, tidak perlu olahraga berat saat badan belum siap.',
        plan: ['Jalan 8-10 menit', 'Peregangan bahu dan leher', 'Ulangi saat jeda belajar'],
        checkIn: 'Catat apakah badan terasa lebih ringan atau justru keluhan bertambah.',
      },
      {
        id: 'meal',
        label: 'Makan teratur',
        benefit: 'Membantu energi lebih stabil, terutama saat mual ringan, lemas, atau jadwal padat.',
        target: 'Mulai dari porsi kecil yang mudah diterima tubuh.',
        plan: ['Jangan lewati makan utama', 'Tambah satu porsi buah/sayur', 'Kurangi camilan saat begadang'],
        checkIn: 'Perhatikan apakah mual, lemas, atau pusing berubah setelah makan lebih teratur.',
      },
    ],
    weeklyRhythm: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  },
  en: {
    habitFocusOptions: [
      {
        id: 'sleep',
        label: 'Sleep',
        benefit: 'Helps the body recover, supports focus, and reduces built-up fatigue.',
        target: 'Start 20 minutes earlier than usual instead of forcing perfect sleep immediately.',
        plan: ['Set a realistic bedtime', 'Turn off screens 20 minutes before bed', 'Note sleep quality tomorrow morning'],
        checkIn: 'Tomorrow morning, notice whether your body feels a little fresher or still heavy.',
      },
      {
        id: 'water',
        label: 'Hydration',
        benefit: 'Helps the body stay stable during fatigue, mild dizziness, or long study sessions.',
        target: 'Add one easy-to-remember drinking habit, such as after waking up or before studying.',
        plan: ['Prepare a water bottle', 'Drink after waking up', 'Add one glass while studying'],
        checkIn: 'Watch urine color, thirst, and whether dizziness feels reduced.',
      },
      {
        id: 'movement',
        label: 'Light movement',
        benefit: 'Helps the body feel less stiff and gives the neck, shoulders, and mind a short break.',
        target: 'Just 8-10 minutes of light movement, no heavy exercise when the body is not ready.',
        plan: ['Walk for 8-10 minutes', 'Stretch shoulders and neck', 'Repeat during study breaks'],
        checkIn: 'Notice whether your body feels lighter or the complaint gets worse.',
      },
      {
        id: 'meal',
        label: 'Regular meals',
        benefit: 'Helps energy stay steadier, especially during mild nausea, weakness, or busy schedules.',
        target: 'Start with small portions that your body can accept.',
        plan: ['Do not skip main meals', 'Add one serving of fruit or vegetables', 'Reduce late-night snacking'],
        checkIn: 'Notice whether nausea, weakness, or dizziness changes after eating more regularly.',
      },
    ],
    weeklyRhythm: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
}

export function getPreventiveData(language: LanguageMode) {
  return localizedPreventiveData[language]
}

export const habitFocusOptions = localizedPreventiveData.id.habitFocusOptions
export const weeklyRhythm = localizedPreventiveData.id.weeklyRhythm
