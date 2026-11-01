# 01 - Overview

Status: **Approved** (disetujui owner, 2026-10-31)

## Tujuan

Portfolio pribadi Alvin sebagai full-stack developer yang berminat pada sistem backend yang andal. Dibuat agar recruiter cepat paham siapa Alvin dan apa yang sudah ia bangun, sekaligus menjadi showcase pribadi.

## Audiens

1. **Recruiter dan hiring manager** (utama). Membaca sekilas dalam 10 sampai 30 detik. Butuh tahu role, stack, project terkuat, CV, dan cara menghubungi.
2. **Engineer** (kedua). Ingin kedalaman teknis: arsitektur, keputusan, trade-off, dan repo.

## Goals

- G1. Dalam layar pertama, pengunjung langsung tahu siapa Alvin dan apa pekerjaannya.
- G2. Pengunjung bisa mengunduh CV dan menghubungi Alvin dalam maksimal dua klik dari halaman mana pun.
- G3. Semua project ditampilkan sebagai kartu, dan masing-masing punya halaman detail berupa cerita (ditulis dengan markdown). Money Tracker menjadi project hero di halaman utama dan ditampilkan lewat arsitekturnya (diagram, stack, keputusan).
- G4. Situs dwibahasa (Inggris dan Indonesia) dengan tombol pilih bahasa.
- G5. Situs punya tema Day/Night (matahari dan awan pixel di siang hari, bulan dan bintang di malam hari).
- G6. Situs aksesibel, cepat, dan nyaman di mobile.
- G7. Situs punya maskot berang-berang pixel art sebagai identitas visual.
- G8. Section contact menyatakan dengan kalimat bahwa Alvin terbuka untuk peluang baru (tanpa badge).

## Non-goals

- Blog (ditunda; halaman "Coming soon" yang kosong lebih merugikan daripada membantu).
- CMS atau backend milik situs ini sendiri.
- Analytics dan tracking, kecuali nanti ditambahkan lewat spec terpisah.
- Badge "Open to work" (diputuskan tidak dipakai).
- Foto profil (diputuskan tidak ditampilkan).
- Form kontak dengan layanan pihak ketiga (diputuskan memakai `mailto`).

## Scope

### Route (client-side, BrowserRouter)

| Path | Isi |
|---|---|
| `/` | Hero, tech stack, experience, works (semua project, sebagai section, dengan Money Tracker sebagai project hero), contact |
| `/projects/:slug` | Detail project berupa cerita (konteks, arsitektur, keputusan, tantangan, hasil, tautan). Ada untuk setiap project. |
| `/cv` | Halaman CV: pratinjau CV (dari Google Docs) sesuai bahasa aktif, dengan tombol unduh PDF dan buka di tab baru |
| `*` | Halaman 404 |

"Works" di navbar menggulir ke section di `/` (bukan halaman terpisah).

### Fitur

- F1. Tombol bahasa EN/ID. Default mengikuti bahasa browser, pilihan diingat di `localStorage`. `<html lang>` ikut berubah.
- F2. Tombol Day/Night. Selama pengunjung belum memilih sendiri, tema mengikuti pengaturan sistem atau browser (`prefers-color-scheme`: gelap menjadi Night, terang menjadi Day) dan ikut berganti jika pengaturan itu berubah. Setelah pengunjung memilih lewat tombol, pilihannya disimpan di `localStorage` dan dipakai di kunjungan berikutnya. Detail di `02-design-system.md`.
- F3. Layout responsif (mobile first, lebar konten maksimal 1200px).
- F4. Halaman CV (`/cv`): pratinjau CV terbaru di dalam situs, unduh PDF, dan buka di tab baru. `alvinreihans.web.id/cv` sekaligus menjadi tautan pendek untuk lamaran. Detail di `04-pages.md`.
- F5. Kontak lewat tautan `mailto:` berupa ikon mail di section Contact (Q4.27 di `04-pages.md`; tombol "Salin email" tidak dipakai).
- F6. Money Tracker di urutan pertama Works, dengan diagram arsitektur di halaman ceritanya dan tautan ke repo dan demo (kartunya sama seperti project lain, Q4.30 di `04-pages.md`).
- F7. Section works yang menampilkan semua project sebagai kartu.
- F8. Maskot berang-berang pixel art (gaya dan penempatan diputuskan di `02-design-system.md`).
- F9. Section experience berbentuk roadmap bergaya git: pekerjaan dan pembelajaran dibedakan (detail di `04-pages.md`).
- F10. Cerita project ditulis sebagai file markdown, satu file per project per bahasa, dengan gambar yang disimpan sebagai file di repo. Format dan alur penulisan diputuskan di `06-project-stories.md`.

