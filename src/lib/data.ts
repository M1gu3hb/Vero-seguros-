import 'server-only'

import { unstable_cache } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import {
  defaultContent,
  type Insurer,
  type Service,
  type SiteContent,
  type SiteSettings,
} from '@/content/site-content'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/config'
import type { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database, InsurerRow, SiteSettingsRow, ServiceRow } from '@/lib/supabase/types'

export const SITE_CONTENT_TAG = 'site-content'

/* ── Mapeo fila → modelo de la interfaz ─────────────────────────────────── */

export function mapSettings(row: SiteSettingsRow): SiteSettings {
  return {
    brandName: row.brand_name,
    brandRole: row.brand_role,
    brandTagline: row.brand_tagline,
    contactEmail: row.contact_email,
    whatsappNumber: row.whatsapp_number,
    whatsappMessage: row.whatsapp_message,
    coverageText: row.coverage_text,

    heroEyebrow: row.hero_eyebrow,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    heroPrimaryCta: row.hero_primary_cta,
    heroSecondaryCta: row.hero_secondary_cta,
    heroImageUrl: row.hero_image_url,
    heroImageAlt: row.hero_image_alt,

    aboutTitle: row.about_title,
    aboutIntro: row.about_intro,
    aboutBody: row.about_body,
    aboutQuote: row.about_quote,
    aboutImageUrl: row.about_image_url,
    aboutImageAlt: row.about_image_alt,

    promosTitle: row.promos_title,
    promosDescription: row.promos_description,
    promosNote: row.promos_note,
    promosVisible: row.promos_visible,
  }
}

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
  }
}

export function mapInsurer(row: InsurerRow): Insurer {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
  }
}

/* ── Lectura pública ─────────────────────────────────────────────────────── */

/**
 * Cliente anónimo, sin cookies: la página pública no depende de ninguna
 * sesión, lo que permite cachear la respuesta y servir el HTML al instante.
 * Row Level Security garantiza que sólo llegue contenido publicado.
 */
function anonClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function fetchPublicContent(): Promise<SiteContent> {
  try {
    const supabase = anonClient()

    const [settingsResult, servicesResult, insurersResult] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      supabase
        .from('services')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('insurers')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
    ])

    if (settingsResult.error) throw settingsResult.error
    if (servicesResult.error) throw servicesResult.error
    if (insurersResult.error) throw insurersResult.error

    return {
      settings: settingsResult.data ? mapSettings(settingsResult.data) : defaultContent.settings,
      services: servicesResult.data?.length
        ? servicesResult.data.map(mapService)
        : defaultContent.services,
      insurers: insurersResult.data?.length
        ? insurersResult.data.map(mapInsurer)
        : defaultContent.insurers,
    }
  } catch (error) {
    // Respaldo visual: si la base de datos no responde, el sitio sigue en pie
    // con el contenido versionado en el repositorio.
    console.error('[data] no se pudo leer el contenido de Supabase:', error)
    return defaultContent
  }
}

/**
 * Contenido de la página pública, cacheado y etiquetado.
 * El CMS invalida esta etiqueta al guardar, así que los cambios se ven
 * inmediatamente después de publicar.
 */
export const getPublicContent = unstable_cache(fetchPublicContent, ['public-site-content'], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 300,
})

/* ── Lectura para el administrador ──────────────────────────────────────── */

/**
 * Contenido completo, incluidos los elementos ocultos. Usa la sesión de la
 * administradora, así que no se cachea nunca.
 */
export async function getAdminContent(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
): Promise<SiteContent> {
  const [settingsResult, servicesResult, insurersResult] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('insurers')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  return {
    settings: settingsResult.data ? mapSettings(settingsResult.data) : defaultContent.settings,
    services: (servicesResult.data ?? []).map(mapService),
    insurers: (insurersResult.data ?? []).map(mapInsurer),
  }
}
