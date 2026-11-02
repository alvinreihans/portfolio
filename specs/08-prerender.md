# 08 - Prerender (HTML statis per halaman)

Status: **Selesai** (disetujui owner dan semua kriteria penerimaan lulus, 2026-11-01). Menggantikan butir "render di server (SSR/prerender)" di bagian "Di luar cakupan" `05-deployment.md`.

## Latar belakang

Audit Lighthouse mobile di preview (2026-11-01, setelah perbaikan font dan layout shift):

| Halaman | Performance | LCP | TBT | CLS |
|---|---|---|---|---|
| `/` | 88, 92 | 2,6 dtk | 240 sampai 260 ms | 0 |
| `/cv` | 95, 96 | 2,5 sampai 2,6 dtk | 60 sampai 130 ms | 0 |
| `/projects/money-tracker` | 85, 87 | 2,7 sampai 2,9 dtk | 350 sampai 360 ms | 0 sampai 0,02 |
| `/projects/teman-jalan` | 89, 92 | 2,6 sampai 2,7 dtk | 230 sampai 240 ms | 0 sampai 0,02 |

Penyebab utama LCP yang tinggi: situs ini SPA. HTML yang dikirim hanya berisi `<div id="root">` kosong, jadi teks pertama baru tampil setelah JavaScript awal (sekitar 135 KB gzip, sebagian besar React dan React Router) selesai diunduh dan dijalankan. Bagian kode aplikasi sendiri kecil, sehingga memecah bundle tidak banyak membantu.

## Tujuan

- Setiap halaman dikirim sebagai HTML yang sudah berisi teksnya, sehingga konten tampil sebelum JavaScript selesai, lalu React mengambil alih halaman itu (hydration) tanpa membangun ulang.
- Target: Lighthouse mobile Performance 90 ke atas di semua halaman (AC7 di `01-overview.md`), dengan LCP di bawah 2,0 detik.
- Tanpa dependency baru: memakai `react-dom/server`, API render statis React Router, dan mode build SSR Vite yang sudah ada.

## Bukan tujuan

- Bukan server yang merender saat ada permintaan (SSR runtime). Semua HTML dibuat sekali saat build dan disajikan sebagai berkas statis oleh Vercel.
- Tidak mengubah URL: tetap tanpa bahasa di URL (`/cv`, bukan `/en/cv`).
- Tidak mengurangi TBT secara berarti: React tetap menjalankan JavaScript yang sama saat hydration. Target utamanya LCP dan FCP.

## Rancangan

### 1. Halaman yang di-prerender

`/`, `/cv`, setiap `/projects/<slug>` dari `meta.json`, dan satu halaman 404. Daftarnya dibuat dari folder project yang sama dengan sitemap, jadi project baru otomatis ikut.

### 2. Dua bahasa dalam satu berkas

URL tidak memuat bahasa, sedangkan bahasa ditentukan di browser (pilihan tersimpan, lalu bahasa browser). Karena itu setiap halaman dirender dalam **dua bahasa**, dan keduanya disimpan di berkas HTML yang sama sebagai `<template>`:

```html
<div id="root"></div>
<template data-lang="id">â€¦HTML halaman dalam bahasa Indonesiaâ€¦</template>
<template data-lang="en">â€¦HTML halaman dalam bahasa Inggrisâ€¦</template>
<script>/* memilih template sesuai bahasa, memindahkannya ke #root, mengisi <title> */</script>
```

