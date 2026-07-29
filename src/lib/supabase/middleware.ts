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
export async function updateSession(request: NextRequest, extra?: Record<string, string>) {
  /*
   * Las cabeceras extra viajan hacia dentro, hasta el servidor que pinta la
   * página: es así como la firma de la política de seguridad llega a los
   * scripts que genera Next.js.
   *
   * Se reconstruyen en cada llamada, y no una sola vez, porque entre medias
   * `request.cookies.set` puede haber renovado la sesión y esa cookie nueva
   * tiene que ir dentro.
   */
  const entrada = () => {
    if (!extra) return { request }
    const cabeceras = new Headers(request.headers)
    for (const [nombre, valor] of Object.entries(extra)) cabeceras.set(nombre, valor)
    return { request: { headers: cabeceras } }
  }

  let response = NextResponse.next(entrada())

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next(entrada())
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
