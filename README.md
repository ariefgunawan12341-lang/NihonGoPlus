# NihonGoPlus

A Progressive Web App for learning Japanese — Hiragana, Katakana, Kanji,
Grammar, JLPT N5–N1 (Kotoba/Kanji/Grammar/Dokkai/Choukai/Exam), spaced-
repetition Flashcards, an AI conversation partner (Kaiwa AI), SSW industry
vocabulary, Kaigo Fukushishi exam prep, and a full Admin Panel — built with
React 19, Vite, TypeScript, Tailwind CSS, and Supabase.

## Backend migration: Firebase → Supabase

The backend is now **Supabase** (Postgres + Auth + Storage) — Firebase is
completely removed from this codebase (no SDK, no Firestore, no Cloud
Functions, no FCM). What changed and what didn't:

- **Every learner/admin page keeps working unchanged.** The app was built
  with a data-access abstraction (`src/services/db.ts`) from day one
  specifically so a backend swap wouldn't require touching dozens of pages —
  `vocabCollection.list()` and friends now hit Postgres instead of
  Firestore, but the call sites never needed to know that.
- **Real security, not just hidden UI.** `supabase/schema.sql` enforces the
  public/free/premium access system via Row Level Security — a guest calling
  the Supabase API directly still can't read premium rows. This is stronger
  than what the Firestore rules version had for content tables.
- **Admin role via a plain column + RLS check**, not custom claims — this is
  actually *simpler* than the Firebase version was (no Cloud Function needed
  just to promote someone to admin).
- **What I can't verify from here**: I don't have network access to actually
  run `supabase/schema.sql` against a live project or exercise a real
  sign-up/login round-trip. I've verified everything compiles and every
  import resolves (see the checks below), but the first real Supabase
  connection test is yours to run.
- **Genuinely removed, not silently dropped**: Firebase Cloud Messaging
  (push notifications) had no direct Supabase equivalent I could wire up
  honestly in this pass — removed rather than faked. Real push would need a
  separate provider (Web Push API + a service worker, or OneSignal) — a
  legitimate follow-up, not something this migration includes.

## Honest status: what's real vs. what scales via the Admin Panel

Every module listed above is a **real, working page** — there are no "Coming
soon" placeholders anywhere in this build. But there's a difference between
"the feature works" and "the content library is exhaustive," so here's the
straight breakdown:

**Fully working, end-to-end, for every level/module:**
- Auth (sign up/in/out), protected + admin-only routes
- Hiragana & Katakana: full 46-character sets, learning grid, quiz
- Kotoba (Vocabulary), Kanji, Grammar — all filterable by JLPT level, all
  reading from Supabase via server-side-filtered queries (not hardcoded)
- JLPT N5–N1: one dynamic `/jlpt/:level` page per level with Kotoba / Kanji /
  Grammar / Dokkai (reading) / Choukai (listening, via real text-to-speech) /
  Exam / Progress tabs — the *code path* is identical for every level
- Exam Center: timed, scored, section-by-section or full simulation exams,
  with per-question review and per-user attempt history
- Flashcards: real SM-2 spaced-repetition scheduling, per level
- Kaiwa AI: a real chat UI backed by a real Anthropic API call (server-side,
  via a Vercel serverless function — see "Kaiwa AI setup" below)
- SSW: all 14 official industry categories, vocabulary browsing per industry
- Kaigo Fukushishi: topic-tabbed content (Vocabulary, Medical Terms, Care
  Knowledge, Ethics, Law, etc.)
- Admin Panel: full CRUD for Vocabulary, Kanji, Grammar, Modules/Lessons,
  SSW, Kaigo Fukushishi, Questions/Exams (all 5 JLPT levels, all question
  categories including Choukai), and Users (admin/premium role toggles)

