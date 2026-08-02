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
  localDeleteAccount,
  getSessionUid
} from '../services/localAuth'
import { fetchSupabaseProfile, updateSupabaseProfile } from '../services/supabaseUserProfile'

interface SignUpResult {
  sessionCreated: boolean
  emailVerificationSent: boolean
}

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>
  signIn: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function syncProfile(uid: string): Promise<UserProfile | null> {
    try {
      const profile = await fetchSupabaseProfile(uid)
      if (profile) {
        if (profile.status === 'disabled') {
          console.warn('[Auth] User account is disabled:', uid)
          if (supabase) await supabase.auth.signOut()
          return null
        }
        return profile
      }
    } catch (err: any) {
      console.error('[Auth] Failed to sync profile:', {
        message: err.message,
        status: err.status,
        code: err.code,
        full: err
      })
    }
    return null
  }

  useEffect(() => {
    let sub: { subscription: { unsubscribe: () => void } } | null = null

    async function initAuth() {
      if (USE_SUPABASE && supabase) {
        console.log('[Auth] Initializing Supabase Auth...')
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) {
            console.error('[Auth] Session retrieval error:', sessionError)
          }
          if (session?.user) {
            console.log('[Auth] Session found for user:', session.user.id)
            const p = await syncProfile(session.user.id)
            setUser(p)
          } else {
            console.log('[Auth] No active session found.')
          }
        } catch (error) {
          console.error('[Auth] Initialization exception:', error)
        } finally {
          setLoading(false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log(`[Auth] Event: ${event}`, { uid: session?.user?.id })
          if (session?.user) {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
              const p = await syncProfile(session.user.id)
              setUser(p)
            }
          } else {
            setUser(null)
          }
          setLoading(false)
        })
        sub = { subscription }
      } else {
        const uid = getSessionUid()
        if (uid) setUser(localGetProfile(uid))
        setLoading(false)
      }
    }

    initAuth()
    return () => sub?.subscription.unsubscribe()
  }, []) // Removed [user] to avoid unnecessary re-subscriptions

  async function signUp(email: string, password: string, fullName: string): Promise<SignUpResult> {
    console.log('[Auth] Attempting signUp for:', email)
    if (USE_SUPABASE && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: fullName.trim().toLowerCase().replace(/\s+/g, '_')
          }
        }
      })

      if (error) {
        console.error('[Auth] signUp Error:', {
          status: error.status,
          code: error.code,
          message: error.message,
          full: error
        })
        throw error
      }

      console.log('[Auth] signUp Success:', {
        user: data.user?.id,
        session: !!data.session
      })

      if (!data.user) {
        throw new Error('Sign up failed: No user returned from Supabase.')
      }

      if (data.session) {
        const p = await syncProfile(data.user.id)
        setUser(p)
        return { sessionCreated: true, emailVerificationSent: false }
      }

      return { sessionCreated: false, emailVerificationSent: true }
    } else {
      const profile = await localSignUp(email, password, fullName)
      setUser(profile)
      return { sessionCreated: true, emailVerificationSent: false }
    }
  }

  async function signIn(email: string, password: string) {
    console.log('[Auth] Attempting signIn for:', email)
    if (USE_SUPABASE && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('[Auth] signIn Error:', {
          status: error.status,
          code: error.code,
          message: error.message,
          full: error
        })
        throw error
      }

      console.log('[Auth] signIn Success:', data.user.id)

      const profile = await fetchSupabaseProfile(data.user.id)
      if (profile?.status === 'disabled') {
        await supabase.auth.signOut()
        throw new Error('Akun Anda telah dinonaktifkan. Silakan hubungi admin.')
      }

      if (profile) {
        const now = Date.now()
        await updateSupabaseProfile(data.user.id, { lastLogin: now })
        setUser({ ...profile, lastLogin: now })
      }
    } else {
      const profile = await localSignIn(email, password)
      if (profile.status === 'disabled') {
        throw new Error('Akun Anda telah dinonaktifkan.')
      }
      setUser(profile)
    }
  }

  async function signOutUser() {
    console.log('[Auth] Signing out...')
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
      const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset-password`
      })
      if (error) throw error
    } else {
      throw new Error('Password reset requires Supabase mode.')
    }
  }

  async function deleteAccount() {
    if (!user) return
    if (USE_SUPABASE && supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) {
        throw new Error('Tidak ada sesi aktif untuk menghapus akun.')
      }

      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || 'Gagal menghapus akun.')
      }

      await supabase.auth.signOut()
    } else {
      localDeleteAccount(user.uid)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOutUser, updateProfile, refreshProfile, changePassword, forgotPassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
