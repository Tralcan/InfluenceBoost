import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: any;

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL') || !supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.warn('Supabase credentials not found or are placeholders. The app will run without database connectivity. Please update your .env file.')
  
  // Create a mock client that mimics the Supabase query builder for chainable methods
  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    single: () => Promise.resolve({ data: {}, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
  };

  const mockRpcBuilder = {
    rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not initialized' } }),
  };
  
  supabaseInstance = {
    from: () => mockQueryBuilder,
    ...mockRpcBuilder,
  };

} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseInstance;
