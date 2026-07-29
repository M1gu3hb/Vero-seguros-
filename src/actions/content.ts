'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { z } from 'zod'

import { SITE_CONTENT_TAG } from '@/lib/data'
import {
  contactSchema,
  idSchema,
  imageSchema,
  insurerSchema,
  MAX_BYTES_LOTE,
  paymentTermsSchema,
  reorderSchema,
  serviceSchema,
  normalizeText,
  textsSchema,
} from '@/lib/schemas'
import { TEXT_BY_KEY } from '@/content/texts'
import type { SiteSettings } from '@/content/site-content'
import { createClient, getAdminUser } from '@/lib/supabase/server'
import type { SiteSettingsRow } from '@/lib/supabase/types'
import { type ActionState, errorState, successState } from './types'

/* ── Utilidades ─────────────────────────────────────────────────────────── */

/**
 * Toda mutación pasa por aquí. Aunque el middleware ya bloquea `/admin`, la
 * comprobación se repite en el servidor y, además, las políticas RLS la
 * aplican de nuevo en la base de datos.
 */
async function requireAdmin() {
  const { user, isAdmin } = await getAdminUser()
  if (!user || !isAdmin) return null
  return createClient()
}

const NOT_AUTHORIZED = 'Tu sesión no tiene permisos para editar el sitio. Vuelve a entrar.'

function flatten(error: z.ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    const list = result[key] ?? []
    list.push(issue.message)
    result[key] = list
  }
  return result
}

/** Invalida la caché del sitio público y refresca el panel. */
function refresh() {
  revalidateTag(SITE_CONTENT_TAG)
  revalidatePath('/')
  revalidatePath('/admin')
}

const text = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

const bool = (formData: FormData, key: string) => formData.get(key) === 'on' || formData.get(key) === 'true'

/** Campo repetido: todos los valores con ese nombre, en orden. */
const list = (formData: FormData, key: string) =>
  formData.getAll(key).filter((value): value is string => typeof value === 'string')

/**
 * De la propiedad que usa la interfaz a la columna que usa la base de datos.
 *
 * Sólo aparecen las frases que el catálogo de textos puede tocar: el resto de
 * los ajustes se guarda por su formulario, con su propia validación.
 */
const SETTINGS_COLUMNS = {
  brandName: 'brand_name',
  brandRole: 'brand_role',
  brandTagline: 'brand_tagline',
  coverageText: 'coverage_text',
  heroEyebrow: 'hero_eyebrow',
  heroTitle: 'hero_title',
  heroDescription: 'hero_description',
  heroPrimaryCta: 'hero_primary_cta',
  heroSecondaryCta: 'hero_secondary_cta',
  aboutTitle: 'about_title',
  aboutIntro: 'about_intro',
  aboutBody: 'about_body',
  aboutQuote: 'about_quote',
  promosTitle: 'promos_title',
  promosDescription: 'promos_description',
  promosNote: 'promos_note',
  promosInstallmentsLabel: 'promos_installments_label',
  promosFrequenciesLabel: 'promos_frequencies_label',
} as const satisfies Partial<Record<keyof SiteSettings, keyof SiteSettingsRow>>

/* ── Ajustes del sitio ──────────────────────────────────────────────────── */

async function updateSettings(
  values: Partial<SiteSettingsRow>,
  successMessage: string,
): Promise<ActionState> {
  const supabase = await requireAdmin()
  if (!supabase) return errorState(NOT_AUTHORIZED)

  const { error } = await supabase.from('site_settings').update(values).eq('id', 1)

  if (error) {
    console.error('[admin] error al guardar ajustes:', error)
    return errorState('No se pudo guardar. Revisa los datos e inténtalo de nuevo.')
  }

  refresh()
  return successState(successMessage)
}

/**
 * Las formas de contacto.
 *
 * El nombre, el cargo y la frase de marca ya no se guardan aquí: son texto de
 * la página y viajan con el resto, por `saveTexts`.
 */
export async function saveContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    contactEmail: text(formData, 'contactEmail'),
    whatsappNumber: text(formData, 'whatsappNumber'),
    whatsappMessage: text(formData, 'whatsappMessage'),
  })

  if (!parsed.success) {
    return errorState('Revisa los campos marcados.', flatten(parsed.error))
  }

  return updateSettings(
    {
      contact_email: parsed.data.contactEmail,
      whatsapp_number: parsed.data.whatsappNumber,
      whatsapp_message: parsed.data.whatsappMessage,
    },
    'Formas de contacto actualizadas.',
  )
}

