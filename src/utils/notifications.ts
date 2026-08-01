// Real, working browser notifications (Notification API) for reminders while
// the app is open or backgrounded in a tab. This is NOT the same as true
// push notifications delivered when the app/browser is fully closed — that
// requires a dedicated push provider (Web Push API + a service worker, or a
// third-party service like OneSignal) wired to a Supabase Edge Function /
// scheduled job. That's a real follow-up project, not something faked here.

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendTestReminder(body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('NihonGoPlus', { body, icon: '/icons/icon-192.png' })
  }
}

/** Returns a reminder message if the user's streak is at risk of breaking today, else null. */
export function streakRiskMessage(lastStudyDate: string | null, streak: number): string | null {
  if (!lastStudyDate || streak === 0) return null
  const today = new Date().toISOString().slice(0, 10)
  if (lastStudyDate === today) return null // already studied today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (lastStudyDate !== yesterday) return null // streak already broken, not "at risk"
  const hour = new Date().getHours()
  if (hour < 18) return null // only nudge in the evening
  return `Your ${streak}-day streak is about to break! Do a quick review to keep it alive.`
}
