-- NihonGoPlus Supabase schema
-- Run this once against a fresh Supabase project (SQL Editor, or `supabase db push`
-- if you set up the Supabase CLI). Safe to re-run: every statement uses
-- IF NOT EXISTS / CREATE OR REPLACE where possible.
--
-- Design notes:
--   * Columns are snake_case (Postgres convention); the app's SupabaseCollection
--     layer (src/services/caseConvert.ts) converts to/from the app's existing
--     camelCase types automatically, so no frontend code needed to change.
--   * access_type ('public' | 'free' | 'premium') is enforced by RLS via
--     public.can_access() below — this is REAL security, not just hiding UI.
--     A guest calling the Supabase API directly cannot read premium rows,
--     even bypassing the app entirely.
--   * Per-user tables (srs_cards, exam_attempts, kaiwa_sessions, progress) use
--     a flat table + user_id column instead of Firestore-style subcollections,
--     restricted by RLS to auth.uid() = user_id.

create extension if not exists "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================

create table if not exists public.users (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  username text,
  photo_url text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  xp int not null default 0,
  level int not null default 1,
  streak int not null default 0,
  last_study_date text,
  is_premium boolean not null default false,
  is_admin boolean not null default false,
  role text not null default 'user' check (role in ('super_admin','admin','editor','moderator','user')),
  premium_plan text,
  premium_expire text,
  language text default 'en'
);

alter table public.users enable row level security;

-- SECURITY DEFINER so this can look up the caller's own row without RLS
-- recursion issues (a normal policy checking "is this row's owner an admin"
-- by querying `users` again would otherwise recurse into this same policy).
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.users
    where uid = auth.uid() and (is_admin = true or role in ('admin','super_admin'))
  );
$$;

create or replace function public.is_premium_user() returns boolean
language sql security definer stable as $$
  select exists (select 1 from public.users where uid = auth.uid() and is_premium = true);
$$;

-- Central access-tier check used by every content table's SELECT policy.
create or replace function public.can_access(item_access_type text) returns boolean
language sql security definer stable as $$
  select case
    when item_access_type = 'public' or item_access_type is null then true
    when item_access_type = 'free' then auth.role() = 'authenticated'
    when item_access_type = 'premium' then public.is_premium_user()
    else true
  end;
$$;

drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users for select
  using (auth.role() = 'authenticated' or public.is_admin());

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self" on public.users for insert
  with check (auth.uid() = uid);

drop policy if exists "users_update" on public.users;
create policy "users_update" on public.users for update
  using (auth.uid() = uid or public.is_admin());

drop policy if exists "users_delete_admin" on public.users;
create policy "users_delete_admin" on public.users for delete
  using (public.is_admin());

-- ============================================================
-- CONTENT TABLES (public/free/premium enforced via can_access())
-- ============================================================

create table if not exists public.vocabulary (
  id text primary key,
  level text not null check (level in ('N5','N4','N3','N2','N1')),
  kanji text default '',
  kana text not null,
  romaji text default '',
  meaning text not null,
  example text default '',
  example_meaning text default '',
  tags text[] default '{}',
  favorite boolean default false,
  access_type text not null default 'public' check (access_type in ('public','free','premium')),
  audio_url text,
  image_url text
);
alter table public.vocabulary enable row level security;
drop policy if exists "vocabulary_select" on public.vocabulary;
create policy "vocabulary_select" on public.vocabulary for select using (public.can_access(access_type));
drop policy if exists "vocabulary_write_admin" on public.vocabulary;
create policy "vocabulary_write_admin" on public.vocabulary for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.content_items (
  id text primary key,
  kind text not null check (kind in ('kanji','grammar','module','ssw','kaigo')),
  level text not null check (level in ('N5','N4','N3','N2','N1')),
  category text,
  title text not null,
  reading text default '',
  meaning text default '',
  example text default '',
  example_meaning text default '',
  "order" int default 0,
  access_type text not null default 'public' check (access_type in ('public','free','premium')),
  audio_url text,
  image_url text,
  pdf_url text,
  video_url text
);
alter table public.content_items enable row level security;
drop policy if exists "content_items_select" on public.content_items;
create policy "content_items_select" on public.content_items for select using (public.can_access(access_type));
drop policy if exists "content_items_write_admin" on public.content_items;
create policy "content_items_write_admin" on public.content_items for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.questions (
  id text primary key,
  level text not null check (level in ('N5','N4','N3','N2','N1')),
  category text not null check (category in ('moji','goi','bunpou','dokkai','choukai')),
  difficulty int default 1,
  prompt text not null,
  passage text,
  choices text[] not null,
  correct_index int not null,
  explanation text default '',
  tags text[] default '{}',
  access_type text not null default 'public' check (access_type in ('public','free','premium')),
  audio_url text,
  image_url text
);
alter table public.questions enable row level security;
drop policy if exists "questions_select" on public.questions;
create policy "questions_select" on public.questions for select using (public.can_access(access_type));
drop policy if exists "questions_write_admin" on public.questions;
create policy "questions_write_admin" on public.questions for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.modules (
  id text primary key,
  title text not null,
  description text default '',
  level text not null check (level in ('N5','N4','N3','N2','N1')),
  file_url text not null,
  premium boolean default true,
  access_type text default 'premium' check (access_type in ('public','free','premium')),
  "order" int default 0
);
alter table public.modules enable row level security;
drop policy if exists "modules_select" on public.modules;
create policy "modules_select" on public.modules for select using (public.can_access(access_type));
drop policy if exists "modules_write_admin" on public.modules;
create policy "modules_write_admin" on public.modules for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- CMS: ARTICLES, COMMENTS, ANNOUNCEMENTS, SETTINGS, PREMIUM PACKAGES
-- ============================================================

