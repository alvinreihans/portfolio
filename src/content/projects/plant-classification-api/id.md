Dalam riset MBKM dan magang di Gita Persada Butterfly Park, saya menerapkan ilmu cloud dari Bangkit untuk menyajikan model machine learning klasifikasi tanaman. Model CNN (disimpan dalam format HDF5) dibungkus RESTful API berbasis Flask: kirim foto tanaman ke endpoint `/predict`, dan API mengembalikan hasil klasifikasinya.

```flow
Foto tanaman -> *Flask API (/predict) -> Model CNN (HDF5) -> Hasil klasifikasi
Flask API -> Cloud SQL
Flask API -> Cloud Storage (gambar)
```

API di-deploy di Google Compute Engine, dengan Cloud SQL sebagai basis data utama dan Cloud Storage untuk media. Hasil risetnya terbit di tiga publikasi, yang daftarnya ada di profil ORCID saya.
