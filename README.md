# JikAI — Simulator Dunia Alternatif dengan AI 🌌

**Bagaimana jika sejarah berjalan berbeda? Bagaimana jika satu keputusan kecil mengubah masa depan dunia?**

JikAI adalah website simulator dunia alternatif berbasis kecerdasan buatan (AI) yang memungkinkan pengguna mengeksplorasi berbagai kemungkinan dari skenario hipotetis. Cukup ajukan pertanyaan _"Bagaimana jika?"_, lalu biarkan AI membantu menggambarkan konsekuensi dan perkembangan dunia alternatif tersebut.

🌐 **Website:** [jik-ai.vercel.app](https://jikai-pi.vercel.app/)

---

## ✨ Fitur Utama

- 🌍 **Simulasi Skenario Alternatif** — Buat simulasi berdasarkan pertanyaan hipotetis, mulai dari perubahan sejarah hingga kemungkinan masa depan.
- 🤖 **Generasi Skenario dengan AI** — Manfaatkan Groq AI untuk menghasilkan penjelasan dan perkembangan skenario secara terstruktur.
- 🕰️ **Timeline Interaktif** — Telusuri rangkaian peristiwa yang menggambarkan perkembangan dunia alternatif.
- 🔀 **Cabang Alternatif** — Pilih peristiwa dalam timeline dan eksplorasi apa yang mungkin terjadi jika keputusan atau peristiwa tersebut berbeda.
- ⚖️ **Perbandingan Dua Dunia** — Bandingkan skenario awal dengan cabang alternatif berdasarkan empat dimensi, ringkasan perbedaan utama, dan catatan ketidakpastian.
- 🔎 **Eksplorasi Berbagai Kemungkinan** — Gunakan imajinasi dan AI untuk mengeksplorasi konsekuensi dari perubahan suatu peristiwa atau keputusan.

## 🛠️ Teknologi yang Digunakan

| Teknologi    | Kegunaan                                       |
| ------------ | ---------------------------------------------- |
| React        | Membangun antarmuka pengguna                   |
| Vite         | Development server dan proses build frontend   |
| React Router | Navigasi ant halaman                           |
| Node.js      | Menjalankan runtime backend                    |
| Express.js   | Menyediakan API untuk frontend                 |
| Groq AI      | Memproses dan menghasilkan skenario alternatif |
| Vercel       | Deployment aplikasi web dan backend            |

## 🏗️ Arsitektur Proyek

JikAI menggunakan arsitektur frontend dan backend terpisah agar antarmuka pengguna dapat berkomunikasi dengan layanan AI melalui API.

- **Frontend:** React + Vite, bertanggung jawab atas antarmuka, navigasi, dan interaksi pengguna.
- **Backend:** Node.js + Express, menangani permintaan API dan komunikasi dengan Groq AI.
- **AI Provider:** Groq digunakan untuk menghasilkan skenario, cabang timeline, dan perbandingan dunia.

API key disimpan di sisi backend dan tidak seharusnya dimasukkan ke dalam kode frontend.

## 🚀 Menjalankan Secara Lokal

### Prasyarat

Pastikan perangkat kamu sudah memiliki:

- Node.js dan npm.
- Git.
- API key Groq yang valid.

### 1. Clone repository

```bash
git clone https://github.com/MaulanaHidayatulloh/JikAI.git
cd JikAI
```

### 2. Instal dependensi frontend

```bash
npm install
```

### 3. Konfigurasi backend

Masuk ke direktori backend:

```bash
cd server
npm install
```

Salin file konfigurasi contoh:

**Windows (Command Prompt):**

```cmd
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Buka file `server/.env`, kemudian isi API key:

```env
GROQ_API_KEY=masukkan_api_key_groq_kamu
```

Gunakan nama variabel dan konfigurasi lain sesuai kebutuhan yang tercantum dalam `server/.env.example`.

### 4. Jalankan backend

Dari direktori `server`, jalankan:

```bash
npm run dev
```

Biarkan terminal backend tetap berjalan.

### 5. Jalankan frontend

Buka terminal baru, kembali ke direktori utama proyek, lalu jalankan:

```bash
npm run dev
```

Vite akan menampilkan alamat lokal untuk membuka aplikasi di browser.

> **Catatan:** Pastikan konfigurasi URL API frontend mengarah ke backend lokal ketika menjalankan aplikasi di komputer sendiri. Sesuaikan konfigurasi CORS backend jika diperlukan.

## 🌐 Deployment

JikAI menggunakan deployment berbasis Vercel dengan frontend dan backend yang dipisahkan.

Saat melakukan deployment sendiri, pastikan:

1. Variabel lingkungan `GROQ_API_KEY` sudah dikonfigurasi pada lingkungan backend.
2. URL backend yang digunakan frontend sudah benar.
3. CORS backend mengizinkan origin frontend yang digunakan.
4. API key tidak pernah dimasukkan ke repository publik atau dibagikan kepada pengguna.

## 🔐 Keamanan

- Simpan API key dalam file `.env` atau environment variables pada platform deployment.
- Jangan commit file `.env` yang berisi kredensial.
- Gunakan `server/.env.example` sebagai referensi konfigurasi tanpa memasukkan API key asli.
- Pastikan endpoint backend memvalidasi input sebelum meneruskannya ke layanan AI.

## 🗺️ Rencana Pengembangan

JikAI dapat terus dikembangkan dengan berbagai peningkatan, seperti:

- Pengayaan jenis skenario dan pilihan eksplorasi.
- Pengembangan visualisasi timeline dan cabang dunia alternatif.
- Penyempurnaan konsistensi hasil simulasi.
- Peningkatan pengalaman pengguna dan performa aplikasi.

_Daftar ini merupakan arah pengembangan potensial, bukan pernyataan bahwa semua fitur tersebut sedang dikerjakan._

## 🤝 Kontribusi

Kontribusi, saran, dan laporan bug sangat terbuka untuk membantu pengembangan JikAI.

1. Fork repository ini.
2. Buat branch baru untuk perubahan kamu.
3. Commit perubahan dengan pesan yang jelas.
4. Ajukan Pull Request untuk ditinjau.

## 📄 Lisensi

Silakan periksa file lisensi di repository untuk mengetahui ketentuan penggunaan, modifikasi, dan distribusi proyek ini.

---

**Dibuat oleh [Maulana Hidayatulloh Mujanah](https://github.com/MaulanaHidayatulloh)**
