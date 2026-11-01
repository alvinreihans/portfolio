# 05 - Deployment

Status: **Approved** (disetujui owner, 2026-10-31)

Spec ini mengatur cara situs dibangun, di-deploy, diuji, dan dipindahkan dari situs lama ke situs React. Menyentuh deployment termasuk keputusan besar (aturan 5 di `CLAUDE.md`): spec ini adalah permintaan persetujuannya, dan semua langkah di dashboard Vercel serta DomaiNesia dilakukan owner.

## Kondisi saat ini

| Hal | Kondisi |
|---|---|
| Hosting | Vercel, project `alvinreihansgithubio` (nama dari nama repo lama), terhubung ke repo `alvinreihans/alvinreihans.github.io` (akan diganti menjadi `portfolio`, lihat Q5.1) |
| Branch produksi | `main` (situs HTML lama) |
| Preset build | "Other" tanpa build; folder root disajikan apa adanya |
| GitHub Pages | Sudah dimatikan; `alvinreihans.github.io` menjawab 404 |
| Domain | `alvinreihans.web.id` dan `www.alvinreihans.web.id` terpasang di Vercel |
| Arah redirect | Saat ini `alvinreihans.web.id` dialihkan (308) ke `www`. Ini **terbalik** dari keputusan Q1.5 |
| DNS (DomaiNesia) | Satu record A `@` ke `216.198.79.1` dan satu CNAME `www` ke `fd111677842317c9.vercel-dns-017.com` |
| HTTPS | Otomatis dari Vercel, dengan HSTS |
| Branch pengerjaan | `react-rewrite` (preview deployment otomatis tiap push) |

## Prinsip

1. Situs live di `main` tidak berubah sampai hari peralihan (cutover).
2. Semua pekerjaan lewat preview deployment; owner melihat hasilnya di URL preview sebelum apa pun di-merge ke `main`.
3. Tidak ada rahasia dan tidak ada backend; tidak ada variabel lingkungan yang dibutuhkan.
4. Semua konfigurasi deployment hidup di repo (`vercel.json`) sebanyak mungkin, supaya bisa ditinjau seperti kode.

## Konfigurasi build

- Kerangka kerja: **Vite**. Perintah build `npm run build`, folder keluaran `dist`, manajer paket npm dengan `package-lock.json` yang di-commit.
- Versi Node ditetapkan di `package.json` (`engines`) ke versi LTS aktif yang didukung Vite pada saat scaffold.
- **Penting:** pengaturan project di dashboard Vercel berlaku untuk semua branch. Preset "Other" saat ini akan membuat preview `react-rewrite` gagal build. Supaya situs lama di `main` tidak ikut rusak, konfigurasi framework ditaruh di `vercel.json` pada branch `react-rewrite` (file di branch menimpa pengaturan project untuk deployment itu saja). Saat cutover, `vercel.json` ikut masuk ke `main`, lalu preset di dashboard boleh disesuaikan.

### `vercel.json` (usulan)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

Catatan:
- Vercel memeriksa berkas statis lebih dulu sebelum menerapkan rewrite, jadi `/assets/*`, `favicon`, `robots.txt`, dan `sitemap.xml` tetap disajikan sebagai berkas, sedangkan path lain jatuh ke `index.html` (dibutuhkan BrowserRouter, lihat AC1 di `01-overview.md`).
- Berkas di `/assets/` bernama dengan hash dari Vite, jadi aman di-cache setahun (immutable). `index.html` tidak diberi cache panjang.
- Karena ini SPA, path yang tidak dikenal tetap menjawab status HTTP 200 dengan halaman 404 dari aplikasi ("soft 404"). Halaman 404 memasang `<meta name="robots" content="noindex">` lewat kode agar tidak diindeks.
- Redirect `www` ke domain utama dilakukan di pengaturan domain Vercel, bukan di `vercel.json`.

## Domain dan DNS

- Domain utama (kanonik): `alvinreihans.web.id`. `www.alvinreihans.web.id` dialihkan permanen (308) ke domain utama.
- Perubahan yang diperlukan: di Vercel (Settings, Domains) balik arah redirect, yaitu `www` mengarah ke domain utama dan domain utama terhubung langsung ke Production. **Tidak ada perubahan di DomaiNesia**; kedua record DNS yang ada tetap dipakai.
- Tautan lama berbasis hash tetap aman: `/#works` kebetulan cocok dengan id section baru, `/#home` membawa ke atas, dan `/#blog` diabaikan karena blog tidak ada lagi.
- Pengingat operasional: tanggal perpanjangan domain `.web.id` di DomaiNesia dicatat owner di kalender pribadi.

