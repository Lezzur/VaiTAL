import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate keys to prevent crash during build/scaffold
const hasKeys = supabaseUrl && supabaseAnonKey

if (!hasKeys) {
  console.warn("Supabase keys missing. Using mock client for build safety.")
}

export const supabase = hasKeys
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
    // Mock interface to prevent "undefined" errors during build
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ error: { message: "Supabase keys missing" } }),
      signUp: async () => ({ error: { message: "Supabase keys missing" } })
    },
    from: () => ({
      select: () => ({
        // Daisy chain mocks
        order: () => ({ limit: () => ({ single: async () => ({ data: null }) }) }),
        limit: () => ({ single: async () => ({ data: null }) }),
        execute: async () => ({ data: [], count: 0 })
      }),
      insert: () => ({
        select: () => ({ single: async () => ({ data: {}, error: new Error("Keys missing") }) })
      })
    })
  }
