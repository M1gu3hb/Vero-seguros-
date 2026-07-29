import { SUPABASE_URL } from '@/lib/supabase/config'

/**
 * Content Security Policy.
 *
 * Es la lista de lo que el navegador tiene permitido cargar y ejecutar en esta
 * página. Aunque hoy no haya por dónde colar código —React escapa todo lo que
 * escribe Verónica, y no hay ni un solo `innerHTML` con contenido editable—,
 * esta cabecera es la red por debajo: si algún día algo se colara, el
 * navegador se negaría a ejecutarlo.
 *
 * Hay dos políticas porque las dos mitades del sitio son distintas:
 *
 *  · La página pública se genera de antemano y se sirve igual a todo el
 *    mundo. Next.js incrusta ahí sus datos en etiquetas `<script>` sin
 *    firmar, así que necesita `unsafe-inline`. A cambio no habla con nadie:
 *    su `connect-src` es sólo el propio sitio.
 *
 *  · El administrador se genera en cada visita, así que cada respuesta puede
 *    llevar su propia firma —un `nonce` distinto cada vez— y sólo se ejecuta
 *    el código que la trae. Ahí sí desaparece `unsafe-inline`, que es donde
 *    de verdad importa: es la parte con sesión.
 */

const almacen = (() => {
  try {
    return new URL(SUPABASE_URL).origin
  } catch {
    return 'https://*.supabase.co'
  }
})()

/*
 * `style-src` conserva `unsafe-inline` en las dos: las animaciones escriben
 * estilos en línea sobre los elementos mientras se mueven, y un estilo no
 * ejecuta código.
 */
const comunes = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${almacen}`,
  "font-src 'self' data:",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  'upgrade-insecure-requests',
]

/** La página pública: no necesita hablar con nadie, ni siquiera con Supabase. */
export function cspPublica(): string {
  return [...comunes, "script-src 'self' 'unsafe-inline'", "connect-src 'self'"].join('; ')
}

/**
 * El administrador: sólo se ejecuta el código firmado con el `nonce` de esta
 * respuesta. `strict-dynamic` deja que ese código cargue sus propios trozos,
 * que es como Next.js reparte la aplicación.
 */
export function cspAdmin(nonce: string): string {
  return [
    ...comunes,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `connect-src 'self' ${almacen}`,
  ].join('; ')
}

/** Una firma nueva por respuesta. */
export function nuevoNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}
