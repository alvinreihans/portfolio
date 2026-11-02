## Gambaran umum

REST API untuk forum diskusi: pengguna mendaftar dan masuk, membuat thread, menambahkan komentar, dan menghapus komentarnya sendiri. Project ini adalah submission kelas Dicoding "Menjadi Back-End Developer Expert dengan JavaScript" (proyek Automation Testing dan Clean Architecture), bagian dari AWS Back-End Academy.

## Fitur

- Registrasi, login, perpanjangan token, dan logout dengan JWT; refresh token disimpan di database dan password di-hash dengan bcrypt.
- Membuat thread dan menambahkan komentar, keduanya dilindungi JWT.
- Menghapus komentar hanya oleh pemiliknya (selain itu 403), sebagai soft delete: komentarnya tetap tersimpan dan tampil sebagai "**komentar telah dihapus**".
- Detail thread yang bisa dibuka publik, lengkap dengan komentar yang diurutkan berdasarkan waktu.
- Endpoint `/status` untuk health check.

## Arsitektur

```flow
Klien -> *Hapi API (JWT) -> Handler -> Use case -> Repository -> PostgreSQL
Use case -> Entity (validasi)
```

Kodenya disusun dengan Clean Architecture dalam empat lapisan: Domains (entity yang memvalidasi dirinya sendiri dan repository abstrak), Applications (use case), Infrastructures (repository PostgreSQL, bcrypt, JWT, dan server Hapi), dan Interfaces (satu plugin Hapi per resource).

Use case hanya bergantung pada repository abstrak; implementasi PostgreSQL-nya disambungkan lewat container dependency injection. Query memakai parameter, skema dikelola dengan migrasi node-pg-migrate, dan error domain diterjemahkan menjadi respons HTTP di satu tempat (hook `onPreResponse`).

## Pengujian

Pengujian ditulis dengan Jest dalam 42 file uji. Use case diuji dengan mock repository, sedangkan repository dan endpoint HTTP diuji terhadap database PostgreSQL sungguhan.

## CI/CD

```flow
Pull request -> *CI GitHub Actions (PostgreSQL + Jest)
Push ke main -> CD GitHub Actions -> AWS EC2 (pm2)
```

Setiap pull request ke `main` menjalankan migrasi dan seluruh pengujian di GitHub Actions dengan layanan PostgreSQL 15. Setiap push ke `main` men-deploy ke AWS EC2 lewat SSH dan me-reload aplikasi dengan pm2. Untuk memastikan CI benar-benar menghalangi kode yang rusak, saya sengaja membuat pengujian gagal di pull request, lalu memperbaikinya.
