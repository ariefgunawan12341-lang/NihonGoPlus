# Implementation Plan - Configure Google Login (Supabase)

This plan outlines the steps to correctly configure and implement Google Sign-In for **NihonGoPlus** using Supabase Auth.

## User Review Required

> [!IMPORTANT]
> **Manual Steps Required**: You will need to perform some actions in the **Google Cloud Console** and **Supabase Dashboard** that I cannot do for you (e.g., creating OAuth credentials). I have provided a complete guide below.

## Proposed Changes

### 1. Project Configuration
#### [MODIFY] [.env.example](file:///E:/NIHONGOPLUS UPDATE TERBARU/.env.example)
- Ensure all required Supabase variables are listed.

### 2. Authentication Logic
#### [MODIFY] [AuthContext.tsx](file:///E:/NIHONGOPLUS UPDATE TERBARU/src/contexts/AuthContext.tsx)
- Refine `signInWithGoogle` to use the correct `redirectTo` parameter for local vs. production.
- Improve the `onAuthStateChange` listener to robustly handle the "new user" profile creation from Google metadata (saving `full_name`, `avatar_url`, and setting default roles).

### 3. User Interface & Error Handling
#### [MODIFY] [Login.tsx](file:///E:/NIHONGOPLUS UPDATE TERBARU/src/pages/Login.tsx) and [Signup.tsx](file:///E:/NIHONGOPLUS UPDATE TERBARU/src/pages/Signup.tsx)
- Improve Google Login error handling (e.g., catching `provider_not_enabled` or user cancellation).
- Add friendly UI feedback during the redirect process.

### 4. Setup Guide (Documentation)
#### [NEW] [GOOGLE_AUTH_SETUP.md](file:///E:/NIHONGOPLUS UPDATE TERBARU/GOOGLE_AUTH_SETUP.md)
- Provide a step-by-step guide for Google Cloud and Supabase integration.

---

## Verification Plan

### Automated Tests
- `npm run build`: Ensure no TypeScript regressions.

### Manual Verification
1. **Local Test**: Click "Masuk dengan Google" on localhost. Verify it redirects to Google, allows login, and returns to the Dashboard with a profile created in the `users` table.
2. **Persistence Test**: Refresh the page after Google login. Verify the session persists.
3. **Logout Test**: Click Sign Out. Verify the session is cleared.
4. **Vercel Test**: Deploy to Vercel and verify the `redirectTo` works correctly with the production domain.
