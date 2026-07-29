import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'
import type { Database } from './types'

/**
 * Cliente de Supabase para el servidor (Server Components, Server Actions y
 * Route Handlers). La sesión viaja en cookies httpOnly gestionadas por
 * @supabase/ssr.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // `setAll` falla cuando se llama desde un Server Component; el
          // middleware ya se encarga de refrescar la sesión, así que es
          // seguro ignorarlo.
        }
      },
    },
  })
}

/**
 * Devuelve el usuario autenticado y si pertenece a `admin_users`.
 *
 * La comprobación se hace siempre contra el servidor de autenticación
 * (`getUser`, no `getSession`) y contra la base de datos mediante `is_admin()`.
 */
export async function getAdminUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, isAdmin: false as const }

  const { data, error } = await supabase.rpc('is_admin')

  return { user, isAdmin: !error && data === true }
}