- Skrip kecil di akhir `<body>` memakai aturan yang sama dengan `src/i18n/detect.ts` (pilihan tersimpan, lalu bahasa browser, lalu bahasa Inggris) untuk memilih template, memasukkan isinya ke `#root`, memasang `<html lang>`, dan mengisi `<title>`, semuanya sebelum gambar pertama di layar. Tidak ada kilatan bahasa yang salah (AC4 di `03-i18n.md`).
- Template tidak dirender browser sampai dipakai, jadi bahasa yang tidak dipilih tidak menambah kerja tata letak. Ukurannya menambah HTML; dengan kompresi gzip dari Vercel, perkiraannya beberapa KB per halaman.
- Skrip ini statis (sama di semua halaman), sehingga cukup satu hash tambahan di CSP; `scripts/check-csp.mjs` sudah memeriksa semua skrip inline.
- HTML hasil prerender memuat atribut `style` (tinggi adegan, posisi awan, jarak di flowchart), yang dulu dipasang React lewat JavaScript. CSP karena itu mengizinkan atribut style saja dengan `style-src-attr 'unsafe-inline'`, sedangkan elemen `<style>` dan stylesheet tetap hanya dari situs sendiri (`style-src 'self'`). Risikonya kecil karena seluruh isi halaman statis, bukan masukan pengunjung.
- Alternatif yang ditolak: memilih berkas per bahasa di server Vercel lewat cookie dan header `Accept-Language`. Aturan deteksi bahasa di `detect.ts` sulit ditiru persis dengan aturan rewrite, dan pilihan bahasa harus disimpan dua kali (localStorage dan cookie).

### 3. Hydration tanpa ketidakcocokan

Render pertama di browser harus sama persis dengan HTML hasil prerender. Hal yang berbeda antara build dan browser diperlakukan begini:

| Sumber perbedaan | Perlakuan |
|---|---|
| Tema (Day/Night) | Warna sudah diatur CSS lewat `data-theme` dari skrip di `<head>`. Komponen yang merender berbeda per tema (matahari atau bulan, adegan) memakai nilai server `day` saat hydration, lalu menyesuaikan sesudahnya (`useSyncExternalStore` dengan `getServerSnapshot`). |
| Bahasa | Template yang dipilih sama dengan bahasa yang dideteksi i18n di browser, karena keduanya memakai `detect.ts`. |
| Langit, adegan, sapaan | Sudah dibuat di effect atau dimuat malas di browser; HTML prerender hanya berisi wadahnya dengan tinggi yang sama. |
| Cerita project | Ikut di-prerender (Q8.2, revisi). HTML cerita disajikan apa adanya sampai renderer markdown selesai dimuat di browser, lalu diganti versi React yang sama persis (ditambah panah flowchart, yang diukur di browser). Renderer markdown tetap dimuat malas, jadi tidak menambah JavaScript awal. |
| Tahun di footer | Ditulis saat build; pergantian tahun setelah build diizinkan berbeda tanpa peringatan (`suppressHydrationWarning` pada angka tahun saja). |
| `navigator`, `localStorage`, `window` | Tidak dibaca saat render di build. Inisialisasi i18n untuk build dibuat terpisah per bahasa. |

### 4. Path yang tidak dikenal

Rewrite catch-all di `vercel.json` diarahkan ke `/404.html` (halaman 404 hasil prerender), bukan lagi ke `/index.html` yang kini berisi beranda. Path yang punya berkas (misalnya `/cv` ke `cv/index.html`) tetap disajikan langsung oleh Vercel. Navigasi di dalam situs tetap SPA seperti sekarang.

### 5. Build

1. `vite build` seperti sekarang (bundle browser).
2. `vite build --ssr src/entry-prerender.tsx` membuat modul render untuk Node.
3. `scripts/prerender.mjs` merender setiap halaman dalam dua bahasa, menyisipkannya ke template `index.html`, dan menulis `dist/index.html`, `dist/cv/index.html`, `dist/projects/<slug>/index.html`, dan `dist/404.html`.
4. `check-size` dan `check-csp` berjalan seperti sekarang terhadap semua berkas HTML.

`src/main.tsx` memakai `hydrateRoot` bila `#root` sudah berisi HTML, dan `createRoot` bila kosong (misalnya saat `npm run dev`).

### 6. Temuan setelah preview pertama (2026-11-01)

Prerender pertama sudah benar secara fungsi (nol hydration mismatch), tetapi LCP belum turun: browser langsung menjalankan React dan hydration begitu HTML selesai dibaca, tanpa menggambar dulu. Perbaikannya:

