# 02 - Design system

Status: **Approved** (disetujui owner, 2026-10-31; Q2.7 dan Q2.8 disetujui 2026-10-31)

Spec ini menjabarkan G4 sampai G7 dari `01-overview.md`: tampilan, tema Day/Night, dan maskot. Referensi visual: `mockups/c-minimal-refero.html` (lokal) dan gaya Refero "Obscura".

## Prinsip

1. Minimal dan bersih; kesan "pixel" hanya sebagai aksen (heading, awan, matahari, bulan, bintang, berang-berang), bukan pada teks isi.
2. Satu warna aksen (oranye). Tidak ada warna merek kedua. Pengecualian: ikon bendera di tombol bahasa memakai warna asli benderanya (Q2.6), dan ilustrasi adegan pixel di halaman utama (Q7.6 di `07-scenery.md`).
3. Satu tombol utama (oranye) per layar.
4. Kontras WCAG AA adalah syarat, bukan pilihan. Angka di spec ini sudah dihitung, bukan perkiraan.

## Temuan dari mockup (diperbaiki di spec ini)

Perhitungan kontras terhadap mockup C menemukan tiga masalah:

| Elemen di mockup | Kontras | Syarat | Perbaikan |
|---|---|---|---|
| Judul hero oranye `#ff5e24` di atas `#e3f1fe` (Day) | 2,66:1 | 3:1 (teks besar) | Judul Day memakai `--accent-display` `#d4430c` (3,97:1) |
| Teks putih di atas tombol/node oranye `#ff5e24` | 3,05:1 | 4,5:1 | Teks pada oranye memakai `--on-accent` `#101828` (5,81:1) |
| Label kecil oranye `#d4430c` di atas kartu `#f4f9fe` | 4,30:1 | 4,5:1 | Teks kecil Day memakai `--accent-text` `#b83a08` (5,44:1) |

Warna `--ash` `#989ea4` (placeholder di referensi) hanya 2,71:1 di atas putih, jadi **tidak dipakai untuk teks yang bermakna**.

## Token warna

Semua warna dipakai lewat variabel CSS (`--nama`) yang berubah menurut `data-theme="day" | "night"` di elemen `<html>`.

| Token | Day | Night | Dipakai untuk |
|---|---|---|---|
| `--bg` | `#e3f1fe` | `#0b1226` | Kanvas halaman |
| `--nav` | `#ffffff` | `#0f1730` | Navbar |
| `--band` | `#ffffff` | `#0f1830` | Section berlatar kontras |
| `--card` | `#ffffff` | `#141e3b` | Kartu |
| `--card-band` | `#f4f9fe` | `#131d3a` | Kartu di atas `--band` |
| `--ink` | `#232629` | `#e8edf7` | Teks utama |
| `--muted` | `#5c6066` | `#a3afcb` | Teks sekunder |
| `--line` | `#e3f1fe` | `#26335a` | Garis dan border kartu |
| `--chip` | `#e3f1fe` | `#1e2a50` | Latar node dan tag |
| `--accent` | `#ff5e24` | `#ff5e24` | Isi tombol utama, node sorotan, matahari |
| `--on-accent` | `#101828` | `#101828` | Teks di atas `--accent` |
| `--accent-text` | `#b83a08` | `#ff8a5c` | Teks kecil beraksen, tautan, label |
| `--accent-display` | `#d4430c` | `#ff5e24` | Teks besar (24px ke atas) beraksen, misalnya judul hero |
| `--footer` | `#6c3200` | `#1d0e03` | Latar footer |
| `--footer-ink` | `#f5e6dc` | `#f5e6dc` | Teks footer |

### Kontras terverifikasi (rasio)

| Pasangan | Day | Night |
|---|---|---|
| `--ink` di atas `--bg` | 13,24 | 15,85 |
| `--muted` di atas `--bg` | 5,51 | 8,46 |
| `--muted` di atas `--card` / `--card-band` | 5,97 | 7,47 |
| `--accent-text` di atas `--card-band` | 5,44 | 7,07 (di atas `--card`) |
| `--accent-text` di atas `--bg` | 5,01 | n/a (≥7) |
| `--accent-display` di atas `--bg` (teks besar) | 3,97 | 6,09 |
| `--on-accent` di atas `--accent` | 5,81 | 5,81 |
| `--footer-ink` di atas `--footer` | 8,23 | 15,44 |
| Fokus ring (`--accent-text` Day / `--accent` Night) di atas `--bg` | 5,01 | 6,09 |