**What's seeded vs. what you'll want to grow:**
This build ships with a real, correct, but intentionally modest seed set —
enough to fully exercise every module (N5/N4 vocab and exam questions, N5
kanji and grammar, a few SSW/Kaigo terms). I did not hand-author thousands of
individually verified JLPT questions across five levels for this build,
because doing that quickly is how "thousands of questions" quietly turns
into wrong or nonsensical questions. What I *did* build is the part that
makes reaching that scale realistic:

- Postgres collections with `listFiltered()` queries (level, category,
  kind) instead of loading full collections into the browser — this is what
  makes "thousands of lessons and questions" performant rather than just
  theoretically supported
- Admin CRUD across every content type, so populating N3/N2/N1 (or bulk-
  importing from a spreadsheet/CSV via a script that calls the same
  Postgres collections) doesn't require touching code
- The exact data shape for every collection is documented below — a bulk
  import script is a loop over that shape, not a data-modeling exercise

## Production upgrade: what's new in this round

- **Bulk Import** (`/admin/import`): real JSON/CSV upload for Vocabulary, Kanji, Grammar, and Exam Questions, with required-field validation, duplicate detection against existing data, a full preview table, and a confirm-to-import step. This is the fastest real path to populating thousands of entries — see "Data structure" above for the exact shape, or use the in-page example-row reference for each content type.
- **Download Module system**: Admin CRUD at `/admin/download-modules`, learner page at `/downloads`, fully gated behind Premium via a reusable `PremiumGate` component.
- **Premium tiers, for real**: `/premium` toggles `isPremium` (demo, no payment processor — see the warning on that page); free users get a 5-item preview on SSW/Kaigo Fukushishi content and a 3-exams-per-day cap in the Exam Center, both with an in-context upgrade prompt.
- **Admin role**: originally implemented via Firebase custom claims + a Cloud Function; **superseded by the Supabase migration** below — admin is now a plain `role`/`is_admin` column checked directly by Postgres RLS (`public.is_admin()`), which is simpler and needs no separate function deploy.
- **Gamification**: a real per-user progress record tracks daily activity (flashcards reviewed, quizzes/exams completed) and total completed lessons; 9 achievements unlock based on real stats (shown on Profile); a Leaderboard (`/leaderboard`) ranks all users by XP — this requires any signed-in user to be able to read other users' basic profile fields, which the RLS policy in `supabase/schema.sql` allows for authenticated users. For stricter privacy, split public fields into a separate `leaderboard` table instead.
- **Dark mode**: actually functional (CSS-variable-driven, not just a UI toggle with no effect), persisted to `localStorage`.
- **Profile upgrades**: real photo upload (Supabase Storage only — shows a clear error in local mode), password change (verifies current password via Supabase sign-in, then `updateUser()`, or local-mode password hash update), and a language preference field (stored on the profile; **not yet wired to actual UI translation** — that's a real i18n project of its own, flagged here rather than faked).
- **Notifications**: real browser Notification permission request + an in-app streak-risk reminder (`src/utils/notifications.ts`). True background push (Firebase Cloud Messaging scaffold from an earlier version) was **removed** during the Supabase migration rather than left broken — see the migration notes at the top of this README for what a real replacement would need.
- **Kaiwa AI upgrade**: 7 practice modes (Beginner/Intermediate/Advanced/JLPT Practice/Job Interview/SSW Interview/Kaigo Interview) × 8 scenarios, per-turn grammar correction, and an end-of-session AI-scored conversation summary — still 100% server-side via `api/chat.ts`, API key never exposed to the client.

## Database content: apa yang nyata diisi (dan apa yang belum)

`seed-data/` berisi 22 file JSON siap-impor sesuai format yang diminta. Setiap
entri adalah kosakata/kanji/grammar/soal **yang benar dan nyata** — bukan
placeholder — tapi jumlahnya jauh di bawah target awal (800/1500/3000/6000/
10000 dst.), karena mengarang ribuan entri dengan akurasi terjamin bukan hal
yang bisa dilakukan jujur dalam satu sesi. Ini rekap jujurnya:

| Konten | N5 | N4 | N3 | N2 | N1 | Target awal |
|---|---|---|---|---|---|---|
| Vocabulary | 100 | 50 | 20 | 15 | 15 | 800/1500/3000/6000/10000 |
| Kanji | 109 | 50 | 15 | 10 | 10 | (daftar lengkap JLPT) |
| Grammar (pola × 5 contoh) | 10 | 6 | 3 | 3 | 3 | (semua pola JLPT) |
| Exam questions | 30 | 15 | 10 | 10 | 10 | 500/level |
| SSW | 31 istilah, 14 bidang tercakup | — | — | — | — | materi+kosakata+percakapan+latihan+soal per bidang |
| Kaigo Fukushishi | 23 istilah, 10 topik | — | — | — | — | istilah medis+percakapan+etika+prosedur+latihan+soal |

Catatan akurasi: N5 dan N4 memakai daftar kanji/kosakata yang umum dan
mapan (confidence tinggi). Untuk N3–N1, tidak ada satu daftar kanji/kosakata
JLPT resmi pasca-2010 yang dipublikasikan — batas level antar sumber bisa
berbeda, jadi anggap level di N3–N1 sebagai perkiraan yang wajar, bukan
otoritatif 100%. SSW dan Kaigo Fukushishi baru mencakup kosakata inti;
percakapan, latihan interaktif, dan bank soal khusus per bidang belum dibuat.

**Untuk mencapai target volume asli**, cara paling realistis: impor dataset
JLPT terbuka yang sudah divalidasi komunitas (mis. daftar kosakata/kanji dari
Tanos.co.uk, atau dataset seperti "jlpt-vocab-api" di GitHub) melalui halaman
**Bulk Import** (`/admin/import`) yang sudah ada, atau lewat
`scripts/importSupabase.ts` di bawah ini setelah dikonversi ke format yang
sama dengan contoh di `seed-data/`.

### Menjalankan seeder

```bash
npm install
# 1. Buka Supabase Dashboard → Project Settings → API
# 2. Salin "Project URL" dan "service_role" key (BUKAN anon key) ke .env
#    sebagai SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY
npm run seed
```

Script ini membaca semua file di `seed-data/` dan menulisnya ke Postgres
memakai bentuk kolom yang sesuai `supabase/schema.sql` — tidak ada perubahan
UI, routing, atau skema. Aman dijalankan berkali-kali (upsert berdasarkan
`id`, jadi re-run menimpa baris yang sama, bukan menduplikasi).

Alternatif: upload manual tiap file lewat halaman **Bulk Import** di Admin
Panel (`/admin/import`) — mendukung `.json` langsung tanpa perlu service role
key, cukup login sebagai admin di aplikasi.

Mode lokal (tanpa Supabase) sudah punya seed kecil sendiri (`src/data/*.ts`,
auto-load saat pertama kali buka app) yang terpisah dari `seed-data/` — ID-nya
memakai prefix berbeda (`n5-xxx` vs `n5b-xxx`) supaya tidak bentrok kalau
suatu saat mode Supabase diaktifkan lalu di-seed dari kedua sumber.

## CMS & Guest Access upgrade (terbaru)

- **Guest access nyata**: buka aplikasi langsung ke Home tanpa login. Guest bisa browsing Hiragana/Katakana, Vocabulary, Kanji, Grammar, JLPT N5–N1, Exam Center, SSW, Kaigo, dan Artikel. Fitur personal (Flashcards, Kaiwa AI, Profile, Settings, Leaderboard) tetap perlu akun.
- **3 tingkat akses per-item**: `public` / `free` / `premium` di setiap Vocabulary, Kanji, Grammar, SSW, Kaigo, dan Artikel — item yang di-lock menampilkan pesan akses (bukan seluruh halaman diblokir), persis seperti dicontohkan ("Vocabulary dasar: public, Grammar latihan: free, SSW Modul: premium").
- **Article CMS ala Blogger**: judul/slug otomatis/thumbnail/isi (rich text Tiptap)/kategori/tag/SEO title & description/status draft-published-scheduled-archived, plus komentar (guest baca, user login bisa komentar, admin moderasi).
- **Rich Text Editor nyata (Tiptap)**: bold/italic/underline/heading/list/quote/code/link/upload gambar (ke Supabase Storage)/embed YouTube/undo-redo — dipakai di CMS Artikel.
- **Media Library**: browse/cari/preview/hapus semua file di 5 bucket Supabase Storage (images/audio/video/pdf/modules) dari Admin Panel.
- **Site Settings**: nama situs, logo, favicon, banner, kontak, sosial media, SEO default, dan konfigurasi SMTP (host/port/username — sengaja tidak ada field password, lihat catatan di halaman Settings).
- **Premium Packages**: CRUD paket (bulanan/tahunan/lifetime + harga + benefit), tampil dinamis di halaman `/premium`.
- **Announcements & Comments**: banner pengumuman aktif tampil ke semua pengguna (termasuk guest); moderasi komentar dari Admin Panel.
- **Analytics ringan tapi nyata**: pageview di-log otomatis di setiap perpindahan halaman, ditampilkan sebagai grafik batang 7 hari + halaman terpopuler di Admin.

### Yang belum sepenuhnya hidup (jujur, bukan disembunyikan)

- **SMTP/email sungguhan**: field konfigurasi sudah tersimpan, tapi pengiriman email nyata butuh Cloud Function terpisah yang membaca config ini server-side — belum dibuat.
- **User suspend/ban/reset-password dari Admin**: Admin Panel saat ini masih sebatas toggle admin/premium; suspend/ban dan reset password paksa butuh Supabase Admin API (service role key, server-side only), belum diimplementasikan.
- **Analytics kelas Google Analytics**: yang ada adalah hitungan pageview asli dari tabel `pageviews` di Postgres, bukan pelacakan sumber trafik/perangkat/dsb. Hubungkan Google Analytics ID di Settings untuk analitik lengkap.
- Access-gating per-item baru diterapkan di Vocabulary, Kanji/Grammar/SSW/Kaigo, dan Artikel — belum di Exam Questions individual (Exam Center masih pakai gating level-halaman: limit 3 ujian/hari untuk free).

## Update: Auth lengkap, AI Sensei, SEO, dan halaman publik

- **Google Sign-In** nyata via Supabase OAuth — tombol di halaman Login & Signup, auto-membuat profil dari data akun Google saat pertama kali masuk. Perlu diaktifkan dulu di Supabase Dashboard → Authentication → Providers → Google.
- **Arif Boncel Sensei** — rebrand dari "Kaiwa AI", ditambah mode "Tanya Sensei Bebas" untuk koreksi kalimat/terjemahan/penjelasan grammar tanpa perlu pilih skenario roleplay.
- **Footer, About, Contact** — halaman baru, guest-accessible. Link media sosial (Instagram/YouTube/TikTok/Facebook/Telegram — tanpa WhatsApp) diambil dari Admin Settings dengan fallback ke handle default; admin bisa ubah kapan saja tanpa sentuh kode.
- **SEO**: meta description, Open Graph, Twitter Card, dan schema.org (`EducationalOrganization`) di `index.html`; `sitemap.xml` statis untuk semua route publik; `robots.txt` diperbarui untuk exclude `/admin`. **Ganti domain placeholder** `nihongoplus.example.com` di `index.html`, `public/sitemap.xml`, dan `public/robots.txt` dengan domain asli setelah deploy.
- **Toast notification system** — nyata, dipasang di beberapa aksi Admin (simpan Settings, konfirmasi/tolak pembayaran).
- **Perlindungan XSS**: `dompurify` men-sanitasi HTML artikel sebelum dirender — lapisan pertahanan tambahan meski penulisan artikel sudah dibatasi admin-only lewat RLS.
- **Sistem Pembayaran Premium (QRIS/DANA)**: user pilih paket, bayar via QRIS/DANA yang dikonfigurasi admin, upload bukti transfer, admin verifikasi manual di `/admin/premium-orders` — akun otomatis jadi Premium begitu dikonfirmasi. Ini verifikasi manual, bukan payment gateway otomatis (tidak ada kredensial Midtrans/Xendit/API DANA resmi yang diberikan).

### Belum sempat dikerjakan di round ini (jujur, bukan disembunyikan)

- Tipe soal **essay** di Exam Center (saat ini semua soal pilihan ganda)
- Kategori "Blog / Catatan Jepang / Tips Hidup di Jepang / Budaya Jepang" — rencananya jadi kategori di dalam sistem Artikel yang sudah ada (bukan sistem CMS terpisah), tapi belum diisi kontennya
- Loading skeleton (saat ini masih teks "Memuat…")
- Grafik/statistik harian tambahan di Admin Dashboard (Analytics dasar sudah ada di `/admin/analytics`)
- Anti-spam server-side untuk komentar (saat ini hanya dibatasi RLS — siapa pun yang login bisa komentar tanpa rate limit)

## Tech stack

React 19 · Vite · TypeScript · Tailwind CSS · React Router · Supabase
(Auth/PostgreSQL/Storage/Realtime) · vite-plugin-pwa · Anthropic API (Kaiwa
AI, via a Vercel serverless function)

## Getting started

```bash
npm install
npm run dev
```

Runs immediately with **zero configuration** — a local (localStorage-backed)
data layer mirrors the Supabase API exactly, seeded with real N5/N4
vocabulary, N5 kanji/grammar, and exam questions on first load. The first
account you create becomes an admin automatically in local mode.

## Connecting real Supabase

1. Create a project at https://supabase.com/dashboard
2. Open the **SQL Editor** and run `supabase/schema.sql` — this creates every
   table, Row Level Security policy, and Storage bucket the app needs in one
   pass. It's safe to re-run (uses `IF NOT EXISTS`/`CREATE OR REPLACE`
   throughout).
