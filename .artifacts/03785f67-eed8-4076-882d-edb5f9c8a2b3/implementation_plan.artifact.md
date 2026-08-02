# Implementation Plan - Full Project Audit & Fix

Layanan Supabase pada project NihongoPlus akan diperbaiki secara menyeluruh, mencakup sinkronisasi database, perbaikan bug CRUD pada Artikel dan Kupon, serta pembersihan sisa-sisa konfigurasi lama.

## User Review Required

> [!IMPORTANT]
> **Database Sync**: Saya telah menemukan bahwa file `schema.sql` yang ada saat ini sangat tidak lengkap (hanya berisi `profiles` dan `vocabulary`). Hal ini menyebabkan fitur lain seperti Artikel dan Kupon tidak sinkron jika RLS (Row Level Security) tidak diatur dengan benar di project baru.
> **Langkah Manual**: Setelah saya memperbarui file `schema.sql`, Anda **WAJIB** menjalankan seluruh isi file tersebut di **Supabase SQL Editor** untuk memastikan semua tabel dan policy tersedia.

## Proposed Changes

### 1. Supabase Client & Collections
- [MODIFY] `src/services/supabaseCollection.ts`:
    - Menambahkan `console.log` dan `console.error` pada setiap operasi CRUD untuk tracking real-time.
    - Memperbaiki penanganan `id` agar konsisten.
- [MODIFY] `src/supabase/client.ts`:
    - Memastikan inisialisasi hanya menggunakan environment variable Vite.

### 2. Artikel & CMS
- [MODIFY] `src/pages/ArticleList.tsx` & `src/pages/ArticleDetail.tsx`:
    - Menambahkan logging untuk mendeteksi jika data kosong karena RLS atau memang tidak ada di DB.
- [MODIFY] `supabase/schema.sql`:
    - Menambahkan skema lengkap untuk tabel `articles`, `comments`, `announcements`.
    - Menambahkan policy RLS agar artikel `published` dapat dibaca oleh publik (anon).

### 3. Sistem Kupon
- [MODIFY] `src/services/coupons.ts`:
    - **BUG FIX**: Mengubah field `is_premium` menjadi `premium` agar sesuai dengan skema database `profiles`.
- [MODIFY] `supabase/schema.sql`:
    - Menambahkan skema tabel `coupons`.
    - Menambahkan policy RLS agar kupon dapat diperiksa oleh user yang login.

### 4. Admin & Auth
- [MODIFY] `src/services/adminUsers.ts`:
    - Memastikan update role dan status user menggunakan kolom yang benar (`premium`, bukan `is_premium`).
- [MODIFY] `supabase/schema.sql`:
    - Menambahkan skema tabel `premium_packages` dan `premium_orders`.

---

## Verification Plan

### Automated Tests
- `npm run build`: Memastikan aplikasi siap deploy ke Vercel tanpa error TypeScript/Lint.

### Manual Verification
1. **Cek Console**: Saat membuka halaman Artikel, pastikan log menunjukkan jumlah baris yang ditarik dari Supabase.
2. **Redeem Kupon**: Coba gunakan kupon dari website, pastikan status `premium` di tabel `profiles` berubah menjadi `true`.
3. **Admin Artikel**: Buat artikel di Admin Panel, lalu refresh halaman Artikel di website.
