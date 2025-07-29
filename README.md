# Hafiportrait

Aplikasi pengelolaan foto acara dengan fitur galeri online dan pesan ucapan tamu.

## Konfigurasi Supabase Storage

Aplikasi ini menggunakan Supabase Storage untuk penyimpanan file. Untuk mengkonfigurasinya:

1. Buat akun di [Supabase](https://supabase.com/)
2. Buat proyek baru di dashboard Supabase
3. Catat URL dan API Key proyek Anda
4. Buat file `.env` di root proyek dengan isi:

```
# Database configuration
DATABASE_URL=postgres://username:password@host:port/database

# Supabase configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

5. Ganti nilai `SUPABASE_URL` dan `SUPABASE_KEY` dengan URL dan API Key dari proyek Supabase Anda

## Cara Menjalankan

```bash
# Instal dependensi
npm install

# Jalankan dalam mode development
npm run dev

# Build untuk production
npm run build

# Jalankan dalam mode production
npm start
```

## Struktur Bucket Supabase

Aplikasi ini menggunakan bucket `photos` di Supabase Storage untuk menyimpan foto-foto yang diunggah. 
Struktur penyimpanannya adalah sebagai berikut:

```
photos/
  └── {event_id}/
      ├── file1.jpg
      ├── file2.png
      └── ...
```

Setiap foto akan disimpan dalam subfolder berdasarkan ID acara, sehingga memudahkan pengelolaan dan penghapusan. 