- **Aplikasi dimuat setelah gambar pertama.** `src/main.tsx` hanya memuat CSS, lalu mengimpor `src/app.tsx` (React, router, halaman) setelah browser menggambar halaman prerender sekali. Di `npm run dev` aplikasi langsung dimuat. `check-size` tetap menghitung bundle aplikasi itu dalam anggaran JavaScript awal.
- **Animasi masuk halaman hanya saat berpindah halaman** (sesuai Q4.28 di `04-pages.md`). Di muatan pertama animasi itu membuat teks prerender tidak terlihat (opacity 0) sampai JavaScript selesai.
- Format bulan di roadmap disimpan per bahasa, dan urutan roadmap membandingkan tanggal ISO sebagai string, karena keduanya ikut berjalan di setiap render setelah hydration.

## Kriteria penerimaan

- [x] AC1. Setiap halaman di daftar (beranda, CV, ketujuh project, 404) disajikan sebagai HTML yang sudah berisi judul halaman dan teks utamanya, terlihat di "View Source" dalam kedua bahasa.
- [x] AC2. Dengan pilihan bahasa tersimpan atau bahasa browser apa pun, teks yang tampil sejak gambar pertama sudah dalam bahasa yang benar, dan `<html lang>` serta `<title>` cocok.
- [x] AC3. Tidak ada peringatan hydration mismatch di console pada semua halaman, kedua bahasa, dan kedua tema.
- [x] AC4. Path acak menampilkan halaman 404 (dengan `noindex`) sejak gambar pertama, tanpa sempat menampilkan beranda.
- [x] AC5. Semua kriteria penerimaan spec 01 sampai 07 tetap lulus (audit Playwright yang sama: matriks, perilaku, CLS).
- [x] AC6. Lighthouse mobile Performance 90 ke atas dan LCP paling lama 2,5 detik (batas "Good" Core Web Vitals) di `/`, `/cv`, dan dua halaman project, diukur dengan PageSpeed Insights di preview. Hasil 2026-11-01: `/` 98 (LCP 1,0 dtk), `/cv` 100 (0,9 dtk), Money Tracker 93 (2,5 dtk), Teman Jalan 100 (0,9 dtk). Batas LCP semula 2,0 detik; Money Tracker tertahan di 2,5 detik karena simulasi Lighthouse mengaitkan paragraf cerita dengan JavaScript yang menggantinya, sedangkan di browser paragraf itu tampil sejak gambar pertama (owner, 2026-11-01). Target sempat diturunkan ke 88 berdasarkan pengukuran dari mesin lokal, lalu dikembalikan setelah PageSpeed Insights (server Google) menunjukkan 95 sampai 100 (owner, 2026-11-01).
- [x] AC7. Tidak ada dependency baru di `package.json`.
- [x] AC8. `npm run dev` tetap bekerja seperti sekarang (tanpa prerender).

## Risiko

- Pekerjaan ini menyentuh titik awal aplikasi (`main.tsx`, i18n, tema). Bila ada ketidakcocokan hydration yang terlewat, React membuang HTML prerender dan merender ulang dari nol; situs tetap berfungsi, tetapi manfaatnya hilang di halaman itu. AC3 dan audit ulang menjaga ini.
- Berkas HTML menjadi lebih besar (dua bahasa). Diukur sebelum dan sesudah; bila ukuran gzip satu halaman lebih dari 30 KB, rancangan ditinjau ulang.

## Keputusan

- Q8.1. Dua bahasa dalam satu berkas sebagai `<template>` (bagian 2), bukan berkas per bahasa yang dipilih Vercel (owner, 2026-11-01).
- Q8.2. Cerita project ikut di-prerender (owner, 2026-11-01, merevisi keputusan awal untuk memuatnya di browser): setelah preview pertama, paragraf cerita menjadi elemen LCP halaman project dan baru tampil setelah JavaScript, sehingga LCP tertahan di sekitar 2,8 detik.
- Q8.3. Cutover ke `main` menunggu spec ini selesai (owner, 2026-11-01).
