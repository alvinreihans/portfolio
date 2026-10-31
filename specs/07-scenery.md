# 07 - Pemandangan pixel (langit, adegan, berang-berang)

Status: **Draft** (menunggu tinjauan owner)

Spec ini menjabarkan dekorasi pixel di halaman utama: langit yang membentang di seluruh halaman, satu adegan acak di atas section Contact, berang-berang yang bisa disapa, dan section Contact yang memakai tekstur tanah adegan. Spec ini menggantikan bagian "Dekorasi langit" dan "Maskot berang-berang pixel" di `02-design-system.md` untuk halaman utama. Referensi tampilan: `mockups/g-scenes.html` (lokal).

## Tujuan

- Situs terasa hidup dan punya identitas ("situs dengan berang-berang"), tanpa mengganggu recruiter yang hanya butuh 10 sampai 30 detik.
- Semua dekorasi tetap ringan: tidak menurunkan Lighthouse di bawah 90, tidak menimbulkan layout shift, dan berhenti total bagi pengunjung yang memilih mengurangi gerakan atau memakai device lemah.

## Bukan tujuan

- Bukan game. Tidak ada skor, kontrol karakter, atau suara.
- Tidak ada pustaka animasi atau game engine baru. Semua digambar dengan Canvas 2D dan CSS bawaan browser.

## 1. Langit selebar halaman

- Satu lapisan langit di belakang seluruh isi halaman utama (`position: absolute`, setinggi halaman sampai tepi atas adegan), `pointer-events: none`, `aria-hidden="true"`.
- **Awan:** sprite awan pixel 18x7 sel (SVG rect, `shape-rendering: crispEdges`), warna dari token (Day: kontur `--muted`, isi putih, bayangan `--bg`; Night: kontur `--line`, isi `--card`, bayangan `--chip`).
  - Posisi diacak sekali saat halaman dimuat. Di layar lebar (gutter samping minimal 120px) awan diletakkan di gutter kiri dan kanan agar tidak menutupi teks; ukuran sel 5, 6, atau 8px. Di layar sempit awan lebih sedikit, ukuran sel 4px, dan berada di tepi kiri atau kanan (boleh terpotong tepi layar).
  - Jumlah: layar lebar sekitar satu awan per 260px tinggi halaman (minimal 6); layar sempit satu per 700px (minimal 3).
  - Gerak: bergeser pelan ke kiri dan kanan (`transform: translateX`), jangkauan 40 sampai 90px, durasi 18 sampai 35 detik per arah, dengan jeda awal acak agar tidak bergerak serempak.
  - Tata letak dihitung ulang hanya bila lebar halaman berubah.
- **Bintang (Night saja):** titik pixel 4px atau 6px, sekitar satu per 14.000px² area, berkedip dua langkah (`steps(2)`) selama 3 detik dengan jeda acak.
- **Matahari dan bulan** tetap di sisi kanan hero seperti sekarang (`Sky` di hero). Awan di hero pindah ke lapisan langit ini.

## 2. Adegan acak di atas Contact

### Teknis

- Satu `<canvas>` beresolusi rendah yang diperbesar 4 kali (`image-rendering: pixelated`), selebar viewport. Tinggi tetap: 64 baris (256px), kecuali adegan kota 88 baris (352px) karena jalan dua lajur dan trotoar bawah. Tinggi ini dipasang sejak awal, jadi tidak ada layout shift.
- Kanvas `aria-hidden="true"`. Tidak ada teks penting di dalam kanvas.
- Frame digambar setiap 160ms (sekitar 6 fps), cukup untuk gaya pixel dan hemat baterai.
- Kode adegan dimuat terpisah (dynamic import) setelah halaman siap, supaya tidak menambah ukuran bundle awal.

### Empat adegan

Adegan dipilih acak **sekali per kunjungan halaman** (setiap reload bisa berbeda). Detail tiap adegan diacak dari seed yang sama, jadi tidak berubah selama kunjungan.

| Adegan | Day | Night | Tanah (dan Contact) | Partikel |
|---|---|---|---|---|
| Taman | Berang-berang duduk di bangku dengan kopi, pohon, semak | Tidur di bangku dengan "z z", lampu taman menyala | Tanah cokelat | Daun jatuh (Day), kunang-kunang (Night) |
| Pantai | Membangun istana pasir, ombak, payung | Tidur di dekat istana pasir, bulan di laut | Pasir | Burung camar (Day) |
| Kota | Duduk di depan kedai kopi, gedung, lampu jalan | Lembur dengan kopi, jendela gedung menyala | Paving bata | Mobil lewat di dua lajur |
| Gunung | Memanggang marshmallow di api unggun, pohon pinus | Duduk menghangatkan diri, api menerangi satu sisi tubuh | Tanah cokelat (dengan batu kecil di Night) | Asap api unggun |