3. `cp .env.example .env` and fill in your project's URL and anon key
   (Project Settings → API in the Supabase dashboard)
4. Set `VITE_USE_SUPABASE=true` in `.env`
5. Restart the dev server. Sign-ups now go through Supabase Auth and write to
   Postgres.
6. Create your admin account: sign up normally through `/signup` with the
   email/password you want, then run `supabase/bootstrap_admin.sql` in the
   SQL Editor (edit the email in that file first) to promote it to
   `super_admin`. **No password is ever stored in this codebase** — Supabase
   Auth owns that entirely, this script only flips a role column.

With Supabase enabled, the first-signup-becomes-admin convenience is
disabled (local-mode only) — that's intentional, so a real deployment never
auto-grants admin to a stranger's signup.

### Why Row Level Security matters here

`supabase/schema.sql` doesn't just create tables — it enforces the
public/free/premium access system **at the database level** via
`public.can_access(access_type)`, checked in every content table's SELECT
policy. This means a guest calling the Supabase REST API directly (bypassing
the app entirely) still cannot read premium rows — the three-tier system
isn't just UI polish, it's real security. Admin writes are gated by
`public.is_admin()`, and per-user tables (`srs_cards`, `exam_attempts`,
`kaiwa_sessions`, `progress`) are restricted to `auth.uid() = user_id`.

