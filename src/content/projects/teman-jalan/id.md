## Gambaran umum

Teman Jalan adalah tongkat pintar berbasis IoT untuk penyandang tunanetra, dibuat untuk skripsi oleh tim tiga orang: aplikasi mobile, firmware tongkat, dan backend. Bagian saya adalah backend: menerima data dari tongkat, mencatat perjalanan, dan mengabari pendamping (keluarga atau perawat) lewat aplikasi mereka.

Repo yang publik adalah versi demonstrasi; sebagian komponen dan konfigurasi internal sengaja tidak disertakan.

## Arsitektur

```flow
Tongkat pintar (sensor + GPS) -> MQTT broker -> *Backend Express -> Redis (sesi live)
Backend Express -> MySQL (riwayat)
Backend Express -> FCM + Socket.IO (darurat, status) -> Aplikasi pendamping
```

Satu proses Node.js menjalankan REST API Express dan penerima MQTT sekaligus. Kodenya dikelompokkan per fitur (auth, stick, user), masing-masing dengan lapisan route, handler, service, dan validator. Redis menyimpan keadaan yang sedang berjalan dan data berumur pendek, sedangkan MySQL menjadi catatan permanen.

## Dari tongkat ke backend

Tongkat mengirim empat jenis pesan MQTT: data sensor, status (online atau offline), darurat, dan baterai. ID tongkat dibaca dari topiknya.

- **Data sensor** disimpan di MySQL dan diberi penanda bahaya dengan aturan ambang: "halangan" bila jarak ultrasonik di bawah 50, "genangan" bila sensor air mendeteksi air. Titik GPS (0,0) dibuang.
- **Darurat** memicu notifikasi push lewat FCM ke semua perangkat milik semua pendamping yang memantau tongkat itu, dicari dengan satu join SQL antara daftar pantauan dan token perangkat. Menyalakan atau mematikan tongkat juga mengirim notifikasi.
- **Komunikasi dua arah:** pendamping menjawab SOS dengan "jemput" atau "tolak" dari aplikasi, lalu backend meneruskannya ke tongkat lewat topik MQTT `callback`.

## Sesi perjalanan

```flow
Tongkat online -> *Sesi di Redis (jarak, bahaya, waktu) -> Tongkat offline -> MySQL (sesi)
```

Selama perjalanan, setiap titik GPS hanya memicu operasi Redis yang ringan: jarak ditambah dengan rumus Haversine yang ditulis sendiri, sedangkan jumlah halangan, genangan, dan waktu aktif dinaikkan. Saat tongkat offline, totalnya ditulis ke MySQL sekali, lalu kunci Redis dibersihkan.

Endpoint riwayat menggabungkan keduanya: total hari ini dari MySQL ditambah sesi yang masih berjalan di Redis, jadi angkanya tetap terkini di tengah perjalanan.

## Untuk aplikasi pendamping

- Status tongkat secara live lewat Socket.IO, dengan JWT saat handshake.
- Status terkini, riwayat hari ini, statistik jarak per hari dalam rentang tanggal, dan rute satu sesi lengkap dengan penanda bahaya.
- Daftar pantauan per pendamping dan 25 notifikasi terbaru.
- Autentikasi: password di-hash dengan bcrypt, access token JWT 1 hari, dan refresh token 7 hari yang disimpan di database sehingga bisa dicabut saat logout. Reset password memakai OTP lewat email yang disimpan di Redis selama 10 menit dan dibatasi 5 percobaan per 10 menit. Input divalidasi dengan Joi.
- Foto profil dipotong menjadi JPEG 500x500 dengan Sharp.
