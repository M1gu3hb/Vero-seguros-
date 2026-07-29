/**
 * URL canónica del sitio.
 *
 * De aquí salen la dirección canónica, la de compartir en redes, el
 * `robots.txt` y el mapa del sitio. Si se equivoca, Google indexa una
 * dirección que ya no es y la vista previa de WhatsApp se rompe.
 *
 * **En Vercel manda el dominio que la propia plataforma considera principal.**
 * Es deliberado, y va contra la costumbre de que una variable explícita gane
 * siempre: `NEXT_PUBLIC_SITE_URL` es una copia escrita a mano del dominio, y
 * una copia se queda vieja. Pasó: al renombrar el dominio del proyecto, la
 * variable siguió apuntando al anterior y todos los metadatos se quedaron
 * señalando una dirección que ya sólo redirige. `VERCEL_PROJECT_PRODUCTION_URL`
 * la mantiene la plataforma, así que cambia con el dominio y no hay nada que
 * recordar.
 *
 * Fuera de Vercel —en local, o en cualquier otro alojamiento— sí manda
 * `NEXT_PUBLIC_SITE_URL`, que es donde hace falta poder decirlo a mano.
 */
export const SITE_URL = (() => {
  const limpiar = (valor: string) => valor.trim().replace(/\/$/, '')

  const deVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (deVercel) return `https://${limpiar(deVercel)}`

  const aMano = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (aMano) return limpiar(aMano)

  return 'http://localhost:3000'
})()

/** Secciones del sitio, en el orden en que aparecen. */
export const SECTIONS = {
  hero: 'inicio',
  services: 'seguros',
  human: 'sentido-humano',
  process: 'proceso',
  about: 'sobre-veronica',
  insurers: 'aseguradoras',
  payments: 'pagos',
  contact: 'contacto',
} as const

/** Enlaces de la navegación principal. */
export const NAV_LINKS = [
  { href: `#${SECTIONS.hero}`, label: 'Inicio' },
  { href: `#${SECTIONS.services}`, label: 'Seguros' },
  { href: `#${SECTIONS.about}`, label: 'Sobre mí' },
  { href: `#${SECTIONS.insurers}`, label: 'Aseguradoras' },
  { href: `#${SECTIONS.contact}`, label: 'Contacto' },
] as const
