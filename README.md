# Sehatara

Sehatara adalah prototype web kesehatan awal untuk membantu pengguna merapikan keluhan, memahami catatan obat secara aman, menyusun rencana pulih ringan, dan bertanya melalui asisten AI berbasis Gemini.

Project ini dibuat sebagai capstone dengan fokus pada pengalaman pengguna yang sederhana, responsif, dan mudah dipahami. Sehatara bukan alat diagnosis, bukan pengganti dokter, dan tidak memberikan resep atau dosis personal.

## Fitur Utama

- Cerita Gejala: mencatat keluhan, area gejala, durasi, intensitas, dan menghasilkan rangkuman awal menggunakan Gemini API.
- Catatan Obat: menyimpan catatan dari hasil gejala atau chat, lalu menampilkan checklist aman sebelum memahami obat.
- Rencana Pulih: menyimpan saran perawatan ringan dan mengubahnya menjadi rencana kecil yang lebih mudah dijalani.
- Ruang Tenang: latihan napas, grounding, dan dukungan awal untuk menenangkan diri.
- Tanya Sehatara: ruang tanya umum berbasis Gemini untuk pertanyaan kesehatan awal.

## Teknologi

- React
- Vite
- TypeScript
- Lucide React
- Gemini API
- LocalStorage untuk penyimpanan prototype

## Menjalankan Project

Install dependency:

```bash
npm install
```

Salin konfigurasi environment:

```powershell
Copy-Item .env.example .env.local
```

Isi `GEMINI_API_KEY` di `.env.local`, lalu jalankan:

```bash
npm run dev
```

Buka aplikasi di:

```text
http://127.0.0.1:5173/
```

Jika memakai port khusus:

```bash
npm run dev -- --host 127.0.0.1 --port 5182
```

## Build

```bash
npm run build
```

## Catatan

Sehatara masih berada pada tahap prototype. Integrasi Gemini saat ini dipakai pada fitur Cerita Gejala dan Tanya Sehatara. Untuk kebutuhan produksi, endpoint API perlu dipindahkan ke backend atau serverless function agar API key tidak terekspos di sisi client.
