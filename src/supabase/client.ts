import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Supabase is only initialized when explicitly enabled via env vars, exactly
// like the previous Firebase toggle worked. This keeps the app fully
// runnable with zero external setup (local/demo mode) while making the
// switch to a real Supabase project a one-file config change.
export const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

if (USE_SUPABASE) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[NihonGoPlus] VITE_USE_SUPABASE=true but Supabase env vars are missing. ' +
        'Fill in .env (see .env.example) with your Supabase project URL and anon key.'
    )
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
}

export const supabase = client

export const STORAGE_BUCKETS = {
  images: 'images',
  audio: 'audio',
  video: 'video',
  pdf: 'pdf',
  modules: 'modules'
} as const
