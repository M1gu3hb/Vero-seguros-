import type { NextRequest } from 'next/server'

import { cspAdmin, cspPublica, nuevoNonce } from '@/lib/security'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const esAdmin = request.nextUrl.pathname.startsWith('/admin')

  /*
   * En el administrador cada respuesta lleva su propia firma, y la cabecera se
   * pone también en la petición: es de ahí de donde Next.js la toma para
   * firmar sus propios scripts. La página pública se genera de antemano y se
   * sirve igual a todo el mundo, así que no puede llevar una firma distinta
   * cada vez —y no le hace falta: no ejecuta nada que dependa de la sesión.
   */
  const csp = esAdmin ? cspAdmin(nuevoNonce()) : cspPublica()

  const response = await updateSession(
    request,
    esAdmin ? { 'content-security-policy': csp } : undefined,
  )
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    /*
     * Todas las rutas salvo archivos estáticos, imágenes optimizadas y
     * el favicon. El área pública también pasa por aquí para mantener la
     * cookie de sesión fresca cuando la administradora navega el sitio.
     */
    '/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|txt|xml)$).*)',
  ],
}