### Project hero: Money Tracker (bahan dari README repo, perlu konfirmasi owner)

Aplikasi pencatat pengeluaran: pengguna mengetik kalimat seperti pesan chat, mengunggah foto struk atau bukti pembayaran e-wallet, atau mengisi form. Aplikasi membaca inputnya lalu menyimpannya sebagai transaksi.

- Jalur gambar: preprocessing (sharp), OCR (Tesseract), quality gate, ekstraksi JSON (Groq), validasi, simpan. Jika kualitas OCR buruk atau Groq gagal, gambar dikirim ke Gemini Vision. Jika itu juga gagal, disimpan sebagai draft berisi teks OCR mentah.
- Jalur teks: ekstraksi JSON (Groq), validasi, simpan.
- Stack: Next.js 16, Supabase (Postgres, Auth, Row Level Security), Tesseract.js, Groq, Gemini.
- Deployment: Vercel (free tier). Repo: https://github.com/alvinreihans/money-tracker. Demo: https://money-tracker-six-henna.vercel.app
- Catatan desain yang menarik untuk showcase: jalur fallback berlapis dan draft agar data tidak hilang.

### Experience

- **PT Intramedika Global Digital**, Junior Software Developer, 18 Februari 2026 sampai sekarang.
- Belum ada deskripsi tugas yang bisa dipublikasikan; kartunya hanya memuat organisasi, peran, dan periode. Daftar entri lengkap (termasuk pembelajaran) ada di `04-pages.md`.

## Tech stack (usulan, perlu persetujuan sesuai aturan 5 di CLAUDE.md)

Vite, React, TypeScript, React Router, Tailwind CSS, react-i18next. Di-hosting di Vercel dengan rewrite semua path ke `index.html`.

## Arah desain

`mockups/c-minimal-refero.html` (referensi lokal): layout minimal terang dengan gaya Refero "Obscura". Detailnya masuk ke `02-design-system.md`.

## Kriteria penerimaan (tingkat situs)

- [ ] AC1. Membuka langsung `/projects/<slug>` dan path yang tidak dikenal berfungsi di Vercel (tanpa 404 dari platform).
- [ ] AC2. Tombol bahasa mengganti seluruh teks yang terlihat dan `<html lang>`; pilihan bertahan setelah reload.
- [ ] AC3. Kunjungan pertama menampilkan tema sesuai `prefers-color-scheme`; tombol Day/Night mengganti seluruh tema tanpa layout shift; pilihan manual bertahan setelah reload dan di kunjungan berikutnya.
- [ ] AC4. Tidak ada scroll horizontal di lebar 320px ke atas.
- [ ] AC5. Kontras teks memenuhi WCAG AA di kedua tema; semua kontrol bisa dijangkau dan terlihat saat memakai keyboard.
- [ ] AC6. Animasi berhenti ketika `prefers-reduced-motion` aktif.
- [ ] AC7. Skor Lighthouse Performance dan Accessibility 90 atau lebih di mobile.
- [ ] AC8. Tidak ada error di console dan tidak ada request jaringan yang gagal di semua route. Pesan yang berasal dari dalam iframe pihak ketiga (pratinjau Google Docs di `/cv`) tidak dihitung, karena di luar kendali situs.
- [ ] AC9. Semua project yang terdaftar tampil di section works, masing-masing dengan tautan yang valid.
- [ ] AC10. Tautan `mailto:` membuka klien email dengan alamat benar.
- [ ] AC11. Halaman memuat `<link rel="canonical">` ke `https://alvinreihans.web.id`.
- [ ] AC12. Setiap project di works membuka halaman detail yang memuat cerita dalam bahasa yang sedang dipilih; jika terjemahan belum ada, tampil versi Indonesia beserta pemberitahuan (Indonesia adalah bahasa sumber, lihat `03-i18n.md`).
- [ ] AC13. Semua gambar di cerita punya teks alternatif (`alt`), dimuat dengan lazy loading, dan tidak menyebabkan layout shift.
- [ ] AC14. Maskot berang-berang tampil di tema Day dan Night, dan animasinya (jika ada) berhenti saat `prefers-reduced-motion` aktif.
- [ ] AC15. Membuka langsung `alvinreihans.web.id/cv` menampilkan pratinjau CV sesuai bahasa aktif, dan CV bisa diunduh dalam maksimal dua klik dari halaman mana pun (tautan CV di navbar, lalu Unduh PDF).