## Alur kerja deployment

| Kejadian | Hasil di Vercel |
|---|---|
| Push ke `main` | Production deployment ke `alvinreihans.web.id` |
| Push ke `react-rewrite` | Preview deployment dengan URL stabil |
| Push ke branch lain (`feat/*`, `fix/*`, `chore/*`, `docs/*`) | **Tidak di-build** (dilewati lewat Ignored Build Step), untuk menghemat kuota build Vercel Hobby |

- Pembatasan build memakai `ignoreCommand` di `vercel.json`: build hanya berjalan jika `VERCEL_GIT_COMMIT_REF` adalah `main` atau `react-rewrite` (exit 1 berarti build jalan, exit 0 berarti dilewati). Deployment yang dilewati tetap muncul di dashboard dengan status dibatalkan. `main` belum memuat `vercel.json` sampai cutover, dan memang selalu di-build.
- URL stabil untuk branch integrasi: `portfolio-git-react-rewrite-alvin-reihansyah-makarims-projects.vercel.app`.
- Preview deployment otomatis diberi header `X-Robots-Tag: noindex` oleh Vercel (terverifikasi 2026-10-31).
- Preview dilindungi Deployment Protection (pengunjung tanpa login Vercel dialihkan dengan 302). Karena tidak ada rahasia di situs ini, owner boleh mematikan proteksi untuk preview agar pemeriksaan asap bisa berjalan tanpa login.
- **Alur PR:** `feat/*` ke `react-rewrite`. Sebelum merge, perubahan diperiksa lewat CI di PR dan secara lokal (`npm run build` lalu `npm run preview`, ditambah pemeriksaan Playwright oleh asisten). Setelah merge, hasilnya dilihat di preview `react-rewrite`. Satu PR akhir `react-rewrite` ke `main` menjadi cutover.
- Deployment lama dari branch yang sudah dihapus tidak ikut terhapus otomatis. Owner bisa menghapusnya manual dari dashboard (menu titik tiga di deployment, lalu Delete), atau membiarkan kebijakan retensi Vercel menghapusnya.

## Integrasi berkelanjutan (CI)

Usulan: satu workflow GitHub Actions `ci.yml` yang berjalan di setiap PR ke `react-rewrite` dan `main`:

1. `npm ci`
2. Lint dan pengecekan tipe (TypeScript).
3. `check-i18n` (lihat `03-i18n.md`).
4. `npm run build`, termasuk pengecekan anggaran ukuran.

Pengujian Playwright penuh tidak dijalankan di CI pada versi pertama; dijalankan sebagai pemeriksaan "selesai" oleh asisten terhadap URL preview (lihat Verifikasi). Menambah workflow adalah perubahan deployment, jadi butuh persetujuan (Q5.3).

## robots.txt, sitemap, dan metadata

- `public/robots.txt`: mengizinkan semua halaman dan menunjuk `Sitemap: https://alvinreihans.web.id/sitemap.xml`.
- `sitemap.xml` memuat `/`, `/cv`, dan `/projects/<slug>` untuk tiap project. Dibuat saat build oleh skrip Node kecil (tanpa dependency baru) yang membaca `meta.json` semua project, dijalankan lewat langkah `prebuild`.
- Karena situs ini SPA yang dirender di browser, pratinjau tautan di media sosial memakai gambar dan teks Open Graph yang sama untuk semua URL (keputusan sebelumnya: tanpa render di server dan tanpa bahasa di URL).

## Anggaran performa

- JavaScript awal (gzip) di bawah 170 KB. Pustaka yang hanya dipakai di halaman project (renderer markdown) dimuat malas.
- Gambar OG di bawah 300 KB; gambar di cerita mengikuti aturan di `06-project-stories.md`.
- Skor Lighthouse mobile: Performance dan Accessibility 90 atau lebih (lihat `01-overview.md`).

## Rencana peralihan (cutover)

**Prasyarat** (semua harus terpenuhi di preview `react-rewrite`):

