import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// A function that returns a mock Supabase client when credentials are not available.
const createMockSupabaseClient = () => {
  const handler = {
    get(target: any, prop: any) {
      if (prop === 'from') {
        return () => {
          const chainable = {
            select: () => chainable,
            insert: () => chainable,
            update: () => chainable,
            delete: () => chainable,
            eq: () => chainable,
            order: () => chainable,
            single: () => chainable,
            then: (resolve: (value: { data: any, error: null }) => void) => {
               if (prop === 'select') {
                return Promise.resolve(resolve({ data: [], error: null }));
              }
              return Promise.resolve(resolve({ data: null, error: null }));
            },
          };
          return chainable;
        };
      }
      if (prop === 'auth') {
        return {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        };
      }
      return () => {};
    },
  };
  return new Proxy({}, handler);
};

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not found. Using mock client for server-side operations.");
    return createMockSupabaseClient();
  }

  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
