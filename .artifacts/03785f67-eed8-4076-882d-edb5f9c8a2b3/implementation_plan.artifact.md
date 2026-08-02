# Implementation Plan - Fix Registration & Supabase Auth Flow

The user reports that registration is not creating users in Supabase. This plan focuses on identifying the root cause, improving error transparency, and ensuring the `profiles` table and triggers are correctly synchronized.

## User Review Required

> [!IMPORTANT]
> **Environment Variables**: Please double-check that `VITE_USE_SUPABASE=true`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` are correctly set in your environment (e.g., `.env` file).
> **SQL Migration**: Ensure you have executed the latest [schema.sql](file:///E:/NIHONGOPLUS%20UPDATE%20TERBARU/supabase/schema.sql) in your Supabase SQL Editor. If the `public.profiles` table or the trigger function is missing or errored, the registration might fail.

## Proposed Changes

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)
- **Fix Infinite Loop**: Remove `user` from the `useEffect` dependency array. The `onAuthStateChange` listener handles its own state updates and doesn't need to re-subscribe on every user change.
- **Improved Logging**: Add `console.error` and `console.log` in `signUp` and `signIn` to capture raw Supabase responses.
- **Metadata Handling**: Ensure `full_name` is passed correctly so the trigger can use it.

### 2. Registration Page (`src/pages/Signup.tsx`)
- **Verbose Errors**: Update the catch block to show not just `err.message` but also `err.status` if available, helping pinpoint configuration issues (like 403 Forbidden or 422 Unprocessable Entity).
- **Direct Feedback**: Ensure the "Creating Account..." loading state is strictly tied to the promise lifecycle.

### 3. Supabase Client (`src/supabase/client.ts`)
- **Configuration Check**: Add a check to verify if the client is actually instantiated when `VITE_USE_SUPABASE` is true.

### 4. Database Trigger Guard (`supabase/schema.sql`)
- **Safety First**: Verify the `handle_new_user` function. If it fails (e.g., because `split_part` or `raw_user_metadata` access fails), it will roll back the user creation in `auth.users`. I will add a `BEGIN...EXCEPTION` block to make it more robust.

---

## Verification Plan

### Automated Tests
- `npm run build`: Confirm no TypeScript regressions.

### Manual Verification
1. **Registration Test**:
   - Attempt to register with a new email.
   - Check browser console for "Supabase SignUp Result" logs.
   - If it fails, the console will show the exact error status and message.
2. **Dashboard Sync**:
   - If successful, verify the user appears in Supabase Dashboard -> Authentication.
   - Verify the profile record exists in Supabase Dashboard -> Table Editor -> profiles.
3. **Session Persistence**:
   - Refresh the page after login and ensure the user stays on the Dashboard.
