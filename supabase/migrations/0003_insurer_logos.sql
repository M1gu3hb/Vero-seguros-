-- ===========================================================================
-- 0003 · Logotipos de las aseguradoras
--
-- Los logotipos oficiales que vienen con el proyecto viven en el repositorio
-- (`public/brand/aseguradoras/`), así que `image_url` debe admitir también una
-- ruta del propio sitio, no sólo una URL absoluta de Supabase Storage.
--
-- Cuando la administradora sube un logotipo desde el CMS, sigue guardándose
-- como URL absoluta del bucket; ambas formas conviven.
-- ===========================================================================

alter table public.insurers drop constraint if exists insurers_image_url_check;

alter table public.insurers
  add constraint insurers_image_url_check
  check (image_url is null or image_url ~ '^(https?://|/[a-zA-Z0-9])');

-- ── Asignación de los logotipos incluidos ──────────────────────────────────
-- Sólo se aplican a las aseguradoras que aún no tienen imagen propia, para no
-- pisar un logotipo que se haya subido después desde el administrador.
update public.insurers i
set image_url = v.url,
    image_alt = v.alt
from (values
  ('Zurich',  '/brand/aseguradoras/zurich.svg',  'Zurich'),
  ('GNP',     '/brand/aseguradoras/gnp.svg',     'GNP Seguros'),
  ('MAPFRE',  '/brand/aseguradoras/mapfre.svg',  'MAPFRE'),
  ('MetLife', '/brand/aseguradoras/metlife.svg', 'MetLife'),
  ('SURA',    '/brand/aseguradoras/sura.svg',    'Seguros SURA'),
  ('Chubb',   '/brand/aseguradoras/chubb.svg',   'Chubb'),
  ('AXA',     '/brand/aseguradoras/axa.svg',     'AXA'),
  ('Afirme',  '/brand/aseguradoras/afirme.svg',  'Afirme'),
  ('VRIM',    '/brand/aseguradoras/vrim.svg',    'VRIM')
) as v(name, url, alt)
where i.name = v.name
  and i.image_url is null;

-- Mutus se queda con su nombre en tipografía: no se localizó un archivo
-- oficial de su logotipo. Se puede cargar en cualquier momento desde el CMS.
