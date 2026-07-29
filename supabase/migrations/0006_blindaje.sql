-- ===========================================================================
-- 0006 · Blindaje de la base de datos
--
-- Row Level Security ya impedía escribir sin ser la administradora. Esto añade
-- las capas que faltaban por debajo, para que no dependa todo de una sola
-- regla:
--
--   · Permisos de tabla al mínimo. Supabase concede `all` a `anon` y
--     `authenticated` en cada tabla nueva, y ese `all` incluye TRUNCATE, que
--     **no pasa por Row Level Security**: basta con poder ejecutarlo para
--     vaciar una tabla entera. Hoy no hay forma de llegar a él desde la API,
--     pero el permiso no debería estar concedido de entrada.
--   · El bucket de imágenes deja de poder listarse. Las fotos siguen viéndose
--     por su dirección —el bucket es público—, pero ya no se puede pedir el
--     índice completo y descubrir archivos que se subieron y luego se
--     sustituyeron.
--   · `touch_updated_at` con `search_path` fijo, como el resto de funciones.
--
-- Nada de esto cambia lo que la administradora puede hacer, ni lo que ve
-- quien visita la página.
-- ===========================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- 1 · Funciones con search_path fijo
--
-- Sin `search_path`, la función resuelve los nombres con el que traiga la
-- sesión. Es la puerta clásica para colar un `now()` propio desde un esquema
-- que vaya antes en la ruta.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- 2 · Permisos de tabla: sólo lo que la aplicación usa
--
-- `anon` es quien lee la página pública: no escribe nunca.
-- `authenticated` es la sesión de la administradora, y sobre ella siguen
-- aplicándose las políticas: tener el permiso no basta, hay que estar en
-- `admin_users`.
-- ───────────────────────────────────────────────────────────────────────────
revoke all on public.site_settings from anon, authenticated;
revoke all on public.services      from anon, authenticated;
revoke all on public.insurers      from anon, authenticated;
revoke all on public.site_texts    from anon, authenticated;
revoke all on public.admin_users   from anon, authenticated;

-- Ajustes: fila única. Se actualiza, nunca se crea ni se borra desde la
-- aplicación.
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

-- Servicios y aseguradoras: se dan de alta, se editan y se eliminan.
grant select                 on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;

grant select                 on public.insurers to anon, authenticated;
grant insert, update, delete on public.insurers to authenticated;

-- Textos por clave: se guardan con upsert, así que hacen falta insert y
-- update. Borrar no: una frase se cambia, no se quita.
grant select         on public.site_texts to anon, authenticated;
grant insert, update on public.site_texts to authenticated;

-- La lista de administradoras no se toca desde la aplicación. Sólo se lee, y
-- la política deja ver la lista únicamente a quien ya está en ella. El alta se
-- hace desde el panel de Supabase.
grant select on public.admin_users to authenticated;

-- Y que las tablas que se creen a partir de ahora en este esquema nazcan
-- igual de cerradas, en vez de con permisos totales.
alter default privileges in schema public
  revoke all on tables from anon, authenticated;

comment on table public.admin_users is
  'Usuarios autorizados para editar el contenido. Se da de alta manualmente desde el panel de Supabase; no hay registro público. Ningún rol de la API puede escribir en esta tabla.';

-- ───────────────────────────────────────────────────────────────────────────
-- 3 · Almacenamiento: ver una imagen sí, listar el bucket no
--
-- `site-media` es un bucket público, así que sus archivos se sirven por
-- `/storage/v1/object/public/...` sin pasar por estas políticas: las fotos de
-- la página se siguen viendo igual. Lo que la política de lectura habilitaba
-- de más era el **listado**: cualquiera podía pedir el índice del bucket y
-- descubrir todo lo que se ha subido alguna vez, incluidas las fotos que se
-- sustituyeron y ya no aparecen en ningún sitio.
-- ───────────────────────────────────────────────────────────────────────────
drop policy if exists site_media_public_read on storage.objects;

drop policy if exists site_media_admin_read on storage.objects;
create policy site_media_admin_read
  on storage.objects for select
  using (bucket_id = 'site-media' and public.is_admin());
