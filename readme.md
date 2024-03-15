
# RnDiscussion

RnDiscussion adalah platform diskusi sederhana yang memungkinkan pengguna untuk membuat dan berpartisipasi dalam diskusi berbagai topik. Platform ini dibangun dengan menggunakan ExpressJS untuk sisi backend, Bootstrap untuk sisi frontend, dan MySQL sebagai basis data.

## Fitur

- Registrasi pengguna baru dan login.
- Membuat, mengedit, dan menghapus topik diskusi.
- Memberikan komentar dan balasan pada topik.
- Melihat semua topik diskusi yang tersedia.
- Fitur keamanan dengan menggunakan validasi login dan middleware.

## Instalasi

1. Pastikan Anda memiliki Node.js dan MySQL terinstal di komputer Anda.

2. Clone repositori ini ke direktori lokal Anda:

   ```bash
   git clone https://github.com/nama_pengguna/RnDiscussion.git
   ```

3. Masuk ke direktori proyek:

   ```bash
   cd RnDiscussion
   ```

4. Instal semua dependensi yang diperlukan dengan menjalankan perintah berikut:

   ```bash
   npm install
   ```

5. Buat file `.env` di dalam direktori proyek dan konfigurasikan variabel lingkungan berikut:

   ```plaintext
   PORT=3000
   SESSION_SECRET=secret-key
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_DATABASE=rndiscussion
   ```

   Pastikan untuk mengganti nilai sesuai dengan konfigurasi MySQL Anda.

6. Buatlah database MySQL dengan nama `rndiscussion` di MySQL Anda.

7. Jalankan migrasi database untuk membuat tabel yang diperlukan:

   ```bash
   npx prisma migrate dev
   ```

8. Setelah migrasi selesai, jalankan aplikasi dengan perintah:

   ```bash
   npm start
   ```

   Aplikasi akan berjalan di `http://localhost:3000` secara default.

## Penggunaan

1. Buka browser dan kunjungi `http://localhost:3000`.

2. Untuk pertama kali, Anda perlu membuat akun dengan mengklik tombol "Register" dan mengisi formulir pendaftaran.

3. Setelah mendaftar, Anda dapat masuk dengan akun yang telah Anda buat.

4. Anda akan diarahkan ke halaman beranda yang menampilkan semua topik diskusi yang tersedia.

5. Anda dapat membuat topik baru dengan mengklik tombol "Buat Topik" dan mengisi formulir yang tersedia.

6. Anda juga dapat memberikan komentar pada topik atau membalas komentar orang lain.

7. Selamat berdiskusi!
