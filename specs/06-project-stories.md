# 06 - Project stories

Status: **Approved** (disetujui owner, 2026-10-31)

Spec ini menjabarkan F10 dan G3 dari `01-overview.md`: setiap project punya halaman detail berupa cerita yang ditulis dengan markdown.

## Tujuan

Owner bisa menulis dan merapikan cerita project tanpa menyentuh kode komponen, dalam dua bahasa, dengan gambar dan diagram yang ikut tema Day/Night.

## Struktur file

```
src/content/projects/
  money-tracker/
    meta.json
    en.md
    id.md
    images/
      ocr-flow.avif
      chat-screenshot.avif
  iot-monitoring/
    ...
```

Satu folder per project. Nama folder = `slug` di URL (`/projects/money-tracker`).

### `meta.json` (data bersama semua bahasa)

```json
{
  "slug": "money-tracker",
  "order": 1,
  "hero": true,
  "tags": ["Next.js", "Supabase", "Tesseract.js", "Groq", "Gemini"],
  "links": {
    "repo": "https://github.com/alvinreihans/money-tracker",
    "demo": "https://money-tracker-six-henna.vercel.app"
  },
  "title": { "en": "Money Tracker", "id": "Money Tracker" },
  "summary": {
    "en": "Log expenses by chatting, snapping a receipt, or filling a form.",
    "id": "Catat pengeluaran lewat chat, foto struk, atau form."
  }
}
```

Alasan: data yang sama di dua bahasa (tag, tautan, urutan) ditulis sekali, jadi tidak bisa berbeda antar bahasa. Judul dan ringkasan per bahasa ikut di sini, sehingga file markdown cukup berisi isi cerita tanpa frontmatter dan tidak perlu library untuk mem-parse-nya.

### `en.md` dan `id.md`

Isi cerita saja, tanpa frontmatter. Judul halaman diambil dari `meta.json`, jadi isi markdown dimulai dari `##`.

Bentuknya **cerita pendek yang mengalir**, bukan templat laporan. Tidak ada heading yang wajib. Owner bebas memilih heading (atau tidak memakai heading sama sekali) dan menulis dengan gayanya sendiri.

Alur yang disarankan sebagai pegangan, bukan aturan:

1. Latar belakang: kenapa project ini dibuat dan masalah apa yang ingin diselesaikan.
2. Perjalanan: apa saja yang terjadi selama mengerjakannya, termasuk jalan buntu, salah langkah, dan keputusan teknis beserta alasannya.
3. Hasil dan pelajaran: bagaimana akhirnya dan apa yang dipelajari.

Diagram (`flow`) dan gambar diletakkan di bagian cerita yang membutuhkannya.

### Kotak fakta di atas cerita

Karena cerita bersifat naratif, recruiter yang hanya membaca sekilas tetap harus mendapat gambaran cepat. Halaman detail menampilkan **kotak fakta** dari `meta.json` di atas cerita: judul, ringkasan satu kalimat, tag teknologi, dan tautan (repo, demo). Jadi pembaca bisa memilih: ambil faktanya saja, atau lanjut membaca ceritanya.

## Bahasa dan fallback

- Halaman memuat `<lang>.md` sesuai bahasa yang dipilih.
- Bahasa Indonesia adalah bahasa sumber dan fallback (lihat `03-i18n.md`). Jika file bahasa yang dipilih belum ada, tampilkan `id.md` dengan pemberitahuan kecil ("Translation not available yet" / "Terjemahan belum tersedia").
- `id.md` wajib ada untuk setiap project; `en.md` boleh menyusul.

## Gambar

- Disimpan di `images/` dalam folder project, dirujuk dengan path relatif: `![Alt text](./images/ocr-flow.avif)`.
- Format avif, lebar maksimum 1600px, target di bawah 200 KB per gambar.
- `alt` wajib diisi dan deskriptif.
- Dimuat dengan `loading="lazy"`, dan ukuran gambar (width/height) diketahui agar tidak terjadi layout shift.
- Base64 di dalam markdown tidak dipakai.