Catatan: matahari, bulan, bintang, awan, dan berang-berang murni dekoratif (`aria-hidden`), jadi tidak terkena syarat kontras elemen non-teks.

## Tipografi

- **Jersey 10** (pixel): hanya untuk heading **36px ke atas**. Tidak untuk teks isi, tombol, navigasi, atau label. Satu pengecualian: teks bubble sapaan berang-berang memakai Jersey 10 20px (Q2.7, lihat `07-scenery.md`).
- **Monospace sistem** (`ui-monospace`, tidak dihosting): hanya untuk chip bergaya git di roadmap Experience, yaitu label cabang (`pelatihan/bangkit`), `HEAD`, dan `init`, ukuran 12px (Q2.8).
- **Manrope** (bobot 400 sampai 800): semua teks lainnya.
- Kedua font dihosting sendiri (lihat bagian Lisensi font) dan keduanya berlisensi open source.
- Skala (px / line-height / tracking): caption 12 / 1,5; body-sm 14 / 1,43; body 16 / 1,5; subheading 18 / 1,56; heading-sm 36 / 1,11 / -0,9px; heading 48 / 0,85 / -1,2px; heading-lg 60 / 0,85 / -1,5px; display 96 / 0,80 / -3px.
- Ukuran display 96px dipakai hanya di layar lebar; di mobile heading hero mengecil (`clamp`), tetap minimal 48px.
- Fallback (tidak ikut dihosting): Jersey 10 jatuh ke `ui-monospace, monospace`; Manrope jatuh ke `system-ui, sans-serif`.
- `font-display: swap`; font utama dimuat lebih awal (preload) agar tidak menurunkan skor Lighthouse.
- Judul bertulisan Jersey 10 tetap harus terbaca: tidak boleh terlalu rapat, dan jangan dipakai untuk kalimat panjang.

### Lisensi font

Hanya font berlisensi open source yang dipakai. Terverifikasi di registry npm (Fontsource) pada saat spec ini ditulis:

| Font | Paket | Versi | Lisensi |
|---|---|---|---|
| Jersey 10 | `@fontsource/jersey-10` | 5.3.0 | OFL-1.1 (SIL Open Font License) |
| Manrope | `@fontsource-variable/manrope` | 5.3.0 | OFL-1.1 (SIL Open Font License) |

Konsekuensi OFL yang harus dipenuhi:
- Penggunaan di situs (termasuk komersial) dan hosting sendiri diperbolehkan.
- Teks lisensi dan pemberitahuan hak cipta tetap menyertai file font yang didistribusikan (paket Fontsource sudah menyertakannya; jangan dihapus dari output build).
- Font tidak boleh dijual sendiri, dan versi yang dimodifikasi tidak boleh memakai nama font aslinya.
- Font tambahan di masa depan wajib dicek lisensinya dulu dan ditambahkan ke tabel ini sebelum dipakai.

Hanya subset yang dibutuhkan (Latin) dan format `woff2` yang dimuat, agar ukurannya kecil.

## Spasi, radius, bayangan

- Satuan dasar 8px. Skala: 8, 16, 24, 32, 48, 64, 80, 96.
- Lebar konten maksimum 1200px; gutter samping minimal 24px.
- Radius: 6px (tombol, tag, node, toggle), 12px (kartu), 16px (kartu besar/project hero).
- Bayangan kartu Day: empat lapis tipis berwarna biru gelap transparan (lihat mockup). Night: tiga lapis hitam transparan. Satu kartu hanya satu set bayangan.

## Komponen

