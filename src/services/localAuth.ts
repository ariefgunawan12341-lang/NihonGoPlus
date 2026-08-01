import type { UserProfile } from '../types'

// A minimal, self-contained auth implementation for local/demo mode.
// NOT cryptographically secure — this is a development convenience so the
// full app is usable with zero backend setup. Swap to Supabase Auth by
// setting VITE_USE_SUPABASE=true (see authContext logic in AuthContext.tsx).
const USERS_KEY = 'ngp_local_users'
const SESSION_KEY = 'ngp_local_session'

interface StoredUser {
  profile: UserProfile
  passwordHash: string
}

async function hash(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY)
  return raw ? JSON.parse(raw) : []
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSessionUid(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export async function localSignUp(email: string, password: string, displayName: string): Promise<UserProfile> {
  const users = readUsers()
  if (users.some((u) => u.profile.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const profile: UserProfile = {
    uid: crypto.randomUUID(),
    email,
    displayName,
    createdAt: Date.now(),
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    isPremium: false,
    isAdmin: users.length === 0,
    isSuspended: false,
    bio: '',
    country: '',
    targetLevel: 'N5'
  }
  users.push({ profile, passwordHash: await hash(password) })
  writeUsers(users)
  localStorage.setItem(SESSION_KEY, profile.uid)
  return profile
}

export async function localSignIn(email: string, password: string): Promise<UserProfile> {
  const users = readUsers()
  const found = users.find((u) => u.profile.email.toLowerCase() === email.toLowerCase())
  if (!found) throw new Error('No account found with this email.')
  const pw = await hash(password)
  if (pw !== found.passwordHash) throw new Error('Incorrect password.')
  localStorage.setItem(SESSION_KEY, found.profile.uid)
  return found.profile
}

export function localSignOut() {
  localStorage.removeItem(SESSION_KEY)
}

export function localDeleteAccount(uid: string) {
  const users = readUsers()
  const filtered = users.filter((u) => u.profile.uid !== uid)
  writeUsers(filtered)
  localStorage.removeItem(SESSION_KEY)
}

export function localGetProfile(uid: string): UserProfile | null {
  const users = readUsers()
  return users.find((u) => u.profile.uid === uid)?.profile ?? null
}

export function localUpdateProfile(uid: string, patch: Partial<UserProfile>) {
  const users = readUsers()
  const idx = users.findIndex((u) => u.profile.uid === uid)
  if (idx >= 0) {
    users[idx].profile = { ...users[idx].profile, ...patch }
    writeUsers(users)
  }
}

export async function localChangePassword(uid: string, oldPassword: string, newPassword: string): Promise<void> {
  const users = readUsers()
  const idx = users.findIndex((u) => u.profile.uid === uid)
  if (idx < 0) throw new Error('Account not found.')
  const oldHash = await hash(oldPassword)
  if (oldHash !== users[idx].passwordHash) throw new Error('Current password is incorrect.')
  users[idx].passwordHash = await hash(newPassword)
  writeUsers(users)
}