- [ ] Semua kriteria penerimaan di spec 01 sampai 06 lulus, diverifikasi dengan Playwright (dua bahasa, dua tema, mobile dan desktop).
- [ ] Seluruh penanda `_review` pada teks sudah ditinjau dan dihapus owner.
- [ ] Dua salinan CV publik di Google Docs (tanpa nomor telepon, rincian Intramedika diringkas) sudah dibuat, ID dokumennya terpasang di `src/content/links.ts`, dan lolos pemindaian teks (lihat `04-pages.md`).
- [ ] Sprite berang-berang disetujui; favicon dan gambar Open Graph sudah ada.
- [ ] Lisensi font OFL tersedia di repo (lihat `02-design-system.md`).
- [ ] `[Unreleased]` di `CHANGELOG.md` sudah dirapikan menjadi `[1.0.0]` bertanggal.

**Langkah:**

1. Owner membuka PR `react-rewrite` ke `main` dan meninjau diff dan URL preview terakhir.
2. Owner me-merge PR (disarankan merge commit agar riwayat pengerjaan tetap terlihat).
3. Vercel otomatis membuat production deployment. Asisten menjalankan pemeriksaan asap terhadap `https://alvinreihans.web.id` (lihat Verifikasi).
4. Owner membalik arah redirect `www` ke domain utama di Vercel (jika belum), lalu diverifikasi dengan `curl -I`.
5. Owner membuat tag `v1.0.0` di `main` dan mendorongnya; catatan rilis diambil dari `CHANGELOG.md`.
6. Owner menghapus branch `react-rewrite` (lokal dan remote) bila sudah tidak dipakai.

**Rollback:**
- Cepat: di dashboard Vercel gunakan Instant Rollback ke production deployment sebelumnya (situs HTML lama). Pada plan Hobby, rollback mungkin terbatas ke deployment produksi sebelumnya; diperiksa sebelum cutover.
- Lewat git: `git revert -m 1 <commit-merge>` di `main`, lalu push.

## Verifikasi (pemeriksaan asap)

Skrip Playwright kecil dijalankan terhadap URL preview dan, setelah cutover, terhadap produksi. Isinya:

- `/`, `/projects/<slug>` (langsung dibuka), dan path acak menjawab dan menampilkan konten yang benar.
- Kedua tautan ekspor CV (Google Docs, Indonesia dan Inggris) menjawab 200 bertipe PDF, dan teksnya lolos pemindaian nomor telepon dan kata kunci terlarang.
- `/cv` (dibuka langsung) memuat iframe pratinjau dari `docs.google.com` untuk kedua bahasa, tanpa diblokir CSP.
- `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, `/og-image.png` menjawab 200 dengan tipe yang benar.
- `www.alvinreihans.web.id` mengalihkan (308) ke `alvinreihans.web.id`, dan `http://` ke `https://`.
- Header keamanan dan `Cache-Control` sesuai `vercel.json`.
- Tidak ada error di console dan tidak ada request yang gagal di semua route.

## Kriteria penerimaan

- [ ] AC1. Push ke `react-rewrite` menghasilkan preview deployment yang berhasil build dengan preset Vite, tanpa mengubah deployment produksi di `main`.
- [ ] AC12. Push ke branch selain `main` dan `react-rewrite` tidak menjalankan build di Vercel (status dilewati), sedangkan CI GitHub Actions tetap berjalan di PR-nya.
- [ ] AC2. Membuka langsung `/projects/<slug>` dan path acak di preview dan di produksi tidak menghasilkan 404 dari platform.
- [ ] AC3. Berkas di `/assets/`, `robots.txt`, `sitemap.xml`, favicon, dan gambar OG disajikan sebagai berkas aslinya, bukan `index.html`.
- [ ] AC4. `alvinreihans.web.id` melayani situs, dan `www.alvinreihans.web.id` dialihkan permanen ke domain tanpa `www`.
- [ ] AC5. Header keamanan dan `Cache-Control` di `vercel.json` terpasang pada respons produksi.
- [ ] AC6. `sitemap.xml` memuat `/`, `/cv`, dan setiap project dari `meta.json`, dan `robots.txt` menunjuk ke sitemap itu.
- [ ] AC7. Halaman 404 memuat `noindex`.
- [ ] AC8. JavaScript awal (gzip) di bawah 170 KB.
- [ ] AC9. CI menjalankan lint, pengecekan tipe, `check-i18n`, dan build, dan gagal jika salah satunya gagal.
- [ ] AC10. Seluruh prasyarat cutover terpenuhi sebelum PR ke `main` di-merge, dan pemeriksaan asap lulus setelah deployment produksi.
- [ ] AC11. Rollback ke situs lama dapat dilakukan dalam hitungan menit (jalur Vercel atau jalur git sudah diverifikasi sebelum cutover).

## Di luar cakupan

