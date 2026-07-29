import type { NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
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
