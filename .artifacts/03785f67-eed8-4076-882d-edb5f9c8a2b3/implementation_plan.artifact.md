# Implementation Plan - NihonGoPlus Production Polish

This plan addresses final production hurdles for NihonGoPlus, focusing on Authentication robustness, successful build, and Vercel deployment.

## User Review Required

> [!IMPORTANT]
> **Manual Steps Required**: You will need to manually configure the Google OAuth Client ID and Secret in your Supabase Dashboard as per the `GOOGLE_AUTH_SETUP.md` guide.
> **Environment Variables**: Ensure all variables from `.env.example` are added to your Vercel project settings.

## Proposed Changes

### 1. Authentication & Profile Logic
- [MODIFY] `src/contexts/AuthContext.tsx`:
    - Align default profile fields in both `signUp` and `onAuthStateChange` (Google Login) paths.
    - Ensure new users always have `bio`, `country`, and `targetLevel` initialized to avoid UI issues.
    - Robustify the redirect logic for Google OAuth to support both localhost and production.

### 2. Error Handling Polish
- [MODIFY] `src/pages/Login.tsx` & `src/pages/Signup.tsx`:
    - Expand `friendlyAuthError` to handle specific Supabase error strings (e.g., weak password, provider issues).

### 3. Production Readiness & Build Fixes
- [VERIFY] Run `npm run build` and fix any new TypeScript or dependency regressions.
- [MODIFY] `vercel.json`: Ensure routing is correctly configured for Vercel functions and SPA fallback.

### 4. Documentation
- [MODIFY] `README.md`: Update status report to reflect the production-ready state.

## Verification Plan

### Automated Tests
- `npm run build`: Must pass successfully.
- `tsc`: Verify no type errors in the entire project.

### Manual Verification
- Test registration flow and verify the `users` table record.
- Test login flow with specific error messages for wrong credentials.
- Test session persistence by refreshing the dashboard.
