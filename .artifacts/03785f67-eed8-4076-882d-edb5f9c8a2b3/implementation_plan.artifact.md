# Implementation Plan - Comment System Audit & Hardening

Audit and fix the NihonGoPlus comment system after the Supabase migration. This plan covers standardization of user identifiers, database schema improvements, and removal of legacy local/mock code.

## User Review Required

> [!IMPORTANT]
> **Removal of Local Mode**: As part of the cleanup, I will remove the "Local Mode" (localStorage fallback) logic from the authentication and database services. The application will now strictly require Supabase to function.
> **SQL Migration**: I will update `schema.sql`. You will need to run the `ALTER` or `CREATE` statements for the `comments` table in your Supabase SQL Editor to ensure UUIDs are generated correctly.

## Proposed Changes

### 1. Database Schema (`supabase/schema.sql`)
- [MODIFY] Update `public.comments` table:
    - Ensure `id` is `uuid DEFAULT gen_random_uuid()`.
    - Ensure `author_uid` references `public.profiles(id)`.
- [MODIFY] Refine RLS Policies:
    - `SELECT`: Allow anyone to see `approved = true` comments.
    - `INSERT`: Allow `authenticated` users to post if `auth.uid() = author_uid`.
    - `ALL`: Allow `service_role` and `admin` users (via `is_admin()` function) full control.

### 2. Service Layer & Types
- [MODIFY] `src/types/index.ts`: Standardize `UserProfile` to use `id` as the primary identifier.
- [MODIFY] `src/services/db.ts`: Remove `LocalCollection` imports and fallback logic.
- [DELETE] `src/services/localAuth.ts`, `src/services/localCollection.ts`: Remove legacy mock implementations.

### 3. Authentication (`src/contexts/AuthContext.tsx`)
- [MODIFY] Remove all references to "Local Mode".
- [MODIFY] Ensure `user.id` is the source of truth for the authenticated user's ID.

### 4. Comment Components
- [MODIFY] `src/components/content/CommentSection.tsx`:
    - Use `user.id` for posting.
    - Remove manual ID generation (let Supabase handle UUID).
- [MODIFY] `src/pages/admin/AdminComments.tsx`:
    - Ensure management actions (approve/delete) use the correct UUIDs.

## Verification Plan

### Automated Tests
- `npm run build`: Confirm zero TypeScript or import errors after deleting files.

### Manual Verification
1. **Comment Flow**: Login -> Post a comment on an article -> Verify it appears instantly and exists in Supabase.
2. **Admin Moderation**: Login as Admin -> Go to Admin Panel -> Comments -> Approve/Delete a comment -> Verify the change in the public view.
3. **Security Check**: Attempt to delete a comment as a regular user via the console -> Verify RLS blocks the request.
