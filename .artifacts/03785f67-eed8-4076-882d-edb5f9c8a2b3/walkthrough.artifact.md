# Walkthrough - Full Project Audit & Fix

Saya telah menyelesaikan audit menyeluruh dan perbaikan pada project NihongoPlus. Fokus utama adalah pada sinkronisasi database Supabase, perbaikan sistem Artikel, dan validasi Kupon.

## Bug yang Ditemukan & Diperbaiki

### 1. Sinkronisasi Artikel (Admin vs Website)
- **Masalah**: Artikel yang dibuat di Admin Panel tidak muncul di daftar artikel website.
- **Penyebab**:
    1. Tabel `articles` tidak memiliki policy RLS (Row Level Security) yang mengizinkan akses `SELECT` untuk publik (anon).
    2. File `schema.sql` sebelumnya sangat tidak lengkap, sehingga tabel-tabel penting tidak terkonfigurasi dengan benar di project Supabase baru.
- **Perbaikan**:
    - Memperbarui `schema.sql` dengan definisi tabel lengkap untuk `articles`, `comments`, dan `announcements`.
    - Menambahkan policy RLS eksplisit agar artikel dengan status `published` dapat dibaca oleh siapa saja.
    - Menambahkan logging pada `SupabaseCollection` untuk memantau trafik data.

### 2. Validasi Kupon (Invalid Coupon)
- **Masalah**: Kupon yang diubah di Admin Panel tetap dianggap tidak valid saat ditukarkan.
- **Penyebab**:
    1. Service `redeemCoupon` mencoba mengupdate kolom `is_premium` pada tabel `profiles`, padahal nama kolom yang benar di database adalah `premium`.
    2. Kurangnya policy RLS pada tabel `coupons` yang menghalangi pembacaan data oleh user biasa.
- **Perbaikan**:
    - Memperbaiki query update di `src/services/coupons.ts` agar menggunakan kolom `premium`.
    - Menambahkan skema tabel `coupons` lengkap dengan policy RLS ke dalam `schema.sql`.

### 3. Konsistensi Supabase Client
- **Perbaikan**: Memastikan seluruh operasi CRUD melalui satu instance `supabase` di `src/supabase/client.ts`. Menambahkan proteksi format key agar tidak tertukar dengan layanan lain (seperti Clerk).

## Ringkasan Perubahan

### Layanan & Core
- [MODIFY] `src/services/supabaseCollection.ts`: Menambah logging CRUD (Fetch, Create, Update, Delete) agar admin bisa melihat aktivitas database di console browser.
- [MODIFY] `src/services/coupons.ts`: Fix bug penamaan kolom `premium`.

### Database (SQL)
- [MODIFY] [schema.sql](file:///E:/NIHONGOPLUS UPDATE TERBARU/supabase/schema.sql): Skema sekarang mencakup seluruh fitur aplikasi (Articles, Coupons, Orders, Packages, Feedback, Announcements, dll) lengkap dengan policy RLS yang aman.

### Build & Production
- [RUN] `npm run build`: Berhasil dijalankan dengan **0 error**. Aplikasi siap untuk dideploy ulang ke Vercel.

---

## Langkah Manual Penting
> [!CAUTION]
> **Update Database**: Anda **WAJIB** menyalin seluruh isi dari [schema.sql](file:///E:/NIHONGOPLUS UPDATE TERBARU/supabase/schema.sql) dan menjalankannya di **Supabase SQL Editor** project Anda. Ini akan memperbaiki seluruh policy RLS yang sebelumnya menghambat data muncul di website.

render_diffs(file:///E:/NIHONGOPLUS UPDATE TERBARU/supabase/schema.sql)
render_diffs(file:///E:/NIHONGOPLUS UPDATE TERBARU/src/services/supabaseCollection.ts)
render_diffs(file:///E:/NIHONGOPLUS UPDATE TERBARU/src/services/coupons.ts)
