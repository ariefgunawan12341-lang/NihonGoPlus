const THEME_KEY = 'ngp-theme'

export function getStoredTheme(): 'light' | 'dark' {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') ?? 'light'
}

export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(THEME_KEY, theme)
}

/** Call once at app bootstrap, before the first paint, to avoid a light-mode flash. */
export function initTheme() {
  applyTheme(getStoredTheme())
}