export async function saveHeroImage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = imageSchema.safeParse({
    url: text(formData, 'heroImageUrl'),
    alt: text(formData, 'heroImageAlt'),
  })

  if (!parsed.success) {
    return errorState('Revisa la imagen.', flatten(parsed.error))
  }

  return updateSettings(
    { hero_image_url: parsed.data.url, hero_image_alt: parsed.data.alt },
    'Fotografía de inicio actualizada.',
  )
}

export async function saveAboutImage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = imageSchema.safeParse({
    url: text(formData, 'aboutImageUrl'),
    alt: text(formData, 'aboutImageAlt'),
  })

  if (!parsed.success) {
    return errorState('Revisa la imagen.', flatten(parsed.error))
  }

  return updateSettings(
    { about_image_url: parsed.data.url, about_image_alt: parsed.data.alt },
    'Fotografía actualizada.',
  )
}

export async function savePaymentTerms(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = paymentTermsSchema.safeParse({
    promosVisible: bool(formData, 'promosVisible'),
    promosInstallments: list(formData, 'promosInstallments'),
    promosFrequencies: list(formData, 'promosFrequencies'),
  })

  if (!parsed.success) {
    return errorState('Revisa los campos marcados.', flatten(parsed.error))
  }

  return updateSettings(
    {
      promos_visible: parsed.data.promosVisible,
      promos_installments: parsed.data.promosInstallments,
      promos_frequencies: parsed.data.promosFrequencies,
    },
    'Plazos y modalidades actualizados.',
  )
}

/* ── Servicios ──────────────────────────────────────────────────────────── */

export async function saveService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireAdmin()
  if (!supabase) return errorState(NOT_AUTHORIZED)

  const rawId = text(formData, 'id')
  const parsed = serviceSchema.safeParse({
    ...(rawId ? { id: rawId } : {}),
    name: text(formData, 'name'),
    slug: text(formData, 'slug'),
    description: text(formData, 'description'),
    detail: text(formData, 'detail'),
    icon: text(formData, 'icon') || 'proteccion',
    isVisible: bool(formData, 'isVisible'),
  })

  if (!parsed.success) {
    return errorState('Revisa los campos marcados.', flatten(parsed.error))
  }

  const values = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    detail: parsed.data.detail,
    icon: parsed.data.icon,
    is_visible: parsed.data.isVisible,
  }

  if (parsed.data.id) {
    const { error } = await supabase.from('services').update(values).eq('id', parsed.data.id)
    if (error) return errorState(describeError(error, 'servicio'))
    refresh()
    return successState('Servicio actualizado.')
  }

  // Nuevo servicio: se coloca al final de la lista.
  const { data: last } = await supabase
    .from('services')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase
    .from('services')
    .insert({ ...values, sort_order: (last?.sort_order ?? 0) + 1 })

  if (error) return errorState(describeError(error, 'servicio'))

  refresh()
  return successState('Servicio agregado.')
}

export async function deleteService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireAdmin()
  if (!supabase) return errorState(NOT_AUTHORIZED)

  const id = idSchema.safeParse(text(formData, 'id'))
  if (!id.success) return errorState('No se indicó qué servicio eliminar.')

  const { error } = await supabase.from('services').delete().eq('id', id.data)
  if (error) return errorState('No se pudo eliminar el servicio.')

  refresh()
  return successState('Servicio eliminado.')
}

export async function reorderServices(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return reorder(formData, 'services', 'Orden de los servicios actualizado.')
}

/* ── Aseguradoras ───────────────────────────────────────────────────────── */

export async function saveInsurer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireAdmin()
  if (!supabase) return errorState(NOT_AUTHORIZED)

  const rawId = text(formData, 'id')
  const parsed = insurerSchema.safeParse({
    ...(rawId ? { id: rawId } : {}),
    name: text(formData, 'name'),
    imageUrl: text(formData, 'imageUrl'),
    imageAlt: text(formData, 'imageAlt'),
    isVisible: bool(formData, 'isVisible'),
  })

  if (!parsed.success) {
    return errorState('Revisa los campos marcados.', flatten(parsed.error))
  }

  const values = {
    name: parsed.data.name,
    image_url: parsed.data.imageUrl,
    image_alt: parsed.data.imageAlt,
    is_visible: parsed.data.isVisible,
  }

  if (parsed.data.id) {
    const { error } = await supabase.from('insurers').update(values).eq('id', parsed.data.id)
    if (error) return errorState(describeError(error, 'aseguradora'))
    refresh()
    return successState('Aseguradora actualizada.')
  }

  const { data: last } = await supabase
    .from('insurers')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase
    .from('insurers')
    .insert({ ...values, sort_order: (last?.sort_order ?? 0) + 1 })

  if (error) return errorState(describeError(error, 'aseguradora'))

  refresh()
  return successState('Aseguradora agregada.')
}

