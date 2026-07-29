import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'
import type { Database } from './types'

/**
 * Refresca la sesión en cada petición y protege el área de administración.
 *
 * Reglas:
 *  · `/admin/*` sin sesión válida → `/admin/login`.
 *  · `/admin/login` con sesión válida → `/admin`.
 *
 * La pertenencia a `admin_users` se vuelve a comprobar en el servidor (y las
 * políticas RLS la aplican en la base de datos), así que esto es sólo la
 * primera barrera, no la única.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isLoginRoute = pathname === '/admin/login'
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}
