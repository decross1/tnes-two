import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// In development, we'll use placeholder values and handle errors gracefully
const isDevelopment = supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // We're using anonymous users
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Export development flag for components to handle gracefully
export { isDevelopment }