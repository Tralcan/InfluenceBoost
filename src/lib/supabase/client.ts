import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: any;

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL') || !supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.warn('Supabase credentials not found or are placeholders. The app will run without database connectivity. Please update your .env file.')
  
  // Create a mock client if credentials are not available
  supabaseInstance = {
    from: () => ({
      select: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
      insert: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
      update: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
      delete: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
      rpc: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
    }),
  };
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseInstance;
