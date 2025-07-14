import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: any;

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL') || !supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.warn('Supabase credentials not found or are placeholders. The app will run without database connectivity. Please update your .env file.')

  // Create a more robust mock client to better mimic the Supabase query builder
  const mockQueryBuilder = {
    select: function() { return this; },
    insert: function() { return this; },
    update: function() { return this; },
    delete: function() { return this; },
    eq: function() { return this; },
    order: function() { return this; },
    single: function() {
      return Promise.resolve({ data: {}, error: null });
    },
    maybeSingle: function() {
      return Promise.resolve({ data: null, error: null });
    },
    // The 'then' method makes the object "thenable", allowing it to be awaited
    then: function(resolve: (value: { data: any[]; error: null; }) => void) {
      // For general queries that return lists, resolve with an empty array.
      resolve({ data: [], error: null });
    },
  };
  
  supabaseInstance = {
    from: () => mockQueryBuilder,
  };

} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseInstance;
