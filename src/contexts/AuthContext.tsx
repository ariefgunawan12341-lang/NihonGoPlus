import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { USE_SUPABASE, supabase } from '../supabase/client'
import type { UserProfile } from '../types'
import {
  localSignUp,
  localSignIn,
  localSignOut,
  localGetProfile,
  localUpdateProfile,
  localChangePassword,
  getSessionUid
} from '../services/localAuth'
import { fetchSupabaseProfile, createSupabaseProfile, updateSupabaseProfile } from '../services/supabaseUserProfile'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_SUPABASE && supabase) {
      // Load whatever session already exists (e.g. after a page refresh)...
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await fetchSupabaseProfile(session.user.id)
          setUser(profile)
        }
        setLoading(false)
      })

      // ...then keep listening for sign-in/sign-out/token-refresh events.
      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          let profile = await fetchSupabaseProfile(session.user.id)
          if (!profile) {
            // First time we've seen this auth user (e.g. just completed Google
            // OAuth) — there's no public.users row yet, so create one now
            // using whatever Google gave us (name/avatar), same as email
            // sign-up does.
            const meta = session.user.user_metadata ?? {}
            profile = {
              uid: session.user.id,
              email: session.user.email ?? '',
              displayName: meta.full_name ?? meta.name ?? session.user.email?.split('@')[0] ?? 'User',
              username: session.user.email?.split('@')[0],
              photoURL: meta.avatar_url ?? meta.picture,
              createdAt: Date.now(),
              xp: 0,
              level: 1,
              streak: 0,
              lastStudyDate: null,
              isPremium: false,
              isAdmin: false,
              role: 'user'
            }
            await createSupabaseProfile(profile)
          }
          setUser(profile)
        } else {
          setUser(null)
        }
      })

      return () => sub.subscription.unsubscribe()
    } else {
      const uid = getSessionUid()
      if (uid) setUser(localGetProfile(uid))
      setLoading(false)
    }
  }, [])

  async function signUp(email: string, password: string, displayName: string) {
    if (USE_SUPABASE && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (!data.user) throw new Error('Sign up succeeded but no user was returned — check your email to confirm your account if email confirmation is enabled.')

      const profile: UserProfile = {
        uid: data.user.id,
        email,
        displayName,
        username: email.split('@')[0],
        createdAt: Date.now(),
        xp: 0,
        level: 1,
        streak: 0,
        lastStudyDate: null,
        isPremium: false,
        isAdmin: false,
        role: 'user'
      }
      await createSupabaseProfile(profile)
      setUser(profile)
    } else {
      const profile = await localSignUp(email, password, displayName)
      setUser(profile)
    }
  }

  async function signIn(email: string, password: string) {
    if (USE_SUPABASE && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const profile = await fetchSupabaseProfile(data.user.id)
      setUser(profile)
    } else {
      const profile = await localSignIn(email, password)
      setUser(profile)
    }
  }

  async function signInWithGoogle() {
    if (!USE_SUPABASE || !supabase) {
      throw new Error('Login Google memerlukan Supabase (set VITE_USE_SUPABASE=true). Aktifkan provider Google di Supabase Dashboard -> Authentication -> Providers.')
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
    // Supabase redirects the whole page to Google, then back — the profile
    // fetch/create happens in onAuthStateChange above once the redirect
    // completes, so there's nothing further to do here.
  }

  async function signOutUser() {
    if (USE_SUPABASE && supabase) {
      await supabase.auth.signOut()
    } else {
      localSignOut()
    }
    setUser(null)
  }

  async function updateProfile(patch: Partial<UserProfile>) {
    if (!user) return
    if (USE_SUPABASE) {
      await updateSupabaseProfile(user.uid, patch)
    } else {
      localUpdateProfile(user.uid, patch)
    }
    setUser({ ...user, ...patch })
  }

  async function refreshProfile() {
    if (!user) return
    if (USE_SUPABASE) {
      const profile = await fetchSupabaseProfile(user.uid)
      setUser(profile)
    } else {
      setUser(localGetProfile(user.uid))
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    if (USE_SUPABASE && supabase) {
      if (!user) throw new Error('Not signed in.')
      // Supabase's updateUser() only requires an active session, not the old
      // password — but we verify it first anyway for the same UX/security
      // expectation the rest of the app already has (confirm current password
      // before allowing a change).
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword })
      if (verifyError) throw new Error('Current password is incorrect.')
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
    } else if (user) {
      await localChangePassword(user.uid, oldPassword, newPassword)
    }
  }

  async function forgotPassword(email: string) {
    if (USE_SUPABASE && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
    } else {
      throw new Error('Password reset via email requires Supabase (set VITE_USE_SUPABASE=true). In local mode, sign up again or ask an admin to reset your account.')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOutUser, updateProfile, refreshProfile, changePassword, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
