-- ===========================================================================
-- 0005 · Todo el texto de la página, editable
--
-- Hasta ahora la mitad del texto visible vivía escrito en el código: los
-- rótulos de cada sección, los cinco puntos de «Sentido humano», los tres
-- pasos del proceso, el cierre y el pie. Esta tabla los saca de ahí.
--
-- Es un almacén por clave a propósito. Son frases sueltas, no entidades: no
-- tienen orden propio, no se crean ni se borran desde el administrador y cada
-- una tiene su sitio fijo en el diseño. Una tabla por clave describe eso mejor
-- que una columna nueva por frase, y deja que el administrador y la vista
-- previa trabajen sobre el mismo mapa.
--
-- Las frases que ya vivían en `site_settings` se quedan donde están.
-- ===========================================================================

create table if not exists public.site_texts (
  key        text primary key check (key ~ '^[a-zA-Z]+(\.[a-zA-Z0-9]+)+$'),
  value      text not null check (char_length(value) between 1 and 4000),
  updated_at timestamptz not null default now()
);

comment on table public.site_texts is
  'Frases sueltas de la página, por clave. El catálogo de claves, sus rótulos y sus límites viven en src/content/texts.ts.';

drop trigger if exists site_texts_touch on public.site_texts;
create trigger site_texts_touch
  before update on public.site_texts
  for each row execute function public.touch_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Lectura para cualquiera: es el texto de una página pública.
-- Escritura sólo para quien esté en admin_users.
alter table public.site_texts enable row level security;

drop policy if exists "site_texts lectura pública" on public.site_texts;
create policy "site_texts lectura pública"
  on public.site_texts for select
  using (true);

drop policy if exists "site_texts escritura de administración" on public.site_texts;
create policy "site_texts escritura de administración"
  on public.site_texts for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_texts to anon, authenticated;
grant insert, update, delete on public.site_texts to authenticated;
