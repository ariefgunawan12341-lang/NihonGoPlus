# Audit & Perbaikan Supabase Auth NihongoPlus

Ditemukan masalah kritis pada konfigurasi environment variable yang menyebabkan error `NetworkError` dan `CORS request failed`. Key yang digunakan saat ini adalah format **Clerk** (`sb_publishable_...`), bukan format **Supabase Anon Key** (`ey...`).

## User Review Required

> [!CAUTION]
> **Key Supabase Salah**: File `.env` Anda saat ini menggunakan key yang diawali dengan `sb_publishable_`. Ini adalah key untuk layanan **Clerk**, bukan **Supabase**. Supabase anon key harus diawali dengan `ey...`.
>
> Silakan buka [Supabase Dashboard](https://app.supabase.com/) -> Project Settings -> API, lalu salin **anon public** key yang benar ke `.env` Anda.

## Proposed Changes

### 1. Supabase Client (`src/supabase/client.ts`)
- [MODIFY] Menambahkan validasi format key untuk memberikan peringatan dini jika key yang digunakan salah (misal: format Clerk).
- [MODIFY] Meningkatkan logging saat inisialisasi gagal.

### 2. Auth Context (`src/contexts/AuthContext.tsx`)
- [VERIFY] Memastikan `signUp`, `signInWithPassword`, dan `signOut` sudah sesuai standar Supabase JS v2.
- [MODIFY] Menambahkan logging yang lebih detail pada setiap kegagalan fetch agar `error.status` dan `error.code` terlihat di console.

### 3. Environment Example (`.env.example`)
- [MODIFY] Memperbarui contoh value agar menunjukkan format JWT yang benar untuk Supabase (`ey...`).

---

## Verification Plan

### Automated Tests
- `npm run build`: Memastikan tidak ada error saat kompilasi.

### Manual Verification
1. **Console Check**: Lihat tab Console di browser. Jika muncul pesan `[NihonGoPlus] VITE_SUPABASE_ANON_KEY looks like a Clerk key`, berarti key harus diganti.
2. **Login/Register**: Pastikan setelah mengganti key, request tidak lagi menghasilkan `CORS failed` atau `NetworkError`.
3. **Vercel**: Pastikan variable di Vercel Dashboard sudah diperbarui dengan key yang benar.
