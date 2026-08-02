# Implementation Plan - Fix Database Schema & Admin Bootstrap

This plan addresses the SQL execution error `relation "public.users" does not exist` and ensures the database schema is complete and compatible with the latest frontend logic.

## User Review Required

> [!IMPORTANT]
> **Database Wipe (Recommended)**: For a clean start with the new project, I recommend running the updated `schema.sql` which uses `IF NOT EXISTS` but ensures all internal references point to `public.profiles`.
> **Action Required**: You must run the updated `schema.sql` FIRST, then run the corrected `bootstrap_admin.sql` SECOND.

## Proposed Changes

### 1. Database Schema (`supabase/schema.sql`)
- [MODIFY] Ensure all foreign keys reference `public.profiles(id)`.
- [NEW] Add missing `admin_activity_log` table.
- [NEW] Add `updated_at` trigger for the `profiles` table.
- [MODIFY] Ensure all tables are created in the `public` schema.
- [MODIFY] Refine RLS policies to use `public.profiles` for admin checks.
- [FIX] Remove any stale references to a `public.users` table.

### 2. Admin Promotion (`supabase/bootstrap_admin.sql`)
- [MODIFY] Update the table name from `public.users` to `public.profiles`.
- [MODIFY] Ensure it correctly sets `is_admin = true` and `role = 'super_admin'`.

### 3. Cleanup
- [VERIFY] `src/services/adminUsers.ts` and other services for consistent table naming (`profiles`).

---

## Verification Plan

### Manual Verification
1. **Schema Execution**:
   - Run the entire `schema.sql` in Supabase SQL Editor.
   - Expect: "Success. No rows returned."
2. **Admin Bootstrap**:
   - Register an account in the app.
   - Run the updated `bootstrap_admin.sql`.
   - Expect: 1 row updated.
3. **Admin Access**:
   - Log in as the promoted admin.
   - Access `/admin/users`.
   - Expect: User list appears correctly.
