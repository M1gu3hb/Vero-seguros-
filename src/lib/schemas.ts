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

/* ── Identidad y contacto ───────────────────────────────────────────────── */

export const identitySchema = z.object({
  brandName: trimmed(2, 80, 'Nombre'),
  brandRole: trimmed(2, 90, 'Cargo'),
  brandTagline: trimmed(2, 90, 'Frase de marca'),
  contactEmail: z.string().trim().email('El correo no es válido.').max(160),
  whatsappNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine(
      (value) => value.length >= 10 && value.length <= 15,
      'El número de WhatsApp debe tener entre 10 y 15 dígitos, incluyendo la clave del país (por ejemplo 52).',
    ),
  whatsappMessage: trimmed(10, 400, 'Mensaje de WhatsApp'),
  coverageText: trimmed(2, 90, 'Texto de cobertura'),
})

/* ── Hero ───────────────────────────────────────────────────────────────── */

export const heroSchema = z.object({
  heroEyebrow: trimmed(2, 90, 'Etiqueta'),
  heroTitle: trimmed(10, 160, 'Título'),
  heroDescription: trimmed(20, 500, 'Descripción'),
  heroPrimaryCta: trimmed(2, 40, 'Botón principal'),
  heroSecondaryCta: trimmed(2, 40, 'Botón secundario'),
  heroImageUrl: optionalUrl,
  heroImageAlt: optionalText(160),
})

/* ── Sobre Verónica ─────────────────────────────────────────────────────── */

export const aboutSchema = z.object({
  aboutTitle: trimmed(2, 90, 'Título'),
  aboutIntro: trimmed(20, 500, 'Introducción'),
  aboutBody: trimmed(20, 4000, 'Biografía'),
  aboutQuote: trimmed(10, 300, 'Cita'),
  aboutImageUrl: optionalUrl,
  aboutImageAlt: optionalText(160),
})

/* ── Promociones y formas de pago ───────────────────────────────────────── */

export const promosSchema = z.object({
  promosTitle: trimmed(2, 90, 'Título'),
  promosDescription: trimmed(20, 700, 'Descripción'),
  promosNote: trimmed(10, 400, 'Nota de condiciones'),
  promosVisible: z.boolean(),
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
  description: trimmed(10, 400, 'Descripción'),
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

export type IdentityInput = z.infer<typeof identitySchema>
export type HeroInput = z.infer<typeof heroSchema>
export type AboutInput = z.infer<typeof aboutSchema>
export type PromosInput = z.infer<typeof promosSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type InsurerInput = z.infer<typeof insurerSchema>
