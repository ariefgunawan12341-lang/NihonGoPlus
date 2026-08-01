-- Run this AFTER you've signed up normally through the app's /signup page
-- with the account you want as Super Admin. This script never contains a
-- password — Supabase Auth manages that entirely; this only promotes an
-- already-created account's role in the public.users table.
--
-- Usage:
--   1. Sign up through the app UI with the admin's real email + a password
--      of your choosing (set it there, not here).
--   2. Replace the email below with that account's email.
--   3. Run this in the Supabase SQL Editor.

update public.users
set role = 'super_admin', is_admin = true
where email = 'ariefgunawan12341@gmail.com';

-- Verify it worked:
select uid, email, role, is_admin from public.users where role = 'super_admin';
