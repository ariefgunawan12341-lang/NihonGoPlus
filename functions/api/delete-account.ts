import { createClient } from '@supabase/supabase-js'

interface DeleteAccountBody {
  accessToken?: string
}

export async function onRequest({ request, env }: { request: Request; env: { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string } }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let accessToken = ''
  const authHeader = request.headers.get('authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.slice('Bearer '.length).trim()
  }

  if (!accessToken) {
    try {
      const body = (await request.json()) as DeleteAccountBody
      accessToken = typeof body.accessToken === 'string' ? body.accessToken : ''
    } catch {
      accessToken = ''
    }
  }

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Missing access token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const supabaseUrl = env.SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: 'Server-side Supabase credentials are not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    const { data: { user }, error: userError } = await adminClient.auth.getUser(accessToken)
    if (userError || !user?.id) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { error: profileDeleteError } = await adminClient.from('profiles').delete().eq('id', user.id)
    if (profileDeleteError) {
      throw profileDeleteError
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      throw deleteError
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to delete account' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
