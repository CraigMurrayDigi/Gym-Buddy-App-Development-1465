import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
const SUPABASE_URL = 'https://elwbaglqfqemozmdvqal.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsd2JhZ2xxZnFlbW96bWR2cWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTcyMTEsImV4cCI6MjA2NjYzMzIxMX0.S_zrMoDGIYbjozjJkrXLKFJTjk43WePSF6Nhk9QJmlo'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

console.log('🔧 Initializing Supabase with URL:', SUPABASE_URL)
console.log('🔑 Using Supabase Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...')

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Add email confirmation settings
    confirmEmailRedirectTo: window.location.origin
  }
})

// Test connection and setup
console.log('🧪 Testing Supabase connection...')
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error)
  } else {
    console.log('✅ Supabase connected successfully')
    
    // Test database access
    supabase
      .from('profiles_gym2024')
      .select('count', { count: 'exact', head: true })
      .then(({ count, error: dbError }) => {
        if (dbError) {
          console.error('❌ Database access error:', dbError)
        } else {
          console.log('✅ Database accessible, profile count:', count)
        }
      })
  }
})

export default supabase