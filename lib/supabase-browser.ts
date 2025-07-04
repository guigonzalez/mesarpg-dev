import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client for browser usage
export const createClientComponentClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