export async function deleteInsurer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireAdmin()
  if (!supabase) return errorState(NOT_AUTHORIZED)

  const id = idSchema.safeParse(text(formData, 'id'))
  if (!id.success) return errorState('No se indicó qué aseguradora eliminar.')

  const { error } = await supabase.from('insurers').delete().eq('id', id.data)
  if (error) return errorState('No se pudo eliminar la aseguradora.')

  refresh()
  return successState('Aseguradora eliminada.')
}

export async function reorderInsurers(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return reorder(formData, 'insurers', 'Orden de las aseguradoras actualizado.')
}

/* ── Reordenamiento compartido ──────────────────────────────────────────── */

async function reorder(
  formData: FormData,
  table: 'services' | 'insurers',
  successMessage: string,
): Promise<ActionState> {
  const supabase = await requireAdmin()
  if (!supabase) return errorState(NOT_AUTHORIZED)

  const raw = formData.get('ids')
  const ids = typeof raw === 'string' ? raw.split(',').filter(Boolean) : []
  const parsed = reorderSchema.safeParse({ ids })

  if (!parsed.success) return errorState('No se pudo interpretar el nuevo orden.')

  const results = await Promise.all(
    parsed.data.ids.map((id, index) =>
      supabase
        .from(table)
        .update({ sort_order: index + 1 })
        .eq('id', id),
    ),
  )

  if (results.some((result) => result.error)) {
    return errorState('No se pudo guardar el nuevo orden.')
  }

  refresh()
  return successState(successMessage)
}

/* ── Mensajes de error legibles ─────────────────────────────────────────── */

function describeError(error: { code?: string; message?: string }, entity: string): string {
  if (error.code === '23505') {
    return `Ya existe otro ${entity} con ese identificador. Usa uno distinto.`
  }
  if (error.code === '23514') {
    return 'Alguno de los textos excede el largo permitido.'
  }
  console.error(`[admin] error al guardar ${entity}:`, error)
  return `No se pudo guardar el ${entity}. Inténtalo de nuevo.`
}

/* ── Textos de la página ────────────────────────────────────────────────── */

/**
 * Guarda un lote de frases.
 *
 * Llega un mapa de clave a texto, tal cual lo dejó el panel o la vista previa.
 * Aquí se reparte: las claves que corresponden a una columna de
 * `site_settings` se escriben ahí, y el resto va a `site_texts`. Quien edita
 * no tiene por qué saber de esa diferencia.
 */
export async function saveTexts(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await requireAdmin()
  if (!supabase) return errorState(NOT_AUTHORIZED)

  const bruto = text(formData, 'values') || '{}'
  if (bruto.length > MAX_BYTES_LOTE) {
    return errorState('El cambio es demasiado grande. Guarda por partes.')
  }

  let crudo: unknown
  try {
    crudo = JSON.parse(bruto)
  } catch {
    return errorState('No se pudo interpretar el cambio. Vuelve a intentarlo.')
  }

  const parsed = textsSchema.safeParse({ values: crudo })
  if (!parsed.success) return errorState('No hay nada que guardar.')

  const errores: Record<string, string[]> = {}
  const columnas: Partial<SiteSettingsRow> = {}
  const sueltos: { key: string; value: string }[] = []

  for (const [key, valor] of Object.entries(parsed.data.values)) {
    const entrada = TEXT_BY_KEY.get(key)
    if (!entrada) continue

    const limpio = normalizeText(valor).trim()

    if (limpio.length < entrada.min) {
      errores[key] = [`${entrada.label}: escribe al menos ${entrada.min} caracteres.`]
      continue
    }
    if (limpio.length > entrada.max) {
      errores[key] = [`${entrada.label}: máximo ${entrada.max} caracteres.`]
      continue
    }

    if (entrada.column) {
      const columna = SETTINGS_COLUMNS[entrada.column as keyof typeof SETTINGS_COLUMNS]
      if (columna) columnas[columna] = limpio as never
    } else {
      sueltos.push({ key, value: limpio })
    }
  }

  if (Object.keys(errores).length > 0) {
    return errorState('Revisa los textos marcados.', errores)
  }

  if (Object.keys(columnas).length > 0) {
    const { error } = await supabase.from('site_settings').update(columnas).eq('id', 1)
    if (error) {
      console.error('[admin] error al guardar textos en ajustes:', error)
      return errorState('No se pudo guardar. Inténtalo de nuevo.')
    }
  }

  if (sueltos.length > 0) {
    const { error } = await supabase.from('site_texts').upsert(sueltos, { onConflict: 'key' })
    if (error) {
      console.error('[admin] error al guardar textos:', error)
      return errorState('No se pudo guardar. Inténtalo de nuevo.')
    }
  }

  refresh()
  return successState('Textos actualizados.')
}
