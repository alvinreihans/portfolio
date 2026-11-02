## Gambaran umum

Video Belajar adalah aplikasi kursus online dari bootcamp Harisenin, dibangun mengikuti desain Figma: katalog kursus, detail kursus, checkout, halaman belajar dengan video, ringkasan, dan kuis, sertifikat, serta halaman akun. Repo ini berisi dua bagian: SPA React di akar repo dan REST API Express di folder `backend/`.

## Frontend

```flow
*SPA React (Vite, Redux Toolkit) -> axios -> MockAPI (kursus)
SPA React (Vite, Redux Toolkit) -> Data contoh (checkout, materi, pesanan)
```

- React 19, Vite, Tailwind CSS, Redux Toolkit, dan React Router, dengan 13 halaman. Halaman yang butuh login mengalihkan ke `/login`, lalu kembali ke halaman asal setelah masuk.
- Halaman kelola kelas: tambah, ubah, dan hapus kursus lewat form tervalidasi, dengan async thunk Redux Toolkit dan axios ke MockAPI.
- Checkout (pilihan metode bayar, hitung mundur virtual account), materi, kuis, pesanan, dan sertifikat memakai data contoh statis; login masih di sisi klien.
- Token desain dari Figma (warna dan skala huruf) menjadi CSS variable yang dipetakan ke tema Tailwind, ditambah 12 komponen UI dasar.
- State kursus berkembang bertahap: state global bersama, lalu MockAPI lewat axios, lalu Redux Toolkit.
- Memperbaiki halaman terlindungi yang sempat berkedip ke `/login`: status login kini dibaca dari localStorage saat state dibuat, bukan setelah render pertama.

## Backend

```flow
Klien (Postman) -> *Router Express (15 resource) -> Controller CRUD -> Service CRUD (SQL berparameter) -> MySQL
```

- 15 resource, masing-masing dengan 6 endpoint REST (daftar dengan filter dan paginasi, detail, buat, ganti, ubah sebagian, hapus). Semuanya dibangkitkan dari satu pola CRUD generik: sebuah registry mendeklarasikan tabel dan kolom tiap resource, lalu factory membuat router, controller, dan service-nya.
- Aman dari SQL injection sejak rancangan: setiap nilai memakai placeholder, nama kolom hanya dari whitelist, dan LIMIT serta OFFSET diubah ke angka dan dibatasi 200.
- Error MySQL diterjemahkan menjadi status HTTP yang bermakna: data ganda menjadi 409, pelanggaran foreign key menjadi 400 atau 409.
- Server langsung berhenti saat start bila database tidak terjangkau.
- 15 tabel InnoDB dengan 19 foreign key, data seed, skrip `db:schema`, `db:seed`, dan `db:reset`, serta koleksi Postman berisi 94 request.

Di branch `main`, frontend belum memakai backend ini. Penyambungannya, bersama login JWT, verifikasi email, dan unggah gambar, dikerjakan di branch terpisah.
