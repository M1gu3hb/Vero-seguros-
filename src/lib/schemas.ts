import { z } from 'zod'

import { SUPABASE_URL } from '@/lib/supabase/config'

/**
 * Validación compartida entre el formulario (cliente) y las Server Actions
 * (servidor). Los límites coinciden con los `check` de la base de datos, de
 * modo que un dato inválido se detiene en las tres capas.
 */

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label}: mínimo ${min} caracteres.`)
    .max(max, `${label}: máximo ${max} caracteres.`)

/**
 * Igual que `trimmed`, pero normalizando los saltos de línea.
 *
 * El navegador envía el contenido de un `textarea` con saltos CRLF (`\r\n`),
 * así que un texto escrito con párrafos se guardaba como `\r\n\r\n` y la
 * separación en párrafos dejaba de reconocerse. Aquí se unifica a `\n` y se
 * limitan los saltos seguidos a dos, que es lo que significa «párrafo nuevo».
 */
export function normalizeText(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n')
}

const multiline = (min: number, max: number, label: string) =>
  z.string().transform(normalizeText).pipe(trimmed(min, max, label))

/**
 * ¿Es una imagen que este sitio puede servir?
 *
 * Sólo dos procedencias: el almacenamiento del propio proyecto —donde va a
 * parar lo que se sube desde el administrador— y las rutas del propio sitio,
 * que es donde viven los logotipos que vienen con el proyecto.
 *
 * Se comprueba aquí y no sólo en el navegador porque una dirección pegada a
 * mano podría apuntar a cualquier servidor: la página cargaría una imagen de
 * un tercero, que vería la dirección de cada visitante y podría cambiarla por
 * otra cosa cuando quisiera. Es además la misma lista que admite el
 * optimizador de imágenes, así que una dirección de fuera ni siquiera llegaría
 * a verse.
 */
const ALMACEN_PERMITIDO = (() => {
  try {
    return new URL(SUPABASE_URL).hostname
  } catch {
    return null
  }
})()

export function esImagenPermitida(value: string): boolean {
  if (value.startsWith('/')) return /^\/[a-zA-Z0-9][^\s]*$/.test(value)

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }

  if (url.protocol !== 'https:') return false
  if (!url.pathname.startsWith('/storage/v1/object/public/')) return false

  return ALMACEN_PERMITIDO
    ? url.hostname === ALMACEN_PERMITIDO
    : url.hostname.endsWith('.supabase.co')
}

const MENSAJE_IMAGEN =
  'La imagen tiene que estar subida desde este mismo administrador. No se admiten direcciones de otros sitios.'

const optionalUrl = z
  .union([z.string().trim(), z.literal('')])
  .nullish()
  .transform((value) => (value ? value : null))
  .refine((value) => value === null || esImagenPermitida(value), MENSAJE_IMAGEN)

/*
 * Los logotipos que vienen con el proyecto viven en `public/brand/`, así que
 * aquí se admite tanto el almacenamiento del proyecto —lo que sube el CMS—
 * como una ruta del propio sitio.
 */
const optionalImageRef = optionalUrl

const optionalText = (max: number) =>
  z
    .union([z.string().trim().max(max, `Máximo ${max} caracteres.`), z.literal('')])
    .nullish()
    .transform((value) => (value ? value : null))

/**
 * Texto largo opcional: o está vacío, o cumple el mínimo.
 *
 * Se usa para el detalle de cada seguro, que puede no existir todavía pero,
 * si existe, tiene que decir algo.
 */
const optionalMultiline = (min: number, max: number, label: string) =>
  z
    .string()
    .nullish()
    .transform((value) => (value ?? '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim())
    .refine(
      (value) => value === '' || value.length >= min,
      `${label}: escribe al menos ${min} caracteres o déjalo en blanco.`,
    )
    .refine((value) => value.length <= max, `${label}: máximo ${max} caracteres.`)
    .transform((value) => (value === '' ? null : value))

/**
 * Lista editable de textos breves.
 *
 * Llega del formulario como un campo repetido: cada renglón es un elemento.
 * Los vacíos se descartan, de modo que borrar el contenido de un renglón
 * equivale a quitarlo.
 */
const shortList = (max: number, label: string) =>
  z
    .array(z.string())
    .transform((values) => values.map((value) => value.trim()).filter(Boolean))
    .refine(
      (values) => values.every((value) => value.length <= 40),
      `${label}: cada elemento admite hasta 40 caracteres.`,
    )
    .refine((values) => values.length <= max, `${label}: como máximo ${max} elementos.`)

/* ── Identidad y contacto ───────────────────────────────────────────────── */

export const contactSchema = z.object({
  contactEmail: z.string().trim().email('El correo no es válido.').max(160),
  whatsappNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine(
      (value) => value.length >= 10 && value.length <= 15,
      'El número de WhatsApp debe tener entre 10 y 15 dígitos, incluyendo la clave del país (por ejemplo 52).',
    ),
  whatsappMessage: multiline(10, 400, 'Mensaje de WhatsApp'),
})

/* ── Fotografías ────────────────────────────────────────────────────────── */

export const imageSchema = z.object({
  url: optionalUrl,
  alt: optionalText(160),
})

/* ── Plazos y visibilidad de las formas de pago ─────────────────────────── */

export const paymentTermsSchema = z.object({
  promosVisible: z.boolean(),
  promosInstallments: shortList(12, 'Plazos'),
  promosFrequencies: shortList(12, 'Modalidades'),
})

/* ── Servicios ──────────────────────────────────────────────────────────── */

export const slugSchema = z
  .string()
  .trim()
  .min(2, 'El identificador debe tener al menos 2 caracteres.')
  .max(60, 'El identificador es demasiado largo.')
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Usa sólo minúsculas, números y guiones (por ejemplo: gastos-medicos).',
  )

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: trimmed(2, 80, 'Nombre'),
  slug: slugSchema,
  description: multiline(10, 400, 'Descripción'),
  detail: optionalMultiline(40, 900, 'Qué cubre'),
  icon: trimmed(1, 40, 'Icono'),
  isVisible: z.boolean(),
})

/* ── Aseguradoras ───────────────────────────────────────────────────────── */

export const insurerSchema = z.object({
  id: z.string().uuid().optional(),
  name: trimmed(1, 60, 'Nombre'),
  imageUrl: optionalImageRef,
  imageAlt: optionalText(160),
  isVisible: z.boolean(),
})

/* ── Textos por clave ───────────────────────────────────────────────────── */

/**
 * Un lote de frases, tal como sale del administrador.
 *
 * El largo de cada una lo fija el catálogo (`src/content/texts.ts`), así que
 * aquí sólo se comprueba la forma. La comprobación fina va en la acción, que
 * sí tiene el catálogo a mano.
 *
 * Los topes de cantidad y de tamaño no están por si Verónica escribe de más
 * —el catálogo entero no llega a cien frases—, sino porque este campo llega
 * como JSON y no debería poder crecer sin límite.
 */
export const MAX_TEXTOS_POR_LOTE = 200
export const MAX_LARGO_TEXTO = 4000
/** Tope del campo JSON completo, antes siquiera de interpretarlo. */
export const MAX_BYTES_LOTE = 256 * 1024

export const textsSchema = z.object({
  values: z
    .record(z.string().max(120), z.string().max(MAX_LARGO_TEXTO, 'Ese texto es demasiado largo.'))
    .refine((value) => Object.keys(value).length > 0, 'No hay nada que guardar.')
    .refine(
      (value) => Object.keys(value).length <= MAX_TEXTOS_POR_LOTE,
      'Demasiados textos en un mismo guardado.',
    ),
})

/* ── Reordenamiento y borrado ───────────────────────────────────────────── */

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'No hay elementos que ordenar.').max(200),
})

/** Un identificador que llega de un formulario, antes de tocar la base. */
export const idSchema = z.string().uuid('El identificador no es válido.')

/* ── Sesión ─────────────────────────────────────────────────────────────── */

export const loginSchema = z.object({
  email: z.string().trim().email('Escribe un correo válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(200),
})

export const passwordChangeSchema = z
  .object({
    password: z
      .string()
      .min(10, 'Usa al menos 10 caracteres.')
      .max(200, 'La contraseña es demasiado larga.'),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirm'],
  })

/* ── Medios ─────────────────────────────────────────────────────────────── */

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export type ContactInput = z.infer<typeof contactSchema>
export type ImageInput = z.infer<typeof imageSchema>
export type PaymentTermsInput = z.infer<typeof paymentTermsSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type InsurerInput = z.infer<typeof insurerSchema>
