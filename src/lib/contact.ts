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

/** Enlace `mailto:` con asunto sugerido. */
export function buildMailtoUrl(email: string, subject?: string): string {
  const address = email.trim()
  if (!subject) return `mailto:${address}`
  return `mailto:${address}?subject=${encodeURIComponent(subject)}`
}

export const DEFAULT_MAIL_SUBJECT = 'Orientación sobre seguros'
