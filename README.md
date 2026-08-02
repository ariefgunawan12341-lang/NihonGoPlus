# NihonGoPlus

NihonGoPlus adalah Progressive Web App pembelajaran bahasa Jepang lengkap dengan konten JLPT, SSW, Kaigo Fukushishi, quiz interaktif, dashboard belajar, dan panel admin. Aplikasi ini dibangun dengan React, Vite, TypeScript, Tailwind CSS, dan Supabase sebagai backend.

## Teknologi
- Vite + React 19 + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage)
- PWA (service worker, manifest, installable)
- Cloudflare Pages untuk hosting
- Cloudflare Pages Functions untuk endpoint Kaiwa AI

## Install lokal
1. Clone repository:
   `ash
   git clone <repo-url>
   cd "e:\NIHONGOPLUS UPDATE TERBARU"
   `
2. Install dependencies:
   `ash
   npm install
   `
3. Buat file .env dari .env.example:
   `ash
   cp .env.example .env
   `
4. Isi environment variables yang diperlukan.

## Menjalankan development
`ash
npm run dev
`

Akses aplikasi di http://localhost:5173.

## Build production
`ash
npm run build
`

Build output akan berada di folder dist.

## Deploy ke Cloudflare Pages
1. Buat project baru di Cloudflare Pages.
2. Connect ke repository GitHub/GitLab.
3. Set build command:
   `ash
   npm run build
   `
4. Set output directory:
   `ash
   dist
   `
5. Tambahkan environment variables:
   - VITE_USE_SUPABASE=true
   - VITE_SUPABASE_URL (Supabase project URL)
   - VITE_SUPABASE_ANON_KEY (publishable anon key)
   - ANTHROPIC_API_KEY (server-side only, untuk Kaiwa AI)
   - SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY (opsional, hanya untuk script lokal 
pm run seed)
6. Set SPA routing dan fallback:
   - Pada Cloudflare Pages, aktifkan pengaturan "Route all requests to index.html" atau set route rewrite /* ke /index.html.
7. Custom domain:
   - Tambahkan 
ihongoplus.my.id di Cloudflare Pages > Custom domains.
   - Ikuti proses verifikasi DNS.
   - Pastikan SSL diaktifkan dan domain diarahkan ke Pages.

## Environment variables
### Wajib untuk runtime frontend
- VITE_USE_SUPABASE=true
- VITE_SUPABASE_URL=https://<project-ref>.supabase.co
- VITE_SUPABASE_ANON_KEY=sb_publishable_...

### Wajib untuk server-side Kaiwa AI di Cloudflare Pages Functions
- ANTHROPIC_API_KEY=...

### Local-only untuk seed/import Supabase
- SUPABASE_URL=https://<project-ref>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY=... atau SUPABASE_SECRET_KEY=...

> Catatan: Aplikasi ini menggunakan **Supabase** sebagai backend. Firebase tidak digunakan lagi.

## File penting untuk deploy
- index.html — entry point, manifest, dan iOS PWA meta tags.
- ite.config.ts — konfigurasi Vite + PWA.
- public/manifest.webmanifest — metadata aplikasi PWA.
- public/_redirects — fallback SPA untuk hosting lain.
- unctions/api/chat.ts — Cloudflare Pages Function untuk Kaiwa AI.
- .env.example — template environment variables.
- .gitignore — mengabaikan file sensitif dan build output.

## Audit khusus file
- ercel.json: file konfigurasi Vercel lama, tetap dipertahankan untuk kompatibilitas namun tidak diperlukan untuk Cloudflare Pages.
- public/_redirects: berguna untuk hosting Netlify/hosting lain yang mendukung file ini.
- public/manifest.webmanifest: menyediakan metadata icon dan PWA install.
- service worker: dibuat oleh ite-plugin-pwa saat build, menghasilkan dist/sw.js.
- package.json: scripts sudah memadai (dev, uild, preview, lint, seed).

## Keamanan
- Pastikan .env tidak dikomit.
- .gitignore telah mengabaikan .env*, dist, dan dist-ssr.
- VITE_ vars diperuntukkan frontend dan aman selama hanya berisi publishable keys.
- ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY, dan SUPABASE_SECRET_KEY bukan variabel frontend dan harus disimpan di environment Cloudflare Pages atau lokal saja.
