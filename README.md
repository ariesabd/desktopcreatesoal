# SoalCreator Studio Desktop (`creatorsoal.exe`)

> **Lufya CBT - Pembuat Soal Word & Excel CBT Mandiri (100% Offline Standalone Desktop App)**

Aplikasi desktop Windows super ringan berbasis **Tauri (Rust + WebView2)** untuk membantu para guru meracik naskah soal ujian berstandar nasional, formula matematika KaTeX, bahasa Arab RTL & harakat, integrasi AI Master Prompt, serta ekspor langsung ke format **Word (.docx)** dan **Excel (.xlsx)** tanpa membutuhkan instalasi web server (XAMPP / PHP).

---

## ✨ Fitur Utama

- ⚡ **Ultra Ringan & Cepat:** Ukuran binary `.exe` hanya ~3-5 MB dan sangat hemat konsumsi RAM (~30 MB).
- 📝 **Ekspor Word (.docx) 100% Lokal:** Hasilkan format Word Tabel 3-Kolom standar CBT atau Word Format Linier.
- 📊 **Ekspor Excel (.xlsx) 100% Lokal:** Hasilkan template spreadsheet 11-kolom yang siap langsung di-import ke sistem Lufya CBT.
- 📐 **Mode Matematika & Eksakta:** Dilengkapi palet visual rumus matematika KaTeX / LaTeX, akar, pecahan, integral, dan matriks.
- 🕌 **Mode Bahasa Arab & PAI:** Dukungan otomatis teks Kanan-ke-Kiri (RTL), tipografi font Amiri elegan, dan keyboard virtual tanda harakat lengkap.
- 🤖 **AI Master Prompt Generator & Importer:** Buat prompt berstandar HOTS untuk ChatGPT/Claude/Gemini dan impor raw JSON hasilnya langsung dengan 1-klik.
- 💾 **Penyimpanan Draft Otomatis:** Naskah soal tersimpan otomatis secara aman di perangkat lokal.

---

## 🛠️ Cara Build Mandiri (GitHub Actions Cloud Build)

Proyek ini telah dikonfigurasi dengan **GitHub Actions CI/CD** sehingga Anda **tidak perlu menginstal Rust / C++ Build Tools di laptop**.

1. Buat repositori baru di GitHub dengan nama `desktopcreatesoal` (misal: `https://github.com/ariesabd/desktopcreatesoal`).
2. Push source code dari folder ini ke repositori tersebut:
   ```bash
   git init
   git add .
   git commit -m "Initial commit SoalCreator Desktop v1.0.0"
   git branch -M main
   git remote add origin https://github.com/ariesabd/desktopcreatesoal.git
   git push -u origin main
   ```
3. Buka tab **Actions** di repositori GitHub Anda.
4. GitHub Actions akan otomatis meng-compile aplikasi dan menghasilkan berkas **`creatorsoal.exe`** serta file installer di tab **Releases** / **Artifacts**.

---

## 📦 Pengembangan Lokal (Opsional)

Jika ingin menjalankan aplikasi secara lokal di mode pengembang:

```bash
# 1. Install dependencies
npm install

# 2. Jalankan mode development
npm run dev

# 3. Build executable lokal
npm run build
```

---

## 👨‍💻 Kontak & Dukungan Resmi

- **WhatsApp Support:** [089690361144](https://wa.me/6289690361144)
- **Website:** [kioskode.my.id](https://kioskode.my.id)
- **Toko / Marketplace:** [lynk.id/kioskode](https://lynk.id/kioskode)
- **Email:** cs.kioskode@gmail.com

---
*Dikembangkan dengan penuh dedikasi untuk kemudahan para pendidik di Indonesia.*
