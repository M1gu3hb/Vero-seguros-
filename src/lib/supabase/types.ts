/**
 * Tipos de la base de datos.
 *
 * Escritos a mano y alineados con `supabase/migrations/0001_schema.sql`.
 * Se mantienen aquí (en vez de generarlos en cada build) porque el esquema es
 * pequeño y estable, y así el proyecto compila sin depender de la red.
 */

export type ServiceRow = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type InsurerRow = {
  id: string
  name: string
  image_url: string | null
  image_alt: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type SiteSettingsRow = {
  id: number

  brand_name: string
  brand_role: string
  brand_tagline: string
  contact_email: string
  whatsapp_number: string
  whatsapp_message: string
  coverage_text: string

  hero_eyebrow: string
  hero_title: string
  hero_description: string
  hero_primary_cta: string
  hero_secondary_cta: string
  hero_image_url: string | null
  hero_image_alt: string | null

  about_title: string
  about_intro: string
  about_body: string
  about_quote: string
  about_image_url: string | null
  about_image_alt: string | null

  promos_title: string
  promos_description: string
  promos_note: string
  promos_visible: boolean

  updated_at: string
}

export type AdminUserRow = {
  user_id: string
  email: string
  created_at: string
}

type Insert<T, Optional extends keyof T> = Omit<T, Optional> & Partial<Pick<T, Optional>>

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: SiteSettingsRow
        Insert: Insert<SiteSettingsRow, 'id' | 'updated_at'>
        Update: Partial<SiteSettingsRow>
        Relationships: []
      }
      services: {
        Row: ServiceRow
        Insert: Insert<ServiceRow, 'id' | 'created_at' | 'updated_at' | 'icon' | 'sort_order' | 'is_visible'>
        Update: Partial<ServiceRow>
        Relationships: []
      }
      insurers: {
        Row: InsurerRow
        Insert: Insert<
          InsurerRow,
          'id' | 'created_at' | 'updated_at' | 'image_url' | 'image_alt' | 'sort_order' | 'is_visible'
        >
        Update: Partial<InsurerRow>
        Relationships: []
      }
      admin_users: {
        Row: AdminUserRow
        Insert: Insert<AdminUserRow, 'created_at'>
        Update: Partial<AdminUserRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
