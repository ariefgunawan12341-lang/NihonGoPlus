-- NihonGoPlus Supabase schema (Production Ready - Hardened)
-- Run this in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================

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
    insert into public.profiles (id, email, username, full_name, avatar_url, created_at)
    values (
      new.id,
      new.email,
      default_username,
      coalesce(new.raw_user_metadata->>'full_name', ''),
      null,
      now()
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

-- RLS POLICIES (Explicitly hardened)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_blocked" on public.profiles for delete
  to authenticated
  using (false);

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

-- ... Other tables omitted for brevity in SQL console but assumed present ...

-- ROLE GRANTS (Required for API access)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