- **Mobil (kota):** sprite 24x9 piksel dengan warna bodi acak; di Night lampu depan memancarkan sorot cahaya. Jumlah per lajur `max(1, round(lebar / 300))` agar tidak ramai.
- **Cahaya dinamis (Night):** lampu, jendela, dan api digambar sebagai dither piksel yang radiusnya berkedip satu piksel sesekali.
- Warna adegan adalah ilustrasi dan **pengecualian dari aturan satu warna aksen** (lihat Q7.6). Warnanya tetap mengikuti tema Day/Night.

### Berang-berang

- Sprite 20x17 piksel mengikuti gambar referensi owner (berang-berang/beaver oranye dengan ekor pipih), dengan **outline** cokelat gelap. Ini mengganti aturan "isian datar tanpa outline" di `02-design-system.md`.
- Palet tetap (tidak berubah menurut tema): outline `#6c3200`, bulu `#e0832e`, perut `#f7c98b`, mata `#3b1c02`, gigi `#ffffff`, ekor `#a5541a`, kacamata hitam `#101828`.
- Animasi diam: napas (badan naik turun satu piksel), berkedip sesekali, ekor bergoyang. Saat tidur napas melambat.
- Pose mengikuti adegan dan tema (lihat tabel di atas).

### Sapaan

- Di atas berang-berang ada `<button>` transparan seukuran sprite (di layar sekitar 80x68px, jadi memenuhi 44x44px) dengan nama aksesibel "Sapa berang-berang" / "Say hi to the beaver", fokus terlihat.
- Menekannya (mouse, sentuh, Enter, Spasi): berang-berang melompat kecil dan terkejut (yang tidur terbangun), lalu muncul **bubble pixel** berisi satu kalimat acak sesuai adegan dan tema.
- **Bubble pixel:** sudut bertangga dan ekor bertangga mengarah ke berang-berang (9-slice SVG 7x7 sel, 3px per sel), isi putih, kontur `#232629`, bayangan pixel tipis. Teks memakai Jersey 10 20px warna `#232629` (15,21:1 di atas putih).
- **Efek diketik:** huruf muncul satu per satu (45ms per huruf) dengan kursor `_`. Lebar bubble dipasang sejak awal agar tidak melebar saat mengetik. Bubble hilang sekitar 2,2 detik setelah kalimat selesai. Menyapa lagi saat bubble tampil memulai kalimat baru.
- **Screen reader:** bubble yang terlihat `aria-hidden`; kalimat utuh diumumkan sekali lewat elemen tersembunyi `aria-live="polite"`, bukan huruf per huruf.
- Kalimat sapaan disimpan di locale (`home.json`, kunci `scene.lines.<adegan>.<day|night>`), ditulis dalam bahasa Indonesia lalu diterjemahkan, dan masuk daftar `_review` untuk ditinjau owner. Draf awal mengikuti mockup, misalnya "Santai dulu, ngoding nanti." dan "Zzz...".

## 3. Contact di atas tekstur tanah

- Section Contact dan footer di halaman utama memakai **tekstur tanah adegan** sebagai latar (tile 32x16 piksel yang diperbesar 4 kali), sehingga adegan dan Contact terlihat menyatu. Tekstur dibuat dari palet yang sama dengan tanah di kanvas.
- Warna teks per tekstur. Kontras dihitung terhadap **setiap** warna yang ada di tekstur (yang terendah ditulis):

| Tekstur | Day: teks / kontras terendah | Night: teks / kontras terendah |
|---|---|---|
| Tanah | `#f5e6dc` / 6,96 | `#f5e6dc` / 8,21 |
| Pasir | `#2b1600` / 8,83 | `#f5e6dc` / 6,45 |
| Paving | `#0f1a33` / 8,62 | `#f5e6dc` / 10,33 |

- Kerikil abu-abu di tanah Day tidak dipakai (hanya 2,54:1 terhadap teks).
- Teks diberi bobot 600 dan halo tipis berwarna dasar tekstur (`text-shadow`) supaya tekstur tepat di belakang huruf terlihat lebih tenang. Halo ini hanya membantu keterbacaan; kontras di atas sudah lolos tanpa halo.
- Tombol **Kirim email** (utama, `--accent`) dan **Salin email** (sekunder, latar `--nav`) tetap berlatar padat, jadi kontrasnya tidak dipengaruhi tekstur.
- Halaman lain (`/cv`, `/projects/:slug`, 404) tetap memakai footer ringkas berlatar `--footer` seperti di `04-pages.md` (lihat Q7.5).

## 4. Mode statis (gerak dimatikan)

Pemandangan tampil **diam** (satu frame digambar, awan dan bintang tidak bergerak, partikel tidak tampil, tidak ada lompatan) jika salah satu terpenuhi:

