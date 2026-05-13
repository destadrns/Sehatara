import type { LanguageMode } from '../types/sehatara'

const localizedMedicineData = {
  id: {
    medicineTopics: [
      {
        id: 'pain',
        label: 'Pereda nyeri',
        note: 'Perhatikan aturan pakai, batas harian, dan kondisi lambung atau hati.',
        bestFor: 'Keluhan nyeri ringan sampai sedang yang tidak disertai tanda darurat.',
        avoidWhen: 'Nyeri berat, menetap, sering kambuh, atau disertai keluhan dada dan sesak.',
        checklist: [
          'Baca kandungan aktif, bukan hanya merek di kemasan.',
          'Cek batas pemakaian harian pada label.',
          'Perhatikan riwayat lambung, hati, ginjal, alergi, atau obat rutin.',
        ],
        questions: [
          'Aman tidak jika punya riwayat maag atau lambung sensitif?',
          'Boleh tidak dipakai bersama obat lain yang sedang diminum?',
        ],
      },
      {
        id: 'cold',
        label: 'Obat flu/batuk',
        note: 'Beberapa obat bisa membuat mengantuk atau tidak cocok untuk tekanan darah tertentu.',
        bestFor: 'Keluhan flu, batuk, hidung tersumbat, atau tenggorokan tidak nyaman yang masih ringan.',
        avoidWhen: 'Sesak, demam tinggi lama, batuk berdarah, atau punya tekanan darah tinggi tanpa arahan.',
        checklist: [
          'Cek apakah obat menyebabkan kantuk.',
          'Pastikan tidak ada kandungan ganda dari dua obat flu berbeda.',
          'Perhatikan kondisi asma, tekanan darah, atau obat rutin.',
        ],
        questions: [
          'Apakah obat ini membuat mengantuk?',
          'Apakah kandungannya bentrok dengan obat flu lain?',
        ],
      },
      {
        id: 'antibiotic',
        label: 'Antibiotik',
        note: 'Gunakan sesuai resep. Jangan berhenti atau mengulang sendiri tanpa arahan dokter.',
        bestFor: 'Hanya untuk kondisi tertentu setelah dinilai tenaga kesehatan.',
        avoidWhen: 'Memakai sisa obat lama, obat milik orang lain, atau mencoba sendiri tanpa resep.',
        checklist: [
          'Pastikan antibiotik berasal dari resep atau arahan dokter.',
          'Ikuti aturan pakai sesuai arahan yang diberikan.',
          'Jangan mengulang antibiotik lama tanpa pemeriksaan ulang.',
        ],
        questions: [
          'Apa yang harus dilakukan jika lupa minum?',
          'Kapan perlu kembali konsultasi jika belum membaik?',
        ],
      },
      {
        id: 'supplement',
        label: 'Vitamin/suplemen',
        note: 'Tetap cek dosis label dan interaksi jika sedang minum obat lain.',
        bestFor: 'Membantu melengkapi kebutuhan tertentu, bukan pengganti makan, tidur, atau pemeriksaan.',
        avoidWhen: 'Dipakai berlebihan, digabung banyak suplemen, atau saat ada penyakit tertentu tanpa konsultasi.',
        checklist: [
          'Cek dosis pada label dan jangan menggandakan kandungan yang sama.',
          'Perhatikan interaksi dengan obat rutin.',
          'Pastikan tujuan pemakaiannya jelas dan realistis.',
        ],
        questions: [
          'Apakah suplemen ini aman dengan obat yang sedang diminum?',
          'Berapa lama sebaiknya dievaluasi manfaatnya?',
        ],
      },
    ],
    medicineChecklist: [
      'Nama obat dan bentuknya sudah jelas.',
      'Aturan pakai dibaca dari label atau resep.',
      'Cek alergi atau riwayat reaksi obat.',
      'Cek apakah sedang hamil, menyusui, atau punya penyakit tertentu.',
      'Tanyakan ke apoteker jika sedang minum obat lain.',
    ],
  },
  en: {
    medicineTopics: [
      {
        id: 'pain',
        label: 'Pain relievers',
        note: 'Check directions, daily limits, and stomach or liver conditions.',
        bestFor: 'Mild to moderate pain without emergency warning signs.',
        avoidWhen: 'Severe, persistent, recurring pain, or pain with chest discomfort and shortness of breath.',
        checklist: [
          'Read the active ingredient, not only the brand name.',
          'Check the daily use limit on the label.',
          'Consider stomach, liver, kidney, allergy history, or routine medicine.',
        ],
        questions: [
          'Is this safe with a history of gastritis or a sensitive stomach?',
          'Can it be used with other medicine I am taking?',
        ],
      },
      {
        id: 'cold',
        label: 'Cold/cough medicine',
        note: 'Some medicine can cause drowsiness or may not fit certain blood pressure conditions.',
        bestFor: 'Mild cold, cough, blocked nose, or throat discomfort.',
        avoidWhen: 'Shortness of breath, prolonged high fever, coughing blood, or high blood pressure without advice.',
        checklist: [
          'Check whether the medicine causes drowsiness.',
          'Make sure two cold medicines do not contain duplicate ingredients.',
          'Consider asthma, blood pressure, or routine medicine.',
        ],
        questions: [
          'Will this medicine make me sleepy?',
          'Does it overlap with another cold medicine?',
        ],
      },
      {
        id: 'antibiotic',
        label: 'Antibiotics',
        note: 'Use only as prescribed. Do not stop or repeat them without medical advice.',
        bestFor: 'Only for certain conditions after assessment by a health professional.',
        avoidWhen: 'Using leftover medicine, someone else’s medicine, or trying it without a prescription.',
        checklist: [
          'Make sure the antibiotic comes from a prescription or doctor advice.',
          'Follow the instructions that were given.',
          'Do not repeat an old antibiotic without another checkup.',
        ],
        questions: [
          'What should I do if I miss a dose?',
          'When should I consult again if I do not improve?',
        ],
      },
      {
        id: 'supplement',
        label: 'Vitamins/supplements',
        note: 'Still check label dosage and interactions if you take other medicine.',
        bestFor: 'Supporting specific needs, not replacing meals, sleep, or medical checks.',
        avoidWhen: 'Overuse, combining many supplements, or using them with certain illnesses without advice.',
        checklist: [
          'Check the label and avoid doubling the same ingredient.',
          'Pay attention to interactions with routine medicine.',
          'Make sure the purpose is clear and realistic.',
        ],
        questions: [
          'Is this supplement safe with my current medicine?',
          'How long should I evaluate whether it helps?',
        ],
      },
    ],
    medicineChecklist: [
      'The medicine name and form are clear.',
      'Directions are read from the label or prescription.',
      'Allergies or previous reactions are checked.',
      'Pregnancy, breastfeeding, or certain conditions are considered.',
      'Ask a pharmacist if you are taking other medicine.',
    ],
  },
}

export function getMedicineData(language: LanguageMode) {
  return localizedMedicineData[language]
}

export const medicineTopics = localizedMedicineData.id.medicineTopics
export const medicineChecklist = localizedMedicineData.id.medicineChecklist
