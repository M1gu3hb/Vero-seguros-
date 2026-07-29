import { z } from 'zod'

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

const optionalUrl = z
  .union([z.string().trim().url('La dirección de la imagen no es válida.'), z.literal('')])
  .nullish()
  .transform((value) => (value ? value : null))

/*
 * Los logotipos que vienen con el proyecto viven en `public/brand/`, así que
 * aquí se admite tanto una URL absoluta (lo que sube el CMS a Supabase
 * Storage) como una ruta del propio sitio.
 */
const optionalImageRef = z
  .union([
    z.string().trim().url(),
    z.string().trim().regex(/^\/[a-zA-Z0-9][^\s]*$/, 'La ruta de la imagen no es válida.'),
    z.literal(''),
  ])
  .nullish()
  .transform((value) => (value ? value : null))

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
 * aquí sólo se comprueba la forma: claves conocidas y texto no vacío. La
 * comprobación fina va en la acción, que sí tiene el catálogo a mano.
 */
export const textsSchema = z.object({
  values: z
    .record(z.string(), z.string())
    .refine((value) => Object.keys(value).length > 0, 'No hay nada que guardar.'),
})

/* ── Reordenamiento ─────────────────────────────────────────────────────── */

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'No hay elementos que ordenar.').max(200),
})

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
