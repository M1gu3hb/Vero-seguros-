-- ===========================================================================
-- 0007 · Bitácora de cambios
--
-- Impedir que alguien edite sin permiso es una cosa; poder comprobarlo es
-- otra. Esta tabla anota cada alta, cambio y baja de contenido: qué tabla, qué
-- fila, quién y cuándo. Si un día algo aparece distinto, aquí está la
-- respuesta a «¿lo cambié yo?».
--
-- Se escribe desde un disparador y no desde la aplicación, así que registra
-- cualquier escritura que llegue a la base: por el administrador, por la API o
-- desde el propio panel de Supabase.
--
-- Guarda la fila entera antes y después. Es contenido de una página pública
-- —no hay dato personal de nadie ahí dentro— y tenerlo completo es lo que
-- permite reponer a mano algo que se borró sin querer.
-- ===========================================================================

create table if not exists public.content_audit (
  id         bigint generated always as identity primary key,
  tabla      text        not null,
  fila       text        not null,
  accion     text        not null check (accion in ('alta', 'cambio', 'baja')),
  actor      uuid        references auth.users (id) on delete set null,
  correo     text,
  antes      jsonb,
  despues    jsonb,
  ocurrio_en timestamptz not null default now()
);

create index if not exists content_audit_reciente_idx
  on public.content_audit (ocurrio_en desc);

comment on table public.content_audit is
  'Cada escritura sobre el contenido del sitio: qué cambió, quién y cuándo. Sólo la administradora puede leerla; nadie puede modificarla.';

-- ───────────────────────────────────────────────────────────────────────────
-- El disparador
--
-- SECURITY DEFINER porque escribe en una tabla en la que ningún rol de la API
-- tiene permiso de escritura: esa es justamente la idea. La bitácora se anota
-- sola y no se puede editar después, ni siquiera desde una sesión con permisos
-- de administración.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.anotar_en_bitacora()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  fila_json jsonb := to_jsonb(coalesce(new, old));
  identificador text;
begin
  /*
   * Cada tabla se identifica por lo suyo: los servicios y las aseguradoras por
   * su `id`, las frases sueltas por su clave. Sin esto, la bitácora diría
   * «cambió una frase» sin decir cuál.
   */
  identificador := coalesce(fila_json ->> 'id', fila_json ->> 'key', '—');

  insert into public.content_audit (tabla, fila, accion, actor, correo, antes, despues)
  values (
    tg_table_name,
    identificador,
    case tg_op when 'INSERT' then 'alta' when 'UPDATE' then 'cambio' else 'baja' end,
    auth.uid(),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );

  return coalesce(new, old);
end;
$$;

revoke all on function public.anotar_en_bitacora() from public, anon, authenticated;

drop trigger if exists site_settings_bitacora on public.site_settings;
create trigger site_settings_bitacora
  after insert or update or delete on public.site_settings
  for each row execute function public.anotar_en_bitacora();

drop trigger if exists services_bitacora on public.services;
create trigger services_bitacora
  after insert or update or delete on public.services
  for each row execute function public.anotar_en_bitacora();

drop trigger if exists insurers_bitacora on public.insurers;
create trigger insurers_bitacora
  after insert or update or delete on public.insurers
  for each row execute function public.anotar_en_bitacora();

drop trigger if exists site_texts_bitacora on public.site_texts;
create trigger site_texts_bitacora
  after insert or update or delete on public.site_texts
  for each row execute function public.anotar_en_bitacora();

-- ───────────────────────────────────────────────────────────────────────────
-- Row Level Security
--
-- Sólo lectura, y sólo para la administradora. No hay política de escritura a
-- propósito: una bitácora que se puede editar no sirve de nada.
-- ───────────────────────────────────────────────────────────────────────────
alter table public.content_audit enable row level security;

drop policy if exists content_audit_select_admin on public.content_audit;
create policy content_audit_select_admin
  on public.content_audit for select
  using (public.is_admin());

revoke all on public.content_audit from anon, authenticated;
grant select on public.content_audit to authenticated;
