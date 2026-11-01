## Gambaran umum

Money Tracker adalah pencatat keuangan pribadi berbasis AI yang berjalan sebagai PWA. Transaksi bisa dicatat dengan tiga cara: mengetik seperti chat ("kopi 25rb gopay"), memotret struk atau bukti bayar e-wallet, atau mengisi form. Teks dan gambar dibaca otomatis lalu tersimpan sebagai transaksi, lengkap dengan kategori, kantong, dan merchant.

![Beranda Money Tracker di desktop: navigasi samping, transaksi hari ini, dan total aset per kantong](./images/beranda-desktop-1600x1000.avif)

## Latar belakang

Saya sering merasa uang saya tiba-tiba "hilang". Saya tidak tahu pengeluaran mana yang bocor: apakah saya terlalu sering jajan, atau memang ada beberapa hal yang mahal untuk saya? Saya sempat mencatat dengan Excel, tetapi mengisinya satu per satu terasa ribet, jadi saya membuat aplikasi sendiri untuk melacak keluar masuknya uang.

Waktu itu saya juga baru mendapat pengalaman mengintegrasikan LLM di pekerjaan. Di sana saya belajar bahwa model yang hanya diminta "membaca struk" menjawab dengan bentuk yang berbeda-beda, sedangkan lewat system prompt dan skema JSON, model bisa diminta mengisi field yang sudah ditentukan. Cara itu saya bawa ke aplikasi ini.

## Perjalanan

**Tiga jalur, dua dibuang.** Rilis pertama (19 September 2026) punya tiga cara memasukkan data: foto struk, impor rekening koran PDF, dan bot Telegram. Rekening koran ternyata tidak menjawab pertanyaan saya: ia hanya menunjukkan berapa uang yang keluar dan masuk, bukan ke mana perginya. Bot Telegram saya buat karena saya biasa membayar dengan QRIS, dan bukti bayarnya bisa langsung dikirim ke bot untuk dibaca AI. Lalu saya tahu bahwa PWA juga bisa menerima kiriman "Bagikan" dari aplikasi lain, jadi bot itu tidak diperlukan lagi. Keduanya dihapus di versi 1.0.0.

**OCR yang menggantung.** Di hari rilis pertama, pembacaan struk gagal di server produksi tanpa pesan apa pun. Penyebabnya baru ketemu setelah beberapa kali percobaan: worker Tesseract, file WASM-nya, dan pustaka native sharp tidak ikut ter-deploy, karena dimuat lewat path saat runtime.

**Sempat berhenti.** Setelah itu proyek ini saya tunda sekitar sebulan. Masih banyak yang perlu diperbaiki, dan pekerjaan sedang padat. Saya kembali ke proyek ini saat punya waktu luang: dari 21 sampai 31 Oktober ada 169 commit, dari versi 1.0.0 sampai 2.9.0.

**Mencari cara membaca yang paling akurat.** Saya membandingkan beberapa jalur dengan struk sungguhan. Tesseract ditambah Groq lambat dan kurang akurat, dan batas token Groq yang kecil membuat hasilnya sering terpotong. Tesseract ditambah Gemini (untuk menghemat token Gemini) juga sering salah, terutama soal sumber dananya. Akhirnya gambar dibaca langsung oleh Gemini, tanpa OCR. Uji akurasi itu sendiri sempat menghabiskan kuota gratis Gemini, yang ternyata hanya 20 permintaan per hari karena alias `-latest` diam-diam pindah model. Sejak itu nama model ditulis persis.

**Dari tab ke obrolan.** Awalnya, hasil bacaan yang belum lengkap masuk ke tab "Perlu dibenerin". Hasil yang salah menumpuk di sana, dan tab itu jarang dibuka. Sekarang AI bertanya langsung saat mencatat, lewat tombol **+**, seperti sedang chat.

**Satu desain untuk semua layar.** Saya mencari sistem desain untuk PWA yang dipakai di HP, tablet, dan desktop, dan memilih Samsung One UI (kebetulan HP saya juga Samsung).

