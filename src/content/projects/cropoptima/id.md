## Gambaran umum

CropOptima adalah capstone Bangkit Academy 2023 yang dikerjakan tim tujuh orang dari tiga jalur: Machine Learning, Cloud Computing, dan Mobile Development. Aplikasinya menyarankan satu dari 22 tanaman berdasarkan kandungan tanah (nitrogen, fosfor, kalium, dan pH) serta lokasi pengguna. Saya berada di jalur Cloud Computing dan menulis seluruh kode backend cloud-nya.

## Arsitektur

```flow
Klien -> *API utama (App Engine) -> Firebase Auth (cek idToken)
API utama -> API model (Docker) -> OpenWeatherMap (suhu, kelembapan)
API utama -> Cloud SQL (riwayat)
API model -> LightGBM (22 tanaman)
```

Backend-nya terdiri dari dua layanan Flask yang sengaja dipisah: satu sebagai gerbang, satu khusus untuk model.

- **API utama di Google App Engine** menjadi pintu masuk publik. Layanan ini memverifikasi idToken Firebase lewat REST API Identity Toolkit, meneruskan permintaan ke API model, lalu menyimpan riwayat prediksi ke Cloud SQL (MySQL) lewat unix socket `/cloudsql` dengan query berparameter. Pengguna yang sudah masuk bisa membaca kembali riwayatnya.
- **API model dalam container Docker** mengambil suhu, kelembapan, dan nama kota dari OpenWeatherMap berdasarkan koordinat, menambahkan curah hujan dari tabel bulanan, lalu menjalankan model LightGBM buatan tim Machine Learning. Hasilnya dilengkapi deskripsi tanaman dalam bahasa Indonesia dan gambar dari Cloud Storage.

Kedua layanan menjawab dengan format respons yang seragam, dan konfigurasi database diambil dari variabel lingkungan.

## Model

Tim Machine Learning membandingkan empat model dan memilih LightGBM dengan akurasi 98,9%, dibandingkan Decision Tree (98,4%), Logistic Regression (94,5%), dan jaringan saraf Keras (96,0%).