### Data structure (for bulk import / scaling to thousands of entries)

| Table | Shape | Notes |
|---|---|---|
| `vocabulary` | `VocabWord` (`src/types/index.ts`) | Filtered by `level` |
| `questions` | `ExamQuestion` (`src/types/index.ts`) | Filtered by `level` + `category` (`moji`\|`goi`\|`bunpou`\|`dokkai`\|`choukai`) |
| `content_items` | `ContentItem` (`src/types/content.ts`) | Filtered by `kind` (`kanji`\|`grammar`\|`module`\|`ssw`\|`kaigo`) + `level` or `category` |
| `srs_cards` / `exam_attempts` / `kaiwa_sessions` / `progress` | per-user tables | Flat table + `user_id` column, RLS-restricted (Postgres has no Firestore-style subcollections) |

Columns are snake_case (Postgres convention) — `src/services/caseConvert.ts`
converts to/from the app's existing camelCase TypeScript types automatically,
so no frontend code needed to change for the migration. A bulk-import script
is just: read your source data (CSV/JSON), map each row to the matching
table's columns, and `upsert` it — see `scripts/importSupabase.ts`, which
already does exactly this for everything in `seed-data/`.

## Kaiwa AI setup

Kaiwa AI calls `api/chat.ts`, a Vercel Edge Function that proxies to the
Anthropic API. The API key is **server-side only** — it is never bundled
into client JS. This part is unaffected by the Supabase migration.

