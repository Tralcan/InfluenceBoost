import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL') || !supabaseAnonKey) {
  console.warn('Supabase credentials not found or are placeholders. Please update your .env file.')
}

export const supabase = (supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => {
        console.error('Supabase client is not initialized.');
        return {
          select: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
          insert: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
          update: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
          delete: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
          rpc: async () => ({ error: { message: 'Supabase not initialized' }, data: null }),
        };
      },
    } as any;
