import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// A function that returns a mock Supabase client when credentials are not available.
// This prevents the app from crashing during development or build time.
const createMockSupabaseClient = () => {
  const handler = {
    get(target: any, prop: any) {
      if (prop === 'from') {
        // Return a function for .from() that returns a chainable object
        return () => {
          const chainable = {
            select: () => chainable,
            insert: () => chainable,
            update: () => chainable,
            delete: () => chainable,
            eq: () => chainable,
            order: () => chainable,
            single: () => chainable,
            // .then() is called by await. We return a promise that resolves to an empty result.
            then: (resolve: (value: { data: any[], error: null }) => void) => {
              // For select queries, it's safer to return an empty array.
              if (prop === 'select') {
                return Promise.resolve(resolve({ data: [], error: null }));
              }
              // For other operations, null is fine.
              return Promise.resolve(resolve({ data: null, error: null }));
            },
          };
          return chainable;
        };
      }
      if (prop === 'auth') {
        // Mock auth methods to avoid errors
        return {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithOAuth: () => Promise.resolve({}),
          signOut: () => Promise.resolve({}),
        };
      }
      // Default behavior for other properties
      return () => {};
    },
  };
  return new Proxy({}, handler);
};


export const supabase = 
  supabaseUrl && supabaseAnonKey
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createMockSupabaseClient();