| Komponen | Spesifikasi |
|---|---|
| **Navbar** | Latar `--nav`, tinggi 64px. Logo `alvinreihans` kiri; tautan Works, Experience, Contact kanan; lalu tombol tema (ikon) dan tombol bahasa (ikon bendera). Di mobile tautan disembunyikan (menu akan dibahas di `04-pages.md`), kontrol tetap tampil. |
| **Tombol utama** | Latar `--accent`, teks `--on-accent`, radius 6px, padding 12px 22px, ikon panah. Satu per layar. |
| **Tombol sekunder** | Transparan, border 1px, teks `--ink`. |
| **Tautan teks** | Garis bawah `--accent-text` 2px, offset 5px. |
| **Kartu** | `--card`, radius 12px, padding 20px (16 di mobile), border 1px `--line`. |
| **Tag** | `--chip` / `--card-band`, teks `--muted` 12px, radius 6px. |
| **Diagram (node)** | `--chip`, radius 6px; node sorotan memakai `--accent` + `--on-accent`. Detail sintaks di `06-project-stories.md`. |
| **Tombol tema** | Satu tombol ikon pixel yang bergantian antara matahari bersinar (Day) dan bulan sabit (Night), digambar di grid 11x11 dengan 2px per piksel. Ikon menunjukkan tema yang sedang aktif. Nama aksesibel (`aria-label`) menyebut aksinya, misalnya "Ganti ke tema Night" / "Switch to Night theme", mengikuti bahasa yang dipilih; label berubah mengikuti keadaan, jadi tanpa `aria-pressed`. Area klik minimal **44x44px**, fokus terlihat. |
| **Tombol bahasa** | Satu tombol ikon yang menampilkan bendera pixel bahasa yang sedang aktif: bendera Indonesia untuk bahasa Indonesia, bendera Amerika Serikat untuk bahasa Inggris, tanpa teks kode. Menekannya berpindah ke bahasa lain. Nama aksesibel menyebut aksinya dalam bahasa aktif ("Ganti ke bahasa Inggris" / "Switch to Indonesian"), tanpa `aria-pressed`. Bendera digambar dengan 1px per piksel agar detailnya terbaca: bendera AS 25x13 piksel di dalam bingkai (13 garis masing-masing 1 piksel, kanton biru setinggi 7 garis, bintang selang-seling), bendera Indonesia 25x14 piksel (merah dan putih sama tinggi). Bingkai 1 piksel memakai warna teks agar bagian putih tetap terlihat di latar terang. Area klik minimal **44x44px**, fokus terlihat. |
| **Footer** | Latar `--footer`, teks `--footer-ink`, heading Jersey 10. Di setiap halaman, Contact dan footer memakai tekstur tanah adegan dengan warna teks per tekstur (lihat `07-scenery.md`). |

## Dekorasi langit (pixel art)

> Diperbarui 2026-10-31: di halaman utama awan dan bintang pindah ke lapisan langit selebar halaman; matahari dan bulan tetap di hero. Detailnya di `07-scenery.md`, yang berlaku bila bertentangan dengan bagian ini.

- Dibuat sebagai komponen SVG (rect berbasis grid, `shape-rendering: crispEdges`), bukan gambar bitmap, supaya tajam di semua layar dan ikut token warna.
- **Day:** matahari oranye pixel dan awan putih berkontur. **Night:** bulan sabit krem, bintang berkedip, awan gelap.
- Letaknya di sisi kanan hero dan jangan menutupi teks. Di layar kecil, awan besar disembunyikan.
- Bintang berkedip dengan langkah (`steps`) dan **berhenti total** saat `prefers-reduced-motion` aktif.
- Pergantian Day/Night memakai transisi warna sekitar 0,4 detik; juga dimatikan saat `prefers-reduced-motion`.

## Maskot berang-berang pixel

> Diperbarui 2026-10-31: sprite baru 20x17 piksel mengikuti gambar referensi owner, **dengan outline** dan palet sendiri (lihat `07-scenery.md`). Aturan "tanpa outline" dan tiga token `--mascot-*` di bawah diganti olehnya. Di halaman utama berang-berang tampil di adegan acak di atas Contact, menggantikan pose "duduk di tepi footer / tidur mengapung".

- **Peran:** dekoratif dan pemanis, bukan elemen utama. Tidak ada berang-berang besar di hero.
- **Ukuran dan tempat:**

| Tempat | Ukuran | Catatan |
|---|---|---|
| Footer / section contact | sekitar 80px | Duduk di tepi atas footer (Day) atau tidur telentang mengapung dengan "z z" (Night) |
| Halaman 404 | – | Tidak ada berang-berang besar; berang-berang di adegan di setiap halaman sudah menemani (Q4.26 di `04-pages.md`) |
| Aksen kecil (misalnya di samping judul section atau akhir halaman project) | 40 sampai 64px | Opsional, tidak lebih dari satu per layar |

