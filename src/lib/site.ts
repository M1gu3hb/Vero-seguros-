/**
 * URL canónica del sitio.
 *
 * Se configura con `NEXT_PUBLIC_SITE_URL`. En Vercel, si no está definida, se
 * usa el dominio de producción que la plataforma expone automáticamente.
 */
export const SITE_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`

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