1. `prefers-reduced-motion: reduce`.
2. `navigator.connection.saveData` bernilai `true`.
3. `navigator.connection.effectiveType` adalah `slow-2g` atau `2g`.
4. `navigator.deviceMemory` 2 atau kurang.
5. `navigator.hardwareConcurrency` 2 atau kurang.
6. **Pengawas FPS:** selama 2 detik pertama animasi, rata-rata `requestAnimationFrame` di bawah sekitar 30 fps, maka animasi berhenti dan beralih ke diam.

API yang tidak tersedia di browser tertentu dianggap tidak terpenuhi (bukan alasan untuk diam). Di mode statis, sapaan tetap berfungsi: bubble langsung menampilkan kalimat utuh.

Selain itu, animasi **dijeda** (tanpa menggambar sama sekali) saat kanvas tidak terlihat di layar (`IntersectionObserver`) atau tab tidak aktif (`visibilitychange`), dan berlanjut saat terlihat lagi.

## Kriteria penerimaan

- [ ] AC1. Halaman utama menampilkan salah satu dari empat adegan; reload berkali-kali memunculkan adegan berbeda (diuji dengan seed tetap lewat parameter uji di Playwright).
- [ ] AC2. Setiap adegan tampil benar di Day dan Night, di lebar 320px, 768px, dan 1440px, tanpa scroll horizontal.
- [ ] AC3. Awan bergerak pelan dan, di layar lebar (gutter ≥120px), tidak menutupi kolom konten.
- [ ] AC4. Tinggi kanvas sudah benar sejak render pertama (CLS dari pemandangan 0).
- [ ] AC5. Tombol sapa bisa difokus dengan Tab, punya nama aksesibel sesuai bahasa, dan Enter, Spasi, serta klik memunculkan bubble yang mengetik kalimat sesuai adegan dan tema.
- [ ] AC6. Kalimat sapaan diumumkan utuh satu kali lewat `aria-live="polite"`; bubble yang terlihat `aria-hidden`.
- [ ] AC7. Dengan `prefers-reduced-motion`, awan, bintang, kanvas, dan efek ketik berhenti; bubble langsung tampil utuh.
- [ ] AC8. Aturan mode statis 2 sampai 6 bekerja (diuji dengan menimpa `navigator.connection`, `deviceMemory`, dan `hardwareConcurrency` di Playwright).
- [ ] AC9. Animasi berhenti menggambar saat kanvas di luar layar atau tab tersembunyi.
- [ ] AC10. Kontras teks Contact di keenam kombinasi tekstur dan tema sesuai tabel di atas (diverifikasi dengan skrip penghitung).
- [ ] AC11. Kode adegan tidak masuk bundle awal, dan batas ukuran bundle (170 KB gzip) tetap terpenuhi.
- [ ] AC12. Lighthouse Performance dan Accessibility tetap 90 ke atas di mobile.

## Rencana pengerjaan

Dua slice, dikerjakan **sebelum** Experience (keputusan Q7.4):

1. **`feat/scenery`:** lapisan langit selebar halaman, kanvas dengan empat adegan, berang-berang dengan animasi diam, Contact di atas tekstur tanah, mode statis dan jeda. AC1 sampai AC4 dan AC7 sampai AC12.
2. **`feat/scenery-greeting`:** sapaan dengan bubble pixel dan efek ketik, partikel, dan cahaya dinamis. AC5 dan AC6, serta AC7 untuk bagian sapaan.

## Keputusan

- Q7.1. Empat adegan (taman, pantai, kota, gunung), berang-berang mengikuti gambar referensi owner, dan fitur tambahan (sapaan, partikel, cahaya dinamis) disetujui owner (2026-10-31).
- Q7.2. Adegan diacak sekali per kunjungan halaman (disetujui owner).
- Q7.3. Mode statis untuk `prefers-reduced-motion`, koneksi lambat atau hemat data, device lemah, dan FPS rendah (disetujui owner).
- Q7.4. Urutan diserahkan owner; dipilih pemandangan sebelum Experience, dipecah dua slice, karena Contact dan footer ikut berubah dan lebih mudah ditinjau terpisah dari roadmap.
- Q7.6. Warna adegan (pohon, laut, gedung, mobil, berang-berang) adalah ilustrasi dan dikecualikan dari aturan satu warna aksen, sama seperti bendera di Q2.6. Warna teks dan kontrol tetap memakai token.
- Q7.5. Adegan hanya di halaman utama. Halaman lain (`/cv`, project, 404) memakai footer ringkas `--footer`; halaman 404 tetap memakai berang-berang besar seperti di `04-pages.md`, dengan sprite baru (disetujui owner).
- Q7.7. Adegan digambar dengan Canvas 2D, bukan SVG, karena jumlah piksel per frame besar (selebar layar) dan animasinya berjalan per frame. Awan, bubble, dan ikon tetap SVG.

## Pertanyaan terbuka

Tidak ada. Spec ini siap ditinjau untuk ditandai **Approved**.
