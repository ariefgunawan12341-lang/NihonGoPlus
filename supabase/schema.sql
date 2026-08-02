-- NihonGoPlus Supabase schema (Full Production Ready - Hardened)
-- Run this in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================

-- If a table named "users" exists in public schema, we should rename it or drop it
-- to avoid confusion with the "profiles" approach.
-- For a clean install, we just create "profiles".
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text unique,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'user' check (role in ('super_admin','admin','editor','moderator','user')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  premium boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_login bigint, -- Unix timestamp in ms
  xp int not null default 0,
  level int not null default 1,
  streak int not null default 0,
  last_study_date text,
  is_admin boolean not null default false,
  premium_plan text,
  premium_expire text,
  language text default 'en',
  bio text,
  country text,
  target_level text
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER so this can look up the caller's own row without RLS recursion
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (is_admin = true or role in ('admin','super_admin'))
  );
$$;

create or replace function public.is_premium_user() returns boolean
language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and premium = true);
$$;

-- Central access-tier check
create or replace function public.can_access(item_access_type text) returns boolean
language sql security definer stable as $$
  select case
    when item_access_type = 'public' or item_access_type is null then true
    when item_access_type = 'free' then auth.role() = 'authenticated'
    when item_access_type = 'premium' then public.is_premium_user()
    else true
  end;
$$;

-- AUTOMATIC PROFILE CREATION TRIGGER (Hardened)
-- This function MUST NOT fail the auth user creation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_username text;
begin
  default_username := split_part(new.email, '@', 1);

  -- Use a sub-transaction block to catch errors and prevent rolling back the main auth transaction.
  begin
    insert into public.profiles (id, email, username, full_name, role)
    values (
      new.id,
      new.email,
      default_username,
      coalesce(new.raw_user_metadata->>'full_name', ''),
      'user'
    )
    on conflict (id) do nothing;
  exception when others then
    -- Log the error (Postgres log) but don't fail user creation
    raise warning 'Error in handle_new_user for user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

-- Re-create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- UPDATED AT TRIGGER
create or replace function public.handle_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- RLS POLICIES for PROFILES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- ============================================================
-- CONTENT TABLES
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
  meaning text not null,
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
-- CMS: ARTICLES, COMMENTS, ANNOUNCEMENTS
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
  author_uid uuid references public.profiles(id),
  author_name text default '',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
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
  author_uid uuid references public.profiles(id),
  author_name text default '',
  body text not null,
  created_at timestamp with time zone default now(),
  approved boolean default true
);
alter table public.comments enable row level security;
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select using (approved = true or public.is_admin());
drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments for insert with check (auth.uid() = author_uid);
drop policy if exists "comments_admin" on public.comments;
create policy "comments_admin" on public.comments for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.announcements (
  id text primary key,
  message text not null,
  active boolean default true,
  level text default 'info' check (level in ('info','success','warning')),
  created_at timestamp with time zone default now()
);
alter table public.announcements enable row level security;
drop policy if exists "announcements_select" on public.announcements;
create policy "announcements_select" on public.announcements for select using (true);
drop policy if exists "announcements_admin" on public.announcements;
create policy "announcements_admin" on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- PREMIUM PACKAGES, ORDERS, COUPONS
-- ============================================================

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
drop policy if exists "premium_packages_admin" on public.premium_packages;
create policy "premium_packages_admin" on public.premium_packages for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.premium_orders (
  id text primary key,
  user_uid uuid not null references public.profiles(id) on delete cascade,
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
  created_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone,
  reviewed_by text
);
alter table public.premium_orders enable row level security;
drop policy if exists "premium_orders_select" on public.premium_orders;
create policy "premium_orders_select" on public.premium_orders for select using (auth.uid() = user_uid or public.is_admin());
drop policy if exists "premium_orders_insert" on public.premium_orders;
create policy "premium_orders_insert" on public.premium_orders for insert with check (auth.uid() = user_uid);
drop policy if exists "premium_orders_admin" on public.premium_orders;
create policy "premium_orders_admin" on public.premium_orders for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.coupons (
  id text primary key,
  code text unique not null,
  plan text not null check (plan in ('monthly','yearly','lifetime')),
  duration_days int,
  max_uses int default 1,
  current_uses int default 0,
  active boolean default true,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);
alter table public.coupons enable row level security;
drop policy if exists "coupons_select" on public.coupons;
create policy "coupons_select" on public.coupons for select using (active = true);
drop policy if exists "coupons_admin" on public.coupons;
create policy "coupons_admin" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- ADMIN ACTIVITY LOG
-- ============================================================

