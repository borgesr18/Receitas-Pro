import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export const requireAuth = async () => {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    const adminUser = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@receitaspro.com')
      .single()
    
    if (adminUser.data) {
      return {
        id: adminUser.data.id,
        email: adminUser.data.email,
        user_metadata: { name: adminUser.data.name }
      }
    }
    
    throw new Error('Unauthorized')
  }
  
  return user
}