- **Pose mengikuti tema:** Day = duduk dan sesekali berkedip; Night = tidur telentang mengapung. Pose berganti seiring tema.
- **Gaya:** grid pixel (misalnya 32x32), isian datar tanpa outline. Warna tubuh memakai tiga token tetap yang **tidak berubah menurut tema**, diambil dari nilai yang sudah ada di palet: `--mascot-body` `#6c3200` (Ember Crust, cokelat), `--mascot-light` `#f5e6dc` (krem, wajah dan perut), dan `--mascot-dark` `#232629` (mata dan hidung). Tidak ada warna baru.
- **Pemakaian ulang:** sprite yang sama dipakai untuk favicon (kepala berang-berang) dan gambar Open Graph (lihat `04-pages.md`).
- **Teknis:** komponen SVG (rect), `aria-hidden="true"` karena dekoratif; animasi berhenti saat `prefers-reduced-motion` aktif.
- **Proses:** sprite pertama dibuat sebagai draft SVG, lalu owner meninjau tampilannya sebelum dipakai.

## Perilaku tema

Urutan penentuan tema:

1. Pilihan tersimpan di `localStorage` (kunci `theme`, nilai `day` atau `night`).
2. Jika belum ada pilihan tersimpan: `prefers-color-scheme` pengunjung (gelap menjadi Night, terang menjadi Day). Alasannya: menghormati pengunjung yang memilih mode gelap, termasuk di siang hari.
3. Jika keduanya tidak tersedia: Day.

Aturan tambahan:
- **Ikut sistem secara langsung selama belum memilih:** jika belum ada pilihan tersimpan dan pengunjung mengganti pengaturan tema sistem atau browser saat situs terbuka, tema situs ikut berganti.
- **Pilihan manual disimpan:** menekan tombol tema menyimpan pilihan ke `localStorage`, dipakai di reload dan kunjungan berikutnya, dan situs berhenti mengikuti perubahan sistem.
- **Kembali mengikuti sistem:** karena tombolnya hanya dua keadaan (tanpa pilihan "ikuti sistem"), jika pengunjung memilih tema yang **sama dengan tema sistem saat itu**, simpanan dihapus dan situs kembali mengikuti sistem. Bagi pengunjung, perilakunya tetap terasa sama: tema yang ia pilih tetap tampil.
- Penerapan `data-theme` dilakukan lewat skrip kecil di `index.html` **sebelum** React dimuat, supaya tidak ada kilatan tema yang salah.
- `localStorage` yang gagal diakses (mode privat) tidak boleh menyebabkan error; situs tetap berjalan mengikuti sistem.

## Kriteria penerimaan

- [ ] AC1. Seluruh warna teks dan kontrol memenuhi rasio di tabel kontras pada kedua tema (diverifikasi dengan skrip penghitung).
- [ ] AC2. Jersey 10 hanya muncul pada heading 36px ke atas dan pada bubble sapaan (20px).
- [ ] AC3. Hanya ada satu tombol utama oranye per layar.
- [ ] AC4. Semua kontrol interaktif punya area klik minimal 44x44px dan indikator fokus yang terlihat dengan kontras minimal 3:1.
- [ ] AC5. Mengganti tema tidak menimbulkan layout shift, dan tidak ada kilatan tema salah saat halaman dimuat.
- [ ] AC6. Dengan `prefers-reduced-motion` aktif, bintang, kedipan berang-berang, dan transisi tema berhenti.
- [ ] AC7. Maskot tampil di adegan di atas Contact di setiap halaman (termasuk 404) pada kedua tema dengan pose yang sesuai, dan tidak muncul di hero.
- [ ] AC8. Tidak ada scroll horizontal di lebar 320px ke atas pada kedua tema.
- [ ] AC9. Situs tidak membuat permintaan ke Google Fonts atau CDN font lain; font dimuat dari domain sendiri dalam format `woff2`.
- [ ] AC10. Tombol tema bisa dioperasikan dengan keyboard (Enter dan Spasi), punya `aria-label` yang menyebut aksi dalam bahasa aktif, dan label itu ikut berubah saat bahasa atau tema berganti.
- [ ] AC15. Tombol bahasa menampilkan bendera bahasa aktif, berpindah bahasa saat ditekan (mouse, Enter, Spasi), punya `aria-label` yang menyebut aksinya, dan area kliknya minimal 44x44px.
- [ ] AC11. Teks lisensi OFL untuk Jersey 10 dan Manrope tersedia di repo (dan ikut dalam hasil build atau dirujuk dari halaman).
- [ ] AC12. Kunjungan pertama (tanpa pilihan tersimpan) dengan sistem gelap menampilkan Night, dan dengan sistem terang menampilkan Day (diuji dengan emulasi `prefers-color-scheme` di Playwright).
- [ ] AC13. Tanpa pilihan tersimpan, mengubah `prefers-color-scheme` saat halaman terbuka mengganti tema; dengan pilihan tersimpan, tema tidak berubah.
- [ ] AC14. Pilihan manual yang berbeda dari sistem tersimpan di `localStorage` dan bertahan setelah reload maupun di tab baru; memilih tema yang sama dengan sistem menghapus simpanan.
## Catatan implementasi

