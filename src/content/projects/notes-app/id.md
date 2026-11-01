## Gambaran umum

Aplikasi catatan pribadi berbasis React (Create React App) yang di-hosting di GitHub Pages, berawal dari latihan kelas Dicoding.

## Fitur

- Menambah catatan dengan judul maksimal 50 karakter, lengkap dengan penghitung sisa karakter yang berjalan saat mengetik.
- Mencari catatan berdasarkan judul tanpa membedakan huruf besar dan kecil.
- Memisahkan catatan aktif dan arsip, memindahkan catatan di antara keduanya, dan menghapus catatan.
- Catatan disimpan di localStorage, jadi tetap ada setelah browser ditutup.
- Grid responsif satu, dua, atau empat kolom dengan tema gelap.

## Arsitektur

```flow
Form catatan (judul maks. 50) -> *NoteApp (state + pencarian) -> localStorage
```

Satu komponen, `NoteApp`, memegang daftar catatan dan kata pencarian. Komponen lain hanya menampilkan data dan menerima fungsi lewat props. Penyimpanan ke localStorage memakai custom hook, bukan kode `useEffect` yang ditulis manual.
