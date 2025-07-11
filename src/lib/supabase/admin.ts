import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL') || !supabaseServiceRoleKey || supabaseServiceRoleKey.includes('YOUR_SUPABASE_SERVICE_ROLE_KEY')) {
  // We don't log a warning here because the admin client might not be needed everywhere.
}

// Nota: este cliente solo debe usarse en entornos de servidor (Server Components, Route Handlers, Server Actions).
// La variable de entorno SUPABASE_SERVICE_ROLE_KEY debe estar configurada.
export const supabaseAdmin = (supabaseUrl && !supabaseUrl.includes('YOUR_SUPABASE_URL') && supabaseServiceRoleKey && !supabaseServiceRoleKey.includes('YOUR_SUPABASE_SERVICE_ROLE_KEY'))
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : {
      from: () => {
        console.error('Supabase admin client is not initialized.');
        return {
          select: async () => ({ error: { message: 'Supabase admin not initialized' }, data: null }),
          insert: async () => ({ error: { message: 'Supabase admin not initialized' }, data: null }),
          update: async () => ({ error: { message: 'Supabase admin not initialized' }, data: null }),
          delete: async () => ({ error: { message: 'Supabase admin not initialized' }, data: null }),
          rpc: async () => ({ error: { message: 'Supabase admin not initialized' }, data: null }),
        };
      },
       rpc: async () => ({ error: { message: 'Supabase admin not initialized' }, data: null }),
    } as any;
