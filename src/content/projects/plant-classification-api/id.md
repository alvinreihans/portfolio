## Gambaran umum

API Flask yang menyajikan model klasifikasi gambar dari riset MBKM. Model ini mengenali bagian tumbuhan *Micromelum minutum* yang ada di sebuah foto: batang, daun, atau ranting.

## Cara kerja

```flow
Klien -> *Flask /predict -> Praproses (224x224, /255) -> Model Keras (HDF5) -> Label JSON
```

1. Klien mengirim foto JPG atau PNG ke `POST /predict` sebagai field `file`. Permintaan tanpa file dijawab dengan pesan error.
2. Foto disimpan sementara, diubah ukurannya menjadi 224x224, dan nilai pikselnya dibagi 255.
3. Model Keras (format HDF5), yang dimuat sekali saat aplikasi mulai, memprediksi gambar itu. Kelas dengan nilai tertinggi dikembalikan sebagai JSON.
4. File sementara dihapus setelah prediksi, jadi tidak ada gambar yang tersimpan.

## Deploy

Untuk produksi, aplikasi dijalankan dengan gunicorn di port 8080. README menyertakan panduan deploy ke Google Compute Engine: VM dengan IP statis, aturan firewall untuk port 8080, dan layanan systemd yang menjalankan gunicorn dengan tiga worker.
