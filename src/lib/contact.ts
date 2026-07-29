/**
 * Construcción de los enlaces de contacto.
 *
 * El número de WhatsApp nunca se escribe en la interfaz: sólo se usa aquí
 * para formar el enlace `wa.me`.
 */

/** Deja únicamente dígitos; wa.me no acepta espacios, signos ni el prefijo «+». */
export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, '')
}

/**
 * Enlace de WhatsApp con mensaje prellenado.
 * Devuelve `null` si el número no tiene un formato utilizable, para que la
 * interfaz pueda ocultar el botón en lugar de mostrar un enlace roto.
 */
export function buildWhatsAppUrl(rawNumber: string, message: string): string | null {
  const digits = normalizeWhatsAppNumber(rawNumber)
  if (digits.length < 10 || digits.length > 15) return null

  const text = message.trim()
  const query = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${query}`
}

/** Enlace `mailto:` con asunto y cuerpo sugeridos. */
export function buildMailtoUrl(email: string, subject?: string, body?: string): string {
  const address = email.trim()
  const query = new URLSearchParams()
  if (subject) query.set('subject', subject)
  if (body?.trim()) query.set('body', body.trim())
  const search = query.toString()
  return search ? `mailto:${address}?${search}` : `mailto:${address}`
}

/**
 * Ventana de redacción de Gmail, ya dirigida a Verónica.
 *
 * Es el respaldo para quien abre la página en una computadora sin programa de
 * correo configurado: ahí `mailto:` no hace absolutamente nada y el botón
 * parecía roto. Sólo se usa cuando se comprueba que nada respondió al enlace.
 */
export function buildWebmailUrl(email: string, subject?: string, body?: string): string {
  const url = new URL('https://mail.google.com/mail/')
  url.searchParams.set('view', 'cm')
  url.searchParams.set('fs', '1')
  url.searchParams.set('to', email.trim())
  if (subject) url.searchParams.set('su', subject)
  if (body?.trim()) url.searchParams.set('body', body.trim())
  return url.toString()
}

export const DEFAULT_MAIL_SUBJECT = 'Orientación sobre seguros'