## Diagram arsitektur

Dibuat sebagai komponen React kecil bergaya pixel (seperti diagram di mockup), dirender dari code block markdown dengan bahasa `flow`:

````markdown
```flow
IoT device (every 5s) -> MQTT broker -> *Express API -> Redis (live state)
Express API -> MySQL (history)
Express API -> FCM (push)
```
````

Aturan sintaks:

- Satu baris = satu rantai node dipisah `->`.
- Teks dalam kurung = keterangan kecil di bawah nama node.
- Awalan `*` menandai node sorotan (warna aksen).
- Node dengan nama sama di baris berbeda dianggap node yang sama.

Alasan: ikut tema Day/Night dan bahasa, teksnya bisa dibaca screen reader, tidak perlu membuat ulang gambar tiap ganti warna, dan lebih ringan daripada Mermaid. Untuk diagram yang terlalu rumit untuk sintaks ini, gambar avif/svg tetap boleh dipakai.

Komponen diagram harus menyediakan teks alternatif ringkas (alur dibaca sebagai daftar, misalnya "IoT device, lalu MQTT broker, lalu Express API").

## Library (izin dari owner sudah ada; ditinjau lagi saat implementasi)

| Library            | Fungsi                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `react-markdown` | Merender markdown menjadi elemen React. Tidak merender HTML mentah secara default, jadi aman. |
| `remark-gfm`     | Tabel, daftar centang, dan strikethrough.                                                     |

Tidak ada library untuk frontmatter karena memang tidak dipakai. Konten dimuat dengan fitur bawaan Vite (`import.meta.glob`):

- File `.md` dimuat sebagai teks mentah dan hanya saat halaman project dibuka (code splitting).
- File di `images/` diubah menjadi URL; renderer `img` kustom memetakan path relatif di markdown ke URL tersebut.

## Kriteria penerimaan

- [ ] AC1. Menambah project baru cukup dengan menambah satu folder di `src/content/projects/` tanpa mengubah kode komponen.
- [ ] AC2. Kartu di section works dan halaman detail dibuat dari `meta.json` (urutan mengikuti `order`).
- [ ] AC3. Memilih bahasa Inggris memuat `en.md`; jika tidak ada, memuat `id.md` dengan pemberitahuan. Memilih bahasa Indonesia memuat `id.md`.
- [ ] AC4. Gambar relatif di markdown tampil, punya `alt`, lazy loading, dan tanpa layout shift.
- [ ] AC5. Code block `flow` dirender sebagai diagram yang mengikuti tema Day/Night dan bisa dibaca screen reader.
- [ ] AC6. HTML mentah di dalam markdown tidak dirender.
- [ ] AC7. Slug yang tidak ada menampilkan halaman 404.
- [ ] AC8. Halaman detail lulus kriteria aksesibilitas dan performa di `01-overview.md` (AC5 dan AC7 di sana).
- [ ] AC9. Halaman detail menampilkan kotak fakta (judul, ringkasan, tag, tautan) di atas cerita, dibuat dari `meta.json`.
- [ ] AC10. Markdown tanpa heading sama sekali tetap tampil rapi (tidak ada bagian kosong atau judul wajib yang hilang).

## Keputusan

- Q6.1. Cerita ditulis sebagai cerita pendek yang mengalir (latar belakang, perjalanan, hasil), tanpa heading wajib. Untuk pembaca yang terburu-buru, kotak fakta dari `meta.json` ditampilkan di atas cerita.

## Pertanyaan terbuka

- Q6.2. **Ditunda.** Tautan "demo" memakai URL Vercel apa adanya (`money-tracker-six-henna.vercel.app`) sampai owner memutuskan soal domain pribadi untuk beberapa aplikasi. Penempatan di `alvinreihans.web.id/app/...` atau subdomain belum diputuskan dan tidak menghalangi implementasi spec ini.