1. Get an API key from https://console.anthropic.com
2. In your Vercel project, add an environment variable `ANTHROPIC_API_KEY`
   (do **not** prefix it with `VITE_`)
3. Deploy — `/api/chat` is picked up automatically by Vercel

**Local development:** plain `vite dev` does not run serverless functions.
Use the Vercel CLI instead:

```bash
npm install -g vercel
vercel link       # first time only, links this folder to a Vercel project
vercel env pull .env.local
vercel dev
```

Without a configured `ANTHROPIC_API_KEY`, the Kaiwa AI chat UI still loads
and lets you pick a scenario, but sending a message will show a clear error
explaining what's missing rather than failing silently.

## Building for production

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

## Deploying

### Vercel
`vercel.json` is included and configured for SPA routing *and* the `/api`
serverless function (the SPA fallback rewrite explicitly excludes `/api/*`
so Kaiwa AI keeps working). Import the repo in Vercel — it auto-detects the
Vite build. Add your `VITE_SUPABASE_*` vars and `ANTHROPIC_API_KEY` in the
project's environment variable settings.

### Any static host (Netlify, Cloudflare Pages, etc.)
Since the backend is now Supabase (not tied to any particular frontend
host), `npm run build` produces a plain static `dist/` folder deployable
anywhere that serves SPAs with a history-mode fallback to `index.html`. Only
Kaiwa AI's `/api/chat` needs a host that runs serverless/edge functions
(Vercel, Netlify Functions, Cloudflare Workers, etc.) — everything else is
pure static + Supabase.

