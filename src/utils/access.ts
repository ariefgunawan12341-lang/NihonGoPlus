import type { AccessType, UserProfile } from '../types'

export type AccessResult = 'granted' | 'needs-login' | 'needs-premium'

/** Central rule for the whole app: public content is open to guests, free
 *  content needs any signed-in account, premium content needs isPremium. */
export function checkAccess(accessType: AccessType | undefined, user: UserProfile | null): AccessResult {
  const type = accessType ?? 'public'
  if (type === 'public') return 'granted'
  if (type === 'free') return user ? 'granted' : 'needs-login'
  // premium
  if (!user) return 'needs-login'
  return user.premium ? 'granted' : 'needs-premium'
}

export function canAccess(accessType: AccessType | undefined, user: UserProfile | null): boolean {
  return checkAccess(accessType, user) === 'granted'
}
