import { createClient } from '@supabase/supabase-js'

// Nota: este cliente solo debe usarse en entornos de servidor (Server Components, Route Handlers, Server Actions).
// La variable de entorno SUPABASE_SERVICE_ROLE_KEY debe estar configurada.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