**Spec dulu, baru kode.** Proyek ini dikerjakan dengan spec-driven development, metode yang baru saya pelajari dari [Dicoding](https://www.dicoding.com/). Setiap fitur dimulai dari spesifikasi (perilaku sistem, data yang masuk dan keluar, keputusan, kriteria penerimaan) yang menjadi sumber kebenaran, sekaligus instruksi untuk AI yang membantu menulis kodenya. Hasilnya 26 dokumen spesifikasi.

## Hasil

- Versi 2.9.0, 246 commit, 26 spesifikasi, dan 28 migrasi database.
- Saya memakainya sendiri setiap hari. Pembayaran e-wallet tinggal dibagikan bukti bayarnya ke aplikasi; transaksi tunai atau kartu e-money cukup diketik seperti chat. Data setiap akun terisolasi, jadi aplikasinya siap dipakai lebih dari satu orang.
- Pertanyaan awal saya, ke mana uangnya pergi, belum terjawab. Saya baru mulai rutin mencatat dan masih memasukkan bukti transaksi bulan-bulan sebelumnya. Menurut saya polanya baru akan terlihat setelah sekitar tiga bulan data.

## Fitur

**Mencatat**

- Teks bebas, foto struk atau bukti bayar (kamera atau unggah), dan form manual.
- Share target Android: struk atau teks bisa dibagikan langsung dari aplikasi lain, lalu diproses di latar. Kalau hasilnya perlu dilengkapi, pengguna dikabari lewat notifikasi push.
- Catat bergaya obrolan: kalau AI kurang yakin, ia bertanya di tempat. Catatan yang belum selesai diingatkan di hari ke-1 dan ke-7, lalu dihapus di hari ke-30.
- Ingatan kategori per merchant, dengan pencocokan nama yang tetap jalan walau nama terpotong ("WAITENJOY.CO…") atau tanpa kata seperti "Toko". Saat kategori dibetulkan, aplikasi menawarkan untuk ikut membetulkan transaksi lama yang serupa.

![Mencatat lewat obrolan di HP: ketikan "bakso 25rb gopay" langsung tersimpan sebagai pengeluaran Makan dari GoPay](./images/catat-mobile-780x1688.avif)

**Memahami uang**

- Analitik: ringkasan bulan, tren 6 bulan, komposisi kategori, merchant teratas, dan proyeksi.
- Metode budget: per kategori, 50/30/20, 80/20, 70/20/10, persentase kustom, Zero-Based, Pay Yourself First, 6 Jars, dan Kakeibo.
- Kantong (rekening dan e-wallet) dengan saldo dari waktu ke waktu, tabungan tujuan, pinjaman dan piutang dengan strategi pelunasan Snowball atau Avalanche, cicilan, PayLater, dan ekspor data.
- **Tanya AI**: tanya jawab atas data sendiri, misalnya "kenapa bulan ini boros?".

![Analitik bulan Oktober di desktop: ringkasan keluar dan masuk, sorotan, dan merchant teratas](./images/analitik-desktop-1600x1000.avif)

![Pengaturan budget di tablet dengan metode 50/30/20 dan pembagian penghasilan per kelompok](./images/budget-tablet-800x1151.avif)

## Arsitektur

```flow
PWA (Next.js) -> *API route -> Gemini / Groq (ekstraksi JSON) -> Validasi
API route -> Supabase (PostgreSQL + RLS)
```

Satu aplikasi Next.js (App Router) melayani halaman dan API route sekaligus, dengan tiga lapisan:

- **Proxy** menyegarkan sesi Supabase di setiap request dan mengalihkan pengunjung yang belum masuk ke halaman login. API route tidak dialihkan; ia menjawab 401 sendiri.
- **API route** tipis: memeriksa sesi, membatasi input (gambar JPEG, PNG, WebP, atau HEIC, maksimal 5 MB), lalu menyerahkan pekerjaannya ke `src/lib`.
- **`src/lib`** berisi logikanya: pipeline pembacaan, validasi, penyimpanan, analitik, metode budget, pinjaman, dan notifikasi.

Supabase menyediakan PostgreSQL, autentikasi, dan Row Level Security. Skemanya dikelola lewat 28 migrasi berversi yang dijalankan runner sendiri (`db:migrate`, `db:status`). Antarmuka mengikuti gaya Samsung One UI dan dibangun dengan CSS sendiri, tanpa pustaka UI maupun pustaka grafik.

## Alur pembacaan struk

```flow
Foto struk -> sharp (1080px, JPEG) -> *Gemini (ekstraksi JSON) -> Validasi -> Transaksi
Validasi -> Draft (ditanyakan lewat obrolan)
```

1. **Kompres.** Gambar diputar sesuai EXIF dan dikecilkan dengan sharp menjadi JPEG 1080px. Pada uji dengan struk sungguhan, ukurannya turun sekitar 80% (415 KB menjadi 81 KB), dan ketiga struk terbaca benar dalam 2,7 sampai 3 detik. Pada 720px, merchant dan PayLater mulai hilang.
2. **Gemini.** Gemini Flash-Lite membaca gambar dan mengisi field JSON yang sudah ditentukan lewat skema. Gemini lebih andal membaca tata letak bukti bayar (nominal besar, diskon, PayLater) dibanding OCR. Nama modelnya ditulis persis, bukan alias `-latest`: alias itu pernah diam-diam pindah ke model dengan kuota gratis 20 permintaan per hari. Model bisa diganti lewat variabel lingkungan tanpa deploy ulang.
3. **Validasi.** Hasil yang lolos parsing JSON belum tentu masuk akal, jadi nominal, jenis, dan kategorinya diperiksa dulu.
4. **Draft.** Kalau Gemini gagal atau hasilnya tidak valid, transaksi tetap disimpan sebagai draft dan AI menanyakan bagian yang kurang lewat obrolan. Pipeline ini tidak pernah melempar error, jadi data pengguna tidak pernah hilang. Setiap hasil membawa jejak keputusan (`notes`) yang menjelaskan apa yang terjadi.

Ketikan dibaca Groq lebih dulu lewat tiga model berantai. Kuota Groq dihitung per model, jadi pindah model berarti kuota baru. Kalau semuanya gagal, Gemini menjadi cadangan, lalu draft.

## Menyimpan transaksi

Sebelum disimpan, setiap hasil AI melewati beberapa pemeriksaan:

- **Kategori** diambil dari transaksi terakhir dengan merchant yang sama. Karena merchant disimpan terenkripsi, pencocokannya dilakukan setelah didekripsi, jadi tidak ada daftar merchant polos yang tersimpan.
- **Deteksi ganda:** transaksi dengan jenis, nominal, tanggal, jam, dan kantong yang sama ditandai sebagai kemungkinan duplikat dan dikembalikan ke draft untuk dikonfirmasi pengguna.
- **Belanja PayLater** langsung dijadikan rencana cicilan.

## Tanya AI

Prinsipnya: **angka berasal dari server, AI yang menjelaskan.** Model bahasa sering salah menjumlah, jadi Gemini menjawab lewat fungsi di server (*function calling*): `ringkasan_bulan`, `cari_transaksi`, `saldo_kantong`, `pinjaman_cicilan`, dan `usul_ubah_kategori`. Fungsi-fungsi itu berjalan dengan sesi pengguna, sehingga Row Level Security tetap berlaku.

- Selisih, rata-rata, dan persen dihitung lewat fungsi `hitung`, sebuah parser aritmetika kecil (bukan `eval`) yang menolak angka 1.000 ke atas yang tidak berasal dari hasil fungsi sebelumnya.
- Setiap nominal rupiah di jawaban dicocokkan dengan hasil fungsi. Kalau ada yang tidak cocok, model diminta menulis ulang sekali; kalau masih tidak cocok, jawabannya ditandai ragu.
- Jawaban menyertakan tautan ke Riwayat dengan filter yang sama, supaya angkanya bisa ditelusuri sendiri.
- Perubahan data yang diusulkan AI, seperti mengganti kategori, selalu butuh konfirmasi pengguna.

![Tanya AI di HP menjelaskan kenapa pengeluaran Oktober lebih besar dari September, dengan nominal dari hasil fungsi](./images/tanya-mobile-780x720.avif)

## Keamanan dan privasi

- **Enkripsi kolom paling pribadi:** merchant, keterangan, dan teks asli catatan dienkripsi AES-256 dengan pgcrypto, memakai kunci di Supabase Vault. Aplikasi membaca lewat view yang mendekripsi dan menulis lewat trigger yang mengenkripsi. Kode aplikasi tidak perlu berubah, pencarian di Riwayat tetap jalan, dan dump database yang bocor tidak bisa dibaca.
- **Isolasi per akun:** Row Level Security di setiap tabel, ditambah skrip `uji:isolasi` yang memastikan lewat API sungguhan bahwa akun lain tidak bisa membaca, mengubah, atau merujuk data akun ini.
- **Header keamanan:** Content Security Policy (skrip, gambar, dan worker hanya dari aplikasi sendiri; koneksi data hanya ke aplikasi dan Supabase), larangan dibingkai situs lain, dan izin kamera hanya untuk aplikasi ini.
- Login lewat Supabase Auth (email dan password, termasuk reset password). Kunci API AI hanya ada di server.

## Pengujian

- **Uji unit:** 17 skrip `uji:<area>` (validasi, tanggal, analitik, kantong, pinjaman, metode budget, dan lainnya), ditulis sebagai skrip `tsx` biasa dengan `node:assert`, tanpa kerangka uji.
- **Uji end-to-end:** 18 suite di browser headless lewat DevTools Protocol, termasuk suite aksesibilitas. Uji ini, juga `uji:isolasi` dan `eval:tanya`, memakai akun sementara yang dihapus di akhir, jadi aman dijalankan terhadap database sungguhan.
- **Pengukuran:** ketepatan membaca ketikan atas 18 kalimat dengan Groq sungguhan (`ukur:teks`), dan evaluasi jawaban Tanya AI (`eval:tanya`).
- **Diagnostik:** `test:receipt` dan `test:teks` menjalankan kode produksi yang sama, lalu membongkar tiap tahapnya supaya hasilnya bisa diperiksa sebelum dipercaya.

## Deploy dan operasional

- Berjalan di Vercel, region Singapura.
- Riwayat perubahan dicatat di CHANGELOG mengikuti Keep a Changelog dan Semantic Versioning; versi yang tampil di aplikasi dibaca dari `package.json`.