## Keputusan

- Q1.1. Tidak ada "selected work"; semua project ditampilkan. Project hero: Money Tracker.
- Q1.2. Experience: PT Intramedika Global Digital, Junior Software Developer (sesuai CV), sejak 18 Februari 2026.
- Q1.3. Kontak memakai `mailto:`.
- Q1.4. Tidak ada badge "Open to work".
- Q1.5. URL kanonik: `alvinreihans.web.id` (tanpa `www`). Konsekuensi: di Vercel, `www` harus mengarah (redirect) ke domain tanpa `www`. Saat ini arahnya terbalik; perubahan ini dibahas di `05-deployment.md` dan dilakukan owner di dashboard Vercel.
- Q1.6. "Works" berupa section di halaman utama.
- Q1.7. Maskot pixel art dipakai.
- Q1.8. Setiap project punya halaman detail berupa cerita yang ditulis dengan markdown.
- Q1.9. Daftar project untuk saat ini: Money Tracker (hero), Real-Time IoT Monitoring Backend, Garuda Games' Chat Forum, Plant Classification API, Crop Recommendation API, Notes App.
- Q1.10. Pernyataan terbuka untuk peluang baru hanya berupa kalimat di section contact.
- Q1.11. Maskot adalah berang-berang pixel (semula kucing; diganti atas permintaan owner pada 2026-10-31).

- Q1.12. Cerita project: satu folder per project berisi `meta.json` (data bersama dan judul/ringkasan per bahasa), `en.md`, `id.md`, dan `images/`. Detailnya di `06-project-stories.md`.
- Q1.13. Diagram arsitektur dibuat sebagai komponen React kecil bergaya pixel yang dirender dari code block markdown (bukan gambar statis dan bukan Mermaid). Detailnya di `06-project-stories.md`.
- Q1.14. Markdown dirender dengan `react-markdown` + `remark-gfm` (izin memakai library sudah diberikan owner). Detailnya di `06-project-stories.md`.
- Q1.15. Maskot berang-berang berukuran kecil dan dekoratif, bukan elemen utama di landing page. Pose mengikuti tema (duduk di Day, tidur di Night). Penempatan: footer/contact, halaman 404 (ukuran lebih besar), dan aksen kecil di tempat lain. Detail visual di `02-design-system.md`. Diperbarui 2026-10-31: di halaman utama berang-berang tampil di adegan pixel acak di atas Contact dan bisa disapa; pose mengikuti adegan dan tema. Detailnya di `07-scenery.md`.

- Q1.16. Foto profil tidak ditampilkan. Hero hanya berisi teks dan elemen dekoratif pixel.

## Pertanyaan terbuka

Tidak ada. Spec ini siap ditinjau untuk ditandai **Approved**.

## Spec lanjutan

- `02-design-system.md` (token, tipografi, komponen, Day/Night, maskot berang-berang)
- `03-i18n.md` (struktur file terjemahan, penamaan key)
- `04-pages.md` (konten dan layout per route)
- `05-deployment.md` (konfigurasi Vercel, redirect `www` ke domain utama, alur preview, rencana cutover)
- `06-project-stories.md` (format markdown, gambar, diagram, i18n cerita project)
- `07-scenery.md` (langit selebar halaman, adegan acak, berang-berang yang bisa disapa, mode statis)
