-- promote an already-created account's role in the public.profiles table.
--
-- Usage:
--   1. Sign up through the app UI with the admin's real email + a password
--      of your choosing (set it there, not here).
--   2. Replace the email below with that account's email.
--   3. Run this in the Supabase SQL Editor.

update public.profiles
set role = 'super_admin', is_admin = true
where email = 'ariefgunawan12341@gmail.com';

-- Verify it worked:
select id, email, role, is_admin from public.profiles where role = 'super_admin';
