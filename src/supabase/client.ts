import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const IS_SUPABASE_CONFIGURED = !!(supabaseUrl && supabaseAnonKey)

let client: SupabaseClient | null = null

if (USE_SUPABASE) {
  if (!IS_SUPABASE_CONFIGURED) {
    console.error(
      '[NihonGoPlus] VITE_USE_SUPABASE=true but Supabase env vars are missing.',
      { url: !!supabaseUrl, key: !!supabaseAnonKey }
    )
  } else {
    try {
      client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
      console.log('[NihonGoPlus] Supabase client initialized successfully.')
    } catch (err) {
      console.error('[NihonGoPlus] Failed to initialize Supabase client:', err)
    }
  }
} else {
  console.log('[NihonGoPlus] Running in LOCAL mode (VITE_USE_SUPABASE=false).')
}

export const supabase = client

export const STORAGE_BUCKETS = {
  images: 'images',
  audio: 'audio',
  video: 'video',
  pdf: 'pdf',
  modules: 'modules'
} as const
