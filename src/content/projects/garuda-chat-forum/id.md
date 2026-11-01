Project akhir AWS Back-End Academy: backend untuk forum diskusi sebuah komunitas gim. Fiturnya autentikasi, thread, dan komentar lewat RESTful API, dan fokusnya ada pada cara membangunnya.

Kodenya disusun dengan Clean Architecture, sehingga aturan bisnis tidak bergantung pada framework maupun database, dan dikembangkan dengan TDD menggunakan Jest. API-nya dibangun dengan Hapi dan JWT, data disimpan di PostgreSQL dengan migrasi node-pg-migrate, dan password di-hash dengan bcrypt.

```flow
Klien -> *Hapi API (JWT) -> Use case -> Repository -> PostgreSQL
GitHub Actions (CI/CD) -> AWS EC2
```

Pipeline CI/CD dengan GitHub Actions menjalankan pengujian sebelum men-deploy ke Amazon EC2, dengan database di Amazon RDS.
