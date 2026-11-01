Teman Jalan adalah tongkat pintar berbasis IoT untuk penyandang tunanetra, dan backend-nya saya bangun sebagai skripsi. Tongkat mengirim data sensor dan GPS setiap 5 detik, jadi backend harus menerima aliran data yang terus-menerus tanpa tertinggal.

```flow
Tongkat IoT (tiap 5 detik) -> MQTT broker -> *Express API -> Redis (status terkini)
Express API -> MySQL (riwayat)
Express API -> FCM (notifikasi)
```

Data masuk lewat MQTT, divalidasi, lalu diproses: sesi perjalanan dicatat, jarak dihitung dengan rumus Haversine, dan bahaya seperti rintangan atau genangan air dideteksi. Status terkini disimpan di Redis agar cepat dibaca, riwayatnya di MySQL, dan keadaan darurat memicu notifikasi push lewat FCM ke pendamping. Backend berjalan di AWS EC2 dengan Amazon RDS.

Repo yang publik adalah versi demonstrasi; sebagian komponen dan konfigurasi internal sengaja tidak disertakan.
