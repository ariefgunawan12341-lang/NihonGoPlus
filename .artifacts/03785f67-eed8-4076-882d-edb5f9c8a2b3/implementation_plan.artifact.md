# Implementation Plan - Update Supabase Configuration

This plan focuses on updating the Supabase project URL and ensuring environment variables are correctly used to fix `NetworkError` and `CORS` issues.

## User Review Required

> [!IMPORTANT]
> **New Supabase URL**: The project will be migrated to `https://jsccbdamadrxcmblkqrm.supabase.co`.
> **Action Required**: After this update, you **must** update your **Redirect URLs** and **Site URL** in the Supabase Dashboard (`Authentication -> Settings -> URL Configuration`) to match your production domain (`https://nihongoplus.my.id`) and local development (`http://localhost:5173`).

## Proposed Changes

### 1. Environment Variables (`.env` & `.env.example`)
- [MODIFY] `.env`: Update `VITE_SUPABASE_URL` and `SUPABASE_URL` to the new URL.
- [MODIFY] `.env.example`: Update example values to reflect the new project ID and clarify key naming.

### 2. Supabase Client (`src/supabase/client.ts`)
- [MODIFY] Update the client initialization to be more robust.
- [MODIFY] Ensure `VITE_SUPABASE_ANON_KEY` is the primary variable name, but support `VITE_SUPABASE_PUBLISHABLE_KEY` if provided.

### 3. Build & Verification
- [RUN] `npm run build` to ensure the new configuration is bundled correctly.

---

## Verification Plan

### Automated Tests
- `npm run build`: Confirm no regressions.

### Manual Verification
1. **Console Check**: Verify that "Supabase client initialized." appears in the console without "looks like a Clerk key" errors.
2. **Network Check**: Attempt a login/register and verify the request goes to `jsccbdamadrxcmblkqrm.supabase.co` instead of the old URL.
3. **PWA Check**: Ensure the start URL and scope in `vite.config.ts` are consistent with the environment.
