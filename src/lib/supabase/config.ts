/**
 * Configuración pública de Supabase.
 *
 * La URL del proyecto y la clave `anon` son valores **públicos por diseño**:
 * viajan al navegador en cualquier aplicación de Supabase y lo único que
 * permiten es hablar con la API respetando las políticas de Row Level
 * Security. No son secretos y no dan acceso de escritura: para modificar
 * contenido hace falta una sesión de un usuario presente en `admin_users`.
 *
 * Se leen primero del entorno para poder apuntar a otro proyecto (local,
 * staging) sin tocar el código; los valores por omisión corresponden al
 * proyecto de producción.
 *
 * La `service role key` NO se usa en ningún punto del runtime y nunca debe
 * añadirse a este archivo ni a ninguna variable con prefijo NEXT_PUBLIC_.
 */
const FALLBACK_SUPABASE_URL = 'https://vuzyhbiwnnngeohysxcw.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_26WQI_ceor1wl2Nk43BR1A_NH1zJYDK'

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || FALLBACK_SUPABASE_URL

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || FALLBACK_SUPABASE_ANON_KEY

/** Bucket de Supabase Storage donde viven las imágenes editables del sitio. */
export const MEDIA_BUCKET = 'site-media'
