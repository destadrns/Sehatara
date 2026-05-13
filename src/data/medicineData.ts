export const medicineTopics = [
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
]

export const medicineChecklist = [
  'Nama obat dan bentuknya sudah jelas.',
  'Aturan pakai dibaca dari label atau resep.',
  'Cek alergi atau riwayat reaksi obat.',
  'Cek apakah sedang hamil, menyusui, atau punya penyakit tertentu.',
  'Tanyakan ke apoteker jika sedang minum obat lain.',
]