### GitHub
Ready to push as-is. `.env` and `serviceAccountKey.json`-style secrets are
already git-ignored — commit `.env.example` instead so collaborators know
which variables to set. **Never commit** a Supabase `service_role` key.

## Project structure

```
api/
  chat.ts           Vercel Edge Function — Kaiwa AI backend (Anthropic API proxy)
supabase/
  schema.sql         Full Postgres schema + RLS policies + Storage buckets — run once in the SQL Editor
  bootstrap_admin.sql  Promotes an already-signed-up account to super_admin (no password stored here)
scripts/
  importSupabase.ts  Bulk seed importer — reads seed-data/*.json into Supabase (npm run seed)
seed-data/           JSON seed files matching the schema (vocabulary/kanji/grammar/exam per level, ssw, kaigo)
src/
  components/        layout (sidebar/topbar/bottom nav), kana, exam, content, admin
  contexts/          AuthContext (unifies local + Supabase auth)
  data/              Local-mode-only seed data: kana sets, small vocab/exam starter sets
  supabase/          Supabase client init (activates only if VITE_USE_SUPABASE=true)
  pages/             Route-level screens, including pages/admin/ for the Admin Panel
  services/          Data-access layer: local + Supabase collections behind one interface
                     (caseConvert.ts handles camelCase <-> snake_case at the boundary)
  types/             Domain model, including content.ts for Kanji/Grammar/SSW/Kaigo/Article/CMS types
  utils/             XP/streak progression, SM-2 spaced-repetition scheduler, access control
public/
  icons/             PWA icons (192px, 512px) — real generated assets, not placeholders
```

## License

MIT — do whatever you'd like with this.