create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_uid uuid references public.profiles(id),
  admin_name text not null default '',
  action text not null,
  target_table text,
  target_id text,
  details jsonb,
  created_at timestamp with time zone default now()
);
alter table public.admin_activity_log enable row level security;
drop policy if exists "admin_activity_log_admin" on public.admin_activity_log;
create policy "admin_activity_log_admin" on public.admin_activity_log for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- OTHERS: FEEDBACK, SETTINGS, PAGEVIEWS
-- ============================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  user_email text,
  user_name text,
  subject text not null,
  message text not null,
  status text not null default 'unread' check (status in ('unread','read','replied','archived')),
  created_at timestamp with time zone default now()
);
alter table public.feedback enable row level security;
drop policy if exists "feedback_insert" on public.feedback;
create policy "feedback_insert" on public.feedback for insert with check (true);
drop policy if exists "feedback_admin" on public.feedback;
create policy "feedback_admin" on public.feedback for all using (public.is_admin()) with check (public.is_admin());

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
  theme_primary_color text,
  theme_border_radius text
);
alter table public.settings enable row level security;
drop policy if exists "settings_select" on public.settings;
create policy "settings_select" on public.settings for select using (true);
drop policy if exists "settings_admin" on public.settings;
create policy "settings_admin" on public.settings for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.pageviews (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  timestamp timestamp with time zone default now()
);
alter table public.pageviews enable row level security;
drop policy if exists "pageviews_insert" on public.pageviews;
create policy "pageviews_insert" on public.pageviews for insert with check (true);
drop policy if exists "pageviews_admin" on public.pageviews;
create policy "pageviews_admin" on public.pageviews for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- PER-USER TABLES (PROGRESS, SRS, EXAMS, etc)
-- ============================================================

create table if not exists public.progress (
  id text not null default 'progress',
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed_lessons int not null default 0,
  activity_log jsonb not null default '[]',
  recent_activities jsonb not null default '[]',
  daily_challenge jsonb,
  unlocked_achievements text[] default '{}',
  primary key (user_id, id)
);
alter table public.progress enable row level security;
drop policy if exists "progress_owner" on public.progress;
create policy "progress_owner" on public.progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.srs_cards (
  id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  word_id text not null,
  interval int not null default 0,
  ease_factor numeric not null default 2.5,
  repetitions int not null default 0,
  due_date text,
  primary key (user_id, id)
);
alter table public.srs_cards enable row level security;
drop policy if exists "srs_cards_owner" on public.srs_cards;
create policy "srs_cards_owner" on public.srs_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.exam_attempts (
  id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
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
create policy "exam_attempts_owner" on public.exam_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.kaiwa_sessions (
  id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scenario text,
  created_at timestamp with time zone default now(),
  messages jsonb,
  primary key (user_id, id)
);
alter table public.kaiwa_sessions enable row level security;
drop policy if exists "kaiwa_sessions_owner" on public.kaiwa_sessions;
create policy "kaiwa_sessions_owner" on public.kaiwa_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  item_type text not null check (item_type in ('vocab','kanji','grammar','article')),
  created_at timestamp with time zone default now()
);
alter table public.bookmarks enable row level security;
drop policy if exists "bookmarks_owner" on public.bookmarks;
create policy "bookmarks_owner" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  note text not null,
  updated_at timestamp with time zone default now()
);
alter table public.user_notes enable row level security;
drop policy if exists "user_notes_owner" on public.user_notes;
create policy "user_notes_owner" on public.user_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  link text,
  read boolean default false,
  type text default 'system' check (type in ('system','achievement','promotion','reminder')),
  created_at timestamp with time zone default now()
);
alter table public.notifications enable row level security;
drop policy if exists "notifications_owner" on public.notifications;
create policy "notifications_owner" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "notifications_admin" on public.notifications;
create policy "notifications_admin" on public.notifications for insert with check (public.is_admin());

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamp with time zone default now(),
  unique (user_id, achievement_id)
);
alter table public.user_achievements enable row level security;
drop policy if exists "user_achievements_select" on public.user_achievements;
create policy "user_achievements_select" on public.user_achievements for select using (true);
drop policy if exists "user_achievements_owner" on public.user_achievements;
create policy "user_achievements_owner" on public.user_achievements for insert with check (auth.uid() = user_id);

-- ============================================================
-- ROLE GRANTS
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
