import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { MASTER_ADMIN_EMAILS } from '@/lib/security/constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // SECURITY: Validate `next` is a safe relative path to prevent open redirects.
  // Reject anything starting with // (protocol-relative), http, or containing @
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = /^\/[^/\\]/.test(rawNext) && !rawNext.includes('//') ? rawNext : '/dashboard'


  if (code) {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    const supabase = createServerClient(
      supabaseUrl!,
      supabaseKey!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      try {
        const u = sessionData?.user
        if (u?.email) {
          await supabase.from('user').upsert([{
            id: u.id,
            email: u.email.toLowerCase(),
            name: u.user_metadata?.full_name || u.email.split('@')[0],
            role: MASTER_ADMIN_EMAILS.includes(u.email.toLowerCase()) ? 'admin' : 'user',
            emailVerified: true,
            createdAt: u.created_at || new Date().toISOString()
          }])
        }
      } catch (err) {
        console.warn('Could not sync OAuth user to public table:', err)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
