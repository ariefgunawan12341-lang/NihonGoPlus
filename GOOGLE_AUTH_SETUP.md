# Panduan Konfigurasi Google Login (Supabase)

Ikuti langkah-langkah di bawah ini untuk mengaktifkan fitur login Google di **NihonGoPlus**.

---

## 1. Persiapkan Callback URL
Callback URL adalah alamat yang akan dipanggil Google setelah user berhasil login. Formatnya adalah:
`https://[PROJECT-REF].supabase.co/auth/v1/callback`

> [!TIP]
> Cari **[PROJECT-REF]** Anda di Supabase Dashboard -> Project Settings -> API.

---

## 2. Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru atau pilih project yang sudah ada.
3. Buka **APIs & Services** -> **OAuth consent screen**.
    - Pilih **External**.
    - Isi nama aplikasi (**NihonGoPlus**) dan email support.
    - Tambahkan scope `.../auth/userinfo.email` dan `.../auth/userinfo.profile`.
4. Buka **Credentials** -> **Create Credentials** -> **OAuth client ID**.
    - **Application type**: Web application.
    - **Name**: NihonGoPlus Auth.
    - **Authorized JavaScript origins**: 
        - `http://localhost:5173` (Local dev)
        - `https://your-domain.com` (Vercel production)
    - **Authorized redirect URIs**: Masukkan Callback URL dari langkah #1.
5. Klik **Create**, lalu simpan **Client ID** dan **Client Secret**.

---

## 3. Supabase Dashboard
1. Buka project Anda di [Supabase Dashboard](https://supabase.com/dashboard).
2. Buka **Authentication** -> **Providers** -> **Google**.
3. Aktifkan (**Enable Google Provider**).
4. Masukkan **Client ID** dan **Client Secret** yang Anda dapatkan dari Google Cloud.
5. Klik **Save**.

---

## 4. Konfigurasi Environment (Vercel/Local)
Pastikan file `.env` (atau settings di Vercel) sudah berisi:

```env
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Masalah Umum (Troubleshooting)
- **"Unsupported provider"**: Provider Google belum diaktifkan di dashboard Supabase.
- **"Redirect URI mismatch"**: Callback URL di Google Cloud tidak sesuai dengan format Supabase.
- **"Sign-in cancelled"**: User menutup popup atau menolak akses.