create table if not exists public.articles (
  id text primary key,
  title text not null,
  slug text unique not null,
  thumbnail_url text,
  body_html text not null default '',
  category text default '',
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft','published','scheduled','archived')),
  publish_at bigint,
  access_type text not null default 'public' check (access_type in ('public','free','premium')),
  author_uid uuid references auth.users(id),
  author_name text default '',
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table public.articles enable row level security;
drop policy if exists "articles_select" on public.articles;
create policy "articles_select" on public.articles for select using (
  (status = 'published' or (status = 'scheduled' and coalesce(publish_at, 0) <= (extract(epoch from now()) * 1000)::bigint) or public.is_admin())
  and public.can_access(access_type)
);
drop policy if exists "articles_write_admin" on public.articles;
create policy "articles_write_admin" on public.articles for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.comments (
  id text primary key,
  article_id text references public.articles(id) on delete cascade,
  author_uid uuid references auth.users(id),
  author_name text default '',
  body text not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  approved boolean default true
);
alter table public.comments enable row level security;
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select using (approved = true or public.is_admin());
drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments for insert
  with check (auth.uid() = author_uid);
drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments for delete
  using (public.is_admin() or auth.uid() = author_uid);
drop policy if exists "comments_update_admin" on public.comments;
create policy "comments_update_admin" on public.comments for update using (public.is_admin());

create table if not exists public.announcements (
  id text primary key,
  message text not null,
  active boolean default true,
  level text default 'info' check (level in ('info','success','warning')),
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table public.announcements enable row level security;
drop policy if exists "announcements_select" on public.announcements;
create policy "announcements_select" on public.announcements for select using (true);
drop policy if exists "announcements_write_admin" on public.announcements;
create policy "announcements_write_admin" on public.announcements for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.settings (
  id text primary key default 'site',
  site_name text not null default 'NihonGoPlus',
  logo_url text,
  favicon_url text,
  banner_url text,
  contact_email text,
  telegram text,
  instagram text,
  youtube text,
  tiktok text,
  facebook text,
  google_analytics_id text,
  seo_default_title text,
  seo_default_description text,
  smtp_host text,
  smtp_port text,
  smtp_user text,
  qris_image_url text,
  dana_number text,
  dana_name text,
  payment_instructions text,
  hero_heading text,
  hero_subheading text,
  hero_cta_label text,
  hero_image_url text,
  show_hero_section boolean default true,
  show_quick_access_section boolean default true,
  show_sample_vocab_section boolean default true,
  show_cta_section boolean default true,
  theme_primary_color text,
  theme_border_radius text,
  gtm_id text,
  meta_pixel_id text,
  tiktok_pixel_id text,
  clarity_id text,
  adsense_id text,
  custom_css text,
  custom_header_script text,
  custom_footer_script text
);
alter table public.settings enable row level security;
drop policy if exists "settings_select" on public.settings;
create policy "settings_select" on public.settings for select using (true);
drop policy if exists "settings_write_admin" on public.settings;
create policy "settings_write_admin" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- Generic Pages CMS: About/FAQ/Privacy/Promo/Event/etc. without needing a
-- dedicated React component per page. Editable and publishable entirely from
-- the Admin Panel — no redeploy needed to add a new page.
create table if not exists public.pages (
  id text primary key,
  slug text unique not null,
  title text not null,
  body_html text not null default '',
  seo_title text,
  seo_description text,
  og_image_url text,
  status text not null default 'draft' check (status in ('draft','published','scheduled','archived')),
  publish_at bigint,
  layout text not null default 'default' check (layout in ('default','landing')),
  show_in_menu boolean default false,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table public.pages enable row level security;
drop policy if exists "pages_select" on public.pages;
create policy "pages_select" on public.pages for select using (
  status = 'published' or (status = 'scheduled' and coalesce(publish_at, 0) <= (extract(epoch from now()) * 1000)::bigint) or public.is_admin()
);
drop policy if exists "pages_write_admin" on public.pages;
create policy "pages_write_admin" on public.pages for all using (public.is_admin()) with check (public.is_admin());

-- Redirect Manager: checked client-side by RedirectHandler.tsx before
-- falling through to the 404 page.
create table if not exists public.redirects (
  id text primary key,
  from_path text unique not null,
  to_path text not null,
  active boolean default true
);
alter table public.redirects enable row level security;
drop policy if exists "redirects_select" on public.redirects;
create policy "redirects_select" on public.redirects for select using (true);
drop policy if exists "redirects_write_admin" on public.redirects;
create policy "redirects_write_admin" on public.redirects for all using (public.is_admin()) with check (public.is_admin());

-- Custom menu items: additive to the app's built-in navigation (which stays
-- hardcoded and reliable) — lets an admin add links to newly created Pages
-- without touching navConfig.ts.
create table if not exists public.menu_items (
  id text primary key,
  label text not null,
  path text not null,
  "order" int default 0,
  section text not null default 'primary' check (section in ('primary','secondary')),
  visible boolean default true
);
alter table public.menu_items enable row level security;
drop policy if exists "menu_items_select" on public.menu_items;
create policy "menu_items_select" on public.menu_items for select using (true);
drop policy if exists "menu_items_write_admin" on public.menu_items;
create policy "menu_items_write_admin" on public.menu_items for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.premium_packages (
  id text primary key,
  name text not null,
  plan text not null check (plan in ('monthly','yearly','lifetime')),
  price numeric not null default 0,
  currency text not null default 'IDR',
  duration_days int,
  benefits text[] default '{}',
  active boolean default true,
  "order" int default 0
);
alter table public.premium_packages enable row level security;
drop policy if exists "premium_packages_select" on public.premium_packages;
create policy "premium_packages_select" on public.premium_packages for select using (true);
drop policy if exists "premium_packages_write_admin" on public.premium_packages;
create policy "premium_packages_write_admin" on public.premium_packages for all using (public.is_admin()) with check (public.is_admin());

-- Manual QRIS/DANA payment claims: user submits, admin reviews and confirms
-- by hand (no payment gateway is configured, so this is real but manual —
-- see AdminPremiumOrders.tsx). Confirming an order is what actually flips
-- the user's is_premium flag, done from the Admin Panel.
create table if not exists public.premium_orders (
  id text primary key,
  user_uid uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  user_name text not null,
  package_id text references public.premium_packages(id),
  package_name text not null,
  price numeric not null default 0,
  currency text not null default 'IDR',
  method text not null check (method in ('qris','dana')),
  proof_url text,
  note text,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  reviewed_at bigint,
  reviewed_by text
);
alter table public.premium_orders enable row level security;
drop policy if exists "premium_orders_select" on public.premium_orders;
create policy "premium_orders_select" on public.premium_orders for select
  using (auth.uid() = user_uid or public.is_admin());
drop policy if exists "premium_orders_insert" on public.premium_orders;
create policy "premium_orders_insert" on public.premium_orders for insert
  with check (auth.uid() = user_uid);
drop policy if exists "premium_orders_update_admin" on public.premium_orders;
create policy "premium_orders_update_admin" on public.premium_orders for update
  using (public.is_admin());

-- ============================================================
-- ANALYTICS
-- ============================================================

create table if not exists public.pageviews (
  id text primary key,
  path text not null,
  "timestamp" bigint not null
);
alter table public.pageviews enable row level security;
drop policy if exists "pageviews_insert" on public.pageviews;
create policy "pageviews_insert" on public.pageviews for insert with check (true);
drop policy if exists "pageviews_select_admin" on public.pageviews;
create policy "pageviews_select_admin" on public.pageviews for select using (public.is_admin());

-- ============================================================
-- ADMIN ACTIVITY LOG
-- ============================================================

create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_uid uuid references auth.users(id),
  admin_name text default '',
  action text not null,
  target_table text,
  target_id text,
  details jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table public.admin_activity_log enable row level security;
drop policy if exists "admin_activity_log_all_admin" on public.admin_activity_log;
create policy "admin_activity_log_all_admin" on public.admin_activity_log for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- PER-USER TABLES (flat table + user_id, replaces Firestore subcollections)
-- ============================================================

create table if not exists public.srs_cards (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  interval int not null default 0,
  ease_factor numeric not null default 2.5,
  repetitions int not null default 0,
  due_date text,
  primary key (user_id, id)
);
alter table public.srs_cards enable row level security;
drop policy if exists "srs_cards_owner" on public.srs_cards;
create policy "srs_cards_owner" on public.srs_cards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.exam_attempts (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  level text,
  started_at bigint,
  finished_at bigint,
  answers jsonb,
  score int,
  total_questions int,
  primary key (user_id, id)
);
alter table public.exam_attempts enable row level security;
drop policy if exists "exam_attempts_owner" on public.exam_attempts;
create policy "exam_attempts_owner" on public.exam_attempts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.kaiwa_sessions (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario text,
  created_at bigint,
  messages jsonb,
  primary key (user_id, id)
);
alter table public.kaiwa_sessions enable row level security;
drop policy if exists "kaiwa_sessions_owner" on public.kaiwa_sessions;
create policy "kaiwa_sessions_owner" on public.kaiwa_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.progress (
  id text not null default 'progress',
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_lessons int not null default 0,
  activity_log jsonb not null default '[]',
  unlocked_achievements text[] default '{}',
  primary key (user_id, id)
);
alter table public.progress enable row level security;
drop policy if exists "progress_owner" on public.progress;
create policy "progress_owner" on public.progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS + POLICIES
-- ============================================================

insert into storage.buckets (id, name, public)
values ('images', 'images', true), ('audio', 'audio', true), ('video', 'video', true),
       ('pdf', 'pdf', true), ('modules', 'modules', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects for select
  using (bucket_id in ('images','audio','video','pdf','modules'));

drop policy if exists "media_admin_write" on storage.objects;
create policy "media_admin_write" on storage.objects for insert
  with check (bucket_id in ('images','audio','video','pdf','modules') and (public.is_admin() or auth.uid() is not null));

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects for update
  using (bucket_id in ('images','audio','video','pdf','modules') and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects for delete
  using (bucket_id in ('images','audio','video','pdf','modules') and public.is_admin());

-- ============================================================
-- INDEXES for the query patterns the app actually uses
-- ============================================================

create index if not exists idx_vocabulary_level on public.vocabulary(level);
create index if not exists idx_questions_level_category on public.questions(level, category);
create index if not exists idx_content_items_kind_level on public.content_items(kind, level);
create index if not exists idx_content_items_kind_category on public.content_items(kind, category);
create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_comments_article on public.comments(article_id);
create index if not exists idx_pageviews_timestamp on public.pageviews("timestamp");

-- ============================================================
-- ROLE GRANTS — REQUIRED, do not skip
-- ============================================================
-- RLS policies alone are NOT enough. Tables created via raw SQL (as opposed
-- to Supabase's Table Editor UI) do not automatically grant the anon/
-- authenticated roles any table-level privileges — without this, every
-- request is rejected before Postgres even evaluates the RLS policies
-- above, regardless of how correct those policies are. This one bug meant
-- signup (insert into public.users) and pageview logging (insert into
-- public.pageviews) both failed with 401/RLS errors even with all policies
-- correctly in place.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
