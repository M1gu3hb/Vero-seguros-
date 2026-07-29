-- ===========================================================================
-- Verónica Méndez — Seguros con Sentido Humano
-- 0001 · Esquema, funciones, Row Level Security y almacenamiento
--
-- Modelo mínimo y proporcional al proyecto:
--   admin_users   → quién puede escribir (una sola administradora)
--   site_settings → textos e imágenes de identidad, hero, biografía y pagos
--   services      → los ramos de seguro (orden y visibilidad editables)
--   insurers      → las aseguradoras (orden, visibilidad e imagen opcional)
--
-- Lectura pública sólo de contenido publicado. Escritura exclusiva para
-- usuarios presentes en admin_users. Sin registro público.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ───────────────────────────────────────────────────────────────────────────
-- Utilidad: mantener updated_at al día
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- admin_users — la lista blanca de administración
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Usuarios autorizados para editar el contenido. Se da de alta manualmente desde el panel de Supabase; no hay registro público.';

-- ───────────────────────────────────────────────────────────────────────────
-- is_admin() — comprobación segura de pertenencia
--
-- SECURITY DEFINER para poder consultar admin_users sin que las políticas de
-- esa misma tabla provoquen recursión. search_path fijo para evitar secuestro
-- de esquema.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

comment on function public.is_admin() is
  'true si el usuario de la sesión actual está en admin_users.';

-- ───────────────────────────────────────────────────────────────────────────
-- site_settings — fila única (id = 1)
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  id smallint primary key default 1,

  -- Identidad y contacto
  brand_name       text not null check (char_length(brand_name) between 2 and 80),
  brand_role       text not null check (char_length(brand_role) between 2 and 90),
  brand_tagline    text not null check (char_length(brand_tagline) between 2 and 90),
  contact_email    text not null check (contact_email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  -- Sólo para construir el enlace wa.me. Nunca se muestra en el sitio público.
  whatsapp_number  text not null check (whatsapp_number ~ '^[0-9]{10,15}$'),
  whatsapp_message text not null check (char_length(whatsapp_message) between 10 and 400),
  coverage_text    text not null check (char_length(coverage_text) between 2 and 90),

  -- Hero
  hero_eyebrow       text not null check (char_length(hero_eyebrow) between 2 and 90),
  hero_title         text not null check (char_length(hero_title) between 10 and 160),
  hero_description   text not null check (char_length(hero_description) between 20 and 500),
  hero_primary_cta   text not null check (char_length(hero_primary_cta) between 2 and 40),
  hero_secondary_cta text not null check (char_length(hero_secondary_cta) between 2 and 40),
  hero_image_url     text check (hero_image_url is null or hero_image_url ~ '^https?://'),
  hero_image_alt     text check (hero_image_alt is null or char_length(hero_image_alt) <= 160),

  -- Sobre Verónica
  about_title      text not null check (char_length(about_title) between 2 and 90),
  about_intro      text not null check (char_length(about_intro) between 20 and 500),
  about_body       text not null check (char_length(about_body) between 20 and 4000),
  about_quote      text not null check (char_length(about_quote) between 10 and 300),
  about_image_url  text check (about_image_url is null or about_image_url ~ '^https?://'),
  about_image_alt  text check (about_image_alt is null or char_length(about_image_alt) <= 160),

  -- Promociones y formas de pago
  promos_title       text not null check (char_length(promos_title) between 2 and 90),
  promos_description text not null check (char_length(promos_description) between 20 and 700),
  promos_note        text not null check (char_length(promos_note) between 10 and 400),
  promos_visible     boolean not null default true,

  updated_at timestamptz not null default now(),

  constraint site_settings_singleton check (id = 1)
);

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ───────────────────────────────────────────────────────────────────────────
-- services
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 80),
  slug        text not null unique
                check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 60),
  description text not null check (char_length(description) between 10 and 400),
  icon        text not null default 'proteccion' check (char_length(icon) between 1 and 40),
  sort_order  integer not null default 0 check (sort_order between 0 and 9999),
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists services_sort_idx on public.services (sort_order asc, created_at asc);
create index if not exists services_visible_idx on public.services (is_visible) where is_visible;

drop trigger if exists services_touch on public.services;
create trigger services_touch
  before update on public.services
  for each row execute function public.touch_updated_at();

-- ───────────────────────────────────────────────────────────────────────────
-- insurers
-- ───────────────────────────────────────────────────────────────────────────
create table if not exists public.insurers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 60),
  image_url  text check (image_url is null or image_url ~ '^https?://'),
  image_alt  text check (image_alt is null or char_length(image_alt) <= 160),
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insurers_sort_idx on public.insurers (sort_order asc, created_at asc);
create index if not exists insurers_visible_idx on public.insurers (is_visible) where is_visible;

drop trigger if exists insurers_touch on public.insurers;
create trigger insurers_touch
  before update on public.insurers
  for each row execute function public.touch_updated_at();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.admin_users   enable row level security;
alter table public.site_settings enable row level security;
alter table public.services      enable row level security;
alter table public.insurers      enable row level security;

-- admin_users: sólo un administrador puede ver la lista. Nadie puede
-- modificarla desde la API: el alta se hace desde el panel de Supabase.
drop policy if exists admin_users_select_admin on public.admin_users;
create policy admin_users_select_admin
  on public.admin_users for select
  using (public.is_admin());

-- site_settings: lectura pública, escritura sólo de la administradora.
drop policy if exists site_settings_select_public on public.site_settings;
create policy site_settings_select_public
  on public.site_settings for select
  using (true);

drop policy if exists site_settings_update_admin on public.site_settings;
create policy site_settings_update_admin
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists site_settings_insert_admin on public.site_settings;
create policy site_settings_insert_admin
  on public.site_settings for insert
  with check (public.is_admin());

-- services / insurers: el público sólo ve lo publicado.
drop policy if exists services_select_published on public.services;
create policy services_select_published
  on public.services for select
  using (is_visible or public.is_admin());

drop policy if exists services_write_admin on public.services;
create policy services_write_admin
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists insurers_select_published on public.insurers;
create policy insurers_select_published
  on public.insurers for select
  using (is_visible or public.is_admin());

drop policy if exists insurers_write_admin on public.insurers;
create policy insurers_write_admin
  on public.insurers for all
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================================================================
-- Almacenamiento — bucket site-media
-- Lectura pública (las imágenes se muestran en el sitio), escritura sólo de
-- la administradora, con límite de peso y tipos permitidos.
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  3145728, -- 3 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists site_media_public_read on storage.objects;
create policy site_media_public_read
  on storage.objects for select
  using (bucket_id = 'site-media');

drop policy if exists site_media_admin_insert on storage.objects;
create policy site_media_admin_insert
  on storage.objects for insert
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists site_media_admin_update on storage.objects;
create policy site_media_admin_update
  on storage.objects for update
  using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists site_media_admin_delete on storage.objects;
create policy site_media_admin_delete
  on storage.objects for delete
  using (bucket_id = 'site-media' and public.is_admin());