- Token dideklarasikan sebagai variabel CSS dan dipetakan ke konfigurasi tema Tailwind, supaya kelas utilitas memakai token yang sama. (Pemakaian Tailwind masih usulan; dikonfirmasi saat scaffold.)
- Font dihosting sendiri lewat `@fontsource/jersey-10` dan `@fontsource-variable/manrope` (disetujui owner), dimuat lewat impor di kode sehingga ikut dibundel Vite, dengan preload untuk font yang dipakai di layar pertama.

## Keputusan

- Q2.1. Font dihosting sendiri, hanya yang berlisensi open source (OFL-1.1). Tidak memakai Google Fonts di situs.
- Q2.2. Kontrol tema berupa satu tombol ikon (matahari/bulan), bukan dua segmen.
- Q2.3. Judul hero Day memakai `--accent-display` `#d4430c` (kontras 3,97:1, memenuhi syarat teks besar). Keputusan diserahkan owner kepada pengusul spec; dipilih `#d4430c` karena masih terasa oranye cerah dan lolos AA, sedangkan `#b83a08` terlalu mendekati cokelat.
- Q2.4. Teks tombol utama gelap (`--on-accent` `#101828`) di atas oranye, bukan putih.
- Q2.5. Tema awal mengikuti `prefers-color-scheme` pengunjung (karena sebagian orang memilih mode gelap meski siang hari), dan pilihan manual disimpan di `localStorage`. Memilih tema yang sama dengan sistem mengembalikan situs ke mode "ikuti sistem".
- Q2.6. Pilihan bahasa berupa satu tombol ikon bendera pixel (Indonesia dan Amerika Serikat), tanpa teks kode, menggantikan kontrol segmen "EN / ID". Warna asli bendera menjadi pengecualian dari aturan satu warna aksen. Ikon matahari diberi sinar agar jelas dibedakan dari bulatan.
- Q2.7. Bubble sapaan berang-berang memakai Jersey 10 20px agar terasa seperti teks game pixel (permintaan owner, `07-scenery.md`). Teksnya pendek (satu kalimat), berwarna `#232629` di atas putih (15,21:1).
- Q2.8. Chip bergaya git di roadmap (label cabang, `HEAD`, `init`) memakai monospace sistem, bukan font yang dihosting, sehingga tidak menambah unduhan font. Lihat `04-pages.md`, section 3.
- Q2.9. Tombol "Kirim email" di section Contact tetap oranye di semua halaman, walaupun bisa terlihat bersamaan dengan tombol utama halaman (misalnya "Kembali ke beranda" di 404 atau "Unduh PDF" di `/cv`). Contact diperlakukan sebagai bagian penutup yang terpisah dari isi halaman (owner, 2026-11-01). **Tidak berlaku lagi:** Contact kini memakai ikon mail, bukan tombol oranye (Q4.27 di `04-pages.md`).

## Pertanyaan terbuka

Tidak ada. Spec ini siap ditinjau untuk ditandai **Approved**.
