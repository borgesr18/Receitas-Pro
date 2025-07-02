import { createClient } from '@supabase/supabase-js'

const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      console.warn('Supabase environment variables not available during build')
      return null
    }
    throw new Error('Supabase environment variables are required')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()
