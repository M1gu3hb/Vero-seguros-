'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { z } from 'zod'

import { SITE_CONTENT_TAG } from '@/lib/data'
import {
  aboutSchema,
  heroSchema,
  identitySchema,
  insurerSchema,
  promosSchema,
  reorderSchema,
  serviceSchema,
} from '@/lib/schemas'
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

export async function saveIdentity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = identitySchema.safeParse({
    brandName: text(formData, 'brandName'),
    brandRole: text(formData, 'brandRole'),
    brandTagline: text(formData, 'brandTagline'),
    contactEmail: text(formData, 'contactEmail'),
    whatsappNumber: text(formData, 'whatsappNumber'),
    whatsappMessage: text(formData, 'whatsappMessage'),
    coverageText: text(formData, 'coverageText'),
  })

  if (!parsed.success) {
    return errorState('Revisa los campos marcados.', flatten(parsed.error))
  }

  return updateSettings(
    {
      brand_name: parsed.data.brandName,
      brand_role: parsed.data.brandRole,
      brand_tagline: parsed.data.brandTagline,
      contact_email: parsed.data.contactEmail,
      whatsapp_number: parsed.data.whatsappNumber,
      whatsapp_message: parsed.data.whatsappMessage,
      coverage_text: parsed.data.coverageText,
    },
    'Identidad y contacto actualizados.',
  )
}

export async function saveHero(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = heroSchema.safeParse({
    heroEyebrow: text(formData, 'heroEyebrow'),
    heroTitle: text(formData, 'heroTitle'),
    heroDescription: text(formData, 'heroDescription'),
    heroPrimaryCta: text(formData, 'heroPrimaryCta'),
    heroSecondaryCta: text(formData, 'heroSecondaryCta'),
    heroImageUrl: text(formData, 'heroImageUrl'),
    heroImageAlt: text(formData, 'heroImageAlt'),
  })

  if (!parsed.success) {
    return errorState('Revisa los campos marcados.', flatten(parsed.error))
  }

  return updateSettings(
    {
      hero_eyebrow: parsed.data.heroEyebrow,
      hero_title: parsed.data.heroTitle,
      hero_description: parsed.data.heroDescription,
      hero_primary_cta: parsed.data.heroPrimaryCta,
      hero_secondary_cta: parsed.data.heroSecondaryCta,
      hero_image_url: parsed.data.heroImageUrl,
      hero_image_alt: parsed.data.heroImageAlt,
    },
    'Sección de inicio actualizada.',
  )
}

export async function saveAbout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = aboutSchema.safeParse({
    aboutTitle: text(formData, 'aboutTitle'),
    aboutIntro: text(formData, 'aboutIntro'),
    aboutBody: text(formData, 'aboutBody'),
    aboutQuote: text(formData, 'aboutQuote'),
    aboutImageUrl: text(formData, 'aboutImageUrl'),
    aboutImageAlt: text(formData, 'aboutImageAlt'),
  })

  if (!parsed.success) {
    return errorState('Revisa los campos marcados.', flatten(parsed.error))
  }

  return updateSettings(
    {
      about_title: parsed.data.aboutTitle,
      about_intro: parsed.data.aboutIntro,
      about_body: parsed.data.aboutBody,
      about_quote: parsed.data.aboutQuote,
      about_image_url: parsed.data.aboutImageUrl,
      about_image_alt: parsed.data.aboutImageAlt,
    },
    'Sección «Sobre Verónica» actualizada.',
  )
}

export async function savePromos(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = promosSchema.safeParse({
    promosTitle: text(formData, 'promosTitle'),
    promosDescription: text(formData, 'promosDescription'),
    promosNote: text(formData, 'promosNote'),
    promosVisible: bool(formData, 'promosVisible'),
  })

  if (!parsed.success) {
    return errorState('Revisa los campos marcados.', flatten(parsed.error))
  }

  return updateSettings(
    {
      promos_title: parsed.data.promosTitle,
      promos_description: parsed.data.promosDescription,
      promos_note: parsed.data.promosNote,
      promos_visible: parsed.data.promosVisible,
    },
    'Promociones y formas de pago actualizadas.',
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

  const id = text(formData, 'id')
  if (!id) return errorState('No se indicó qué servicio eliminar.')

  const { error } = await supabase.from('services').delete().eq('id', id)
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

  const id = text(formData, 'id')
  if (!id) return errorState('No se indicó qué aseguradora eliminar.')

  const { error } = await supabase.from('insurers').delete().eq('id', id)
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
