import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mnuwvfelcoybbnhqathh.supabase.co"
                        
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseKey) {
  console.error('Supabase Key:', supabaseKey)
  throw new Error('Missing VITE_SUPABASE_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
}) 