- Penempatan aplikasi lain (misalnya Money Tracker di subdomain atau di `alvinreihans.web.id/app/...`) ditunda (lihat `06-project-stories.md`). Dua opsi tetap terbuka: subdomain (tambah domain di project Vercel lain dan satu CNAME di DomaiNesia) atau rewrite lewat `vercel.json` ini. Berkas ini dirancang agar mudah ditambah rewrite nanti.
- Analytics, render di server (SSR/prerender), dan CDN tambahan.

## Pertanyaan terbuka

## Keputusan

- Q5.1. Repo diganti namanya dari `alvinreihans.github.io` menjadi **`portfolio`**. Waktunya: **sekarang**, sebelum spec di-push, karena risikonya paling kecil saat belum ada PR dan sebelum cutover (lihat bagian Penggantian nama repo).
- Q5.2. CV lama di situs (`assets/docs/CV_..._BE.pdf`) dihapus dan tidak dialihkan; berkas itu hilang bersama situs lama saat cutover. CV di situs yang baru adalah tautan ke **dokumen Google Docs publik** (Indonesia dan Inggris), bukan berkas di repo, sehingga CV di situs ikut terbaru setiap kali dokumennya diperbarui (lihat `03-i18n.md` dan `04-pages.md`).
- Q5.3. Workflow GitHub Actions `ci.yml` (lint, tipe, `check-i18n`, build) di setiap PR disetujui.
- Q5.4. Content-Security-Policy ditambahkan **setelah scaffold**, dimulai dari mode `Content-Security-Policy-Report-Only`, karena skrip kecil untuk tema di `index.html` membutuhkan hash (atau nonce). CSP harus mengizinkan `frame-src https://docs.google.com` untuk pratinjau di halaman `/cv`.
- Q5.6. Rincian persiapan rilis (2026-11-01):
  - **CSP** dipasang sebagai `Content-Security-Policy-Report-Only` di `vercel.json`: `default-src 'self'`; `script-src 'self'` plus hash SHA-256 skrip tema di `index.html`; `style-src 'self'`; `img-src 'self' data:`; `font-src 'self' data:` (Vite menyisipkan file font yang sangat kecil ke CSS sebagai `data:`); `connect-src 'self'`; `frame-src https://docs.google.com`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`. Hash dihitung dari skrip dengan akhir baris LF (seperti yang dibangun Vercel), dan `scripts/check-csp.mjs` menggagalkan build bila skrip inline di `dist/index.html` tidak punya hash yang cocok. Tanpa `report-uri`: pelanggaran terlihat di console browser saat memeriksa preview. Setelah preview bersih, mode diganti menjadi `Content-Security-Policy` sebelum cutover.
  - **Sitemap** dibuat oleh `scripts/generate-sitemap.mjs` di langkah `prebuild` ke `public/sitemap.xml`, yang di-ignore git karena selalu dibuat ulang.
  - **Lisensi font**: teks OFL Jersey 10 dan Manrope disalin dari paket Fontsource ke `public/licenses/`, sehingga ikut dalam hasil build dan bisa dibuka di `/licenses/`.
- Q5.5. Vercel hanya membangun `main` dan `react-rewrite` (keputusan owner, untuk menghemat kuota build plan Hobby). Branch fitur diperiksa lewat CI dan pemeriksaan lokal sebelum merge.

## Penggantian nama repo

Dilakukan owner (bagian dari latihan git):

1. GitHub: repo, Settings, General, Repository name: ganti ke `portfolio`, lalu Rename.
2. Laptop: `git remote set-url origin https://github.com/alvinreihans/portfolio.git`, lalu `git remote -v` dan `git fetch` untuk memastikan tersambung.
3. Vercel: buka project, Settings, Git, pastikan repo terhubung tampil sebagai `alvinreihans/portfolio`, dan push berikutnya tetap memicu deployment. Nama project Vercel (`alvinreihansgithubio`) dan URL `*.vercel.app` tidak berubah.
4. Tidak ada perubahan DNS. GitHub otomatis mengalihkan URL repo lama.
5. Setelah itu nama `alvinreihans.github.io` bebas dan tidak dipakai lagi. Spec memakai nama `portfolio` untuk repo mulai dari sini.

## Pertanyaan terbuka

Tidak ada. Spec ini siap ditinjau untuk ditandai **Approved**. Tugas yang menyertainya: membuat dua salinan CV publik di Google Docs, memberikan ID dokumennya, dan mengganti nama repo.
