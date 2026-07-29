-- ===========================================================================
-- 0004 · Detalle de cada seguro, plazos de pago editables y Plan Seguro
--
-- Tres cambios, todos aditivos:
--
--   1. services.detail       → el texto largo que se abre al pulsar un ramo.
--   2. site_settings.promos_* → los plazos y las modalidades dejan de estar
--                               escritos en el código y se editan desde el
--                               administrador, uno a uno.
--   3. Plan Seguro            → aparece en la tarjeta de presentación y ya se
--                               incluye su logotipo en el repositorio.
--
-- La migración es idempotente: se puede volver a ejecutar sin efectos.
-- ===========================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- 1 · Detalle de cada seguro
-- ───────────────────────────────────────────────────────────────────────────
alter table public.services
  add column if not exists detail text;

alter table public.services drop constraint if exists services_detail_check;
alter table public.services
  add constraint services_detail_check
  check (detail is null or char_length(detail) between 40 and 900);

comment on column public.services.detail is
  'Texto que se despliega al pulsar el ramo en la página. Describe en general qué cubre ese tipo de seguro; las coberturas concretas siempre dependen de la aseguradora y de la póliza.';

-- ───────────────────────────────────────────────────────────────────────────
-- 2 · Plazos y modalidades de pago
--
-- Se guardan como arreglos de texto porque son listas cortas y ordenadas que
-- se editan juntas: así la administradora agrega o quita un plazo sin tocar
-- los demás, y no hace falta una tabla aparte para cuatro renglones.
-- ───────────────────────────────────────────────────────────────────────────
alter table public.site_settings
  add column if not exists promos_installments_label text
    not null default 'Meses sin intereses en algunas aseguradoras',
  add column if not exists promos_installments text[] not null default '{}',
  add column if not exists promos_frequencies_label text
    not null default 'Modalidades de pago',
  add column if not exists promos_frequencies text[] not null default '{}';

alter table public.site_settings drop constraint if exists site_settings_promos_labels_check;
alter table public.site_settings
  add constraint site_settings_promos_labels_check
  check (
    char_length(promos_installments_label) between 2 and 90
    and char_length(promos_frequencies_label) between 2 and 90
  );

/*
 * Un `check` no admite subconsultas, así que el largo de cada elemento se
 * valida en la aplicación (zod) y aquí se acota el conjunto: como máximo doce
 * elementos por lista y un total razonable de caracteres.
 */
alter table public.site_settings drop constraint if exists site_settings_promos_lists_check;
alter table public.site_settings
  add constraint site_settings_promos_lists_check
  check (
    coalesce(array_length(promos_installments, 1), 0) <= 12
    and coalesce(array_length(promos_frequencies, 1), 0) <= 12
    and char_length(array_to_string(promos_installments, ',')) <= 500
    and char_length(array_to_string(promos_frequencies, ',')) <= 500
  );

-- Valores iniciales: exactamente los que ya mostraba la página.
update public.site_settings
set promos_installments = array['3 meses', '6 meses', '12 meses']
where id = 1 and coalesce(array_length(promos_installments, 1), 0) = 0;

update public.site_settings
set promos_frequencies = array['Mensual', 'Trimestral', 'Semestral', 'Anual']
where id = 1 and coalesce(array_length(promos_frequencies, 1), 0) = 0;

-- ───────────────────────────────────────────────────────────────────────────
-- 3 · Plan Seguro
--
-- Se agrega al final para no alterar el orden ya elegido desde el CMS.
-- ───────────────────────────────────────────────────────────────────────────
insert into public.insurers (name, image_url, image_alt, sort_order, is_visible)
select
  'Plan Seguro',
  '/brand/aseguradoras/plan-seguro.svg',
  'Plan Seguro',
  coalesce((select max(sort_order) from public.insurers), 0) + 1,
  true
where not exists (select 1 from public.insurers where name = 'Plan Seguro');

-- ───────────────────────────────────────────────────────────────────────────
-- 4 · Detalle inicial de cada ramo
--
-- Descripciones generales de qué cubre cada tipo de seguro. No prometen
-- coberturas ni aprobaciones: dicen qué suele contemplar el ramo y remiten a
-- la póliza y a la aseguradora. Sólo se aplican donde todavía no hay texto,
-- para no pisar lo que se haya escrito después desde el administrador.
-- ───────────────────────────────────────────────────────────────────────────
update public.services s
set detail = v.detail
from (values
  (
    'vida',
    'Paga una suma asegurada a las personas que tú designas como beneficiarias si llegas a faltar durante la vigencia de la póliza. Según el plan puede sumar coberturas adicionales por invalidez total y permanente, muerte accidental o enfermedades graves, y hay productos que combinan la protección con un componente de ahorro o inversión. La suma asegurada, los beneficiarios y las coberturas adicionales se definen al contratar.'
  ),
  (
    'gastos-medicos-mayores',
    'Cubre los gastos de atención médica y hospitalaria derivados de un accidente o de una enfermedad cubierta: honorarios, hospitalización, estudios, medicamentos y cirugía, conforme a la red y a las condiciones del plan. Opera con una suma asegurada, un deducible y un coaseguro que se eligen al contratar. Existen periodos de espera y exclusiones —entre ellas los padecimientos preexistentes— que conviene revisar con calma antes de decidir.'
  ),
  (
    'auto',
    'Responde por los gastos de un accidente. Según la cobertura contratada puede incluir responsabilidad civil por daños a terceros en sus bienes y en sus personas, gastos médicos de los ocupantes, daños materiales al vehículo, robo total y asistencia vial y legal. Se contrata como cobertura amplia, limitada o de responsabilidad civil, y el deducible se pacta desde el inicio.'
  ),
  (
    'camion',
    'Pensado para unidades de carga, de pasaje o de trabajo. Contempla responsabilidad civil por daños a terceros, daños materiales a la unidad, robo total y asistencia en carretera, y puede ampliarse con coberturas para la mercancía transportada o para el remolque. Las condiciones dependen del tipo de unidad, de su uso, de su valor y de las rutas en las que opera.'
  ),
  (
    'responsabilidad-civil',
    'Responde por los daños que una persona o una empresa pueda causar a un tercero en su persona o en sus bienes, e incluye los gastos de defensa legal derivados de esa reclamación. Se contrata de acuerdo con la actividad —profesional, comercial, industrial o familiar— y con el nivel de riesgo, y opera hasta un límite máximo de responsabilidad que se define al contratar.'
  ),
  (
    'hogar',
    'Protege la vivienda y lo que hay dentro de ella. Según el plan puede cubrir daños al inmueble y a su contenido por incendio, fenómenos naturales, explosión o daños por agua, además de robo con violencia, cristales, responsabilidad civil familiar y servicios de asistencia para el hogar. Se puede contratar como propietario o como inquilino, con sumas aseguradas distintas para el inmueble y para el contenido.'
  ),
  (
    'gastos-funerarios',
    'Cubre los gastos del servicio funerario de la persona asegurada y, en algunos planes, de los familiares que se registren en la póliza. Puede operar mediante el reembolso de los gastos o a través de una red de servicios ya contratados. Suele tener un periodo de espera al inicio de la vigencia, que se indica en las condiciones del plan.'
  ),
  (
    'membresias-de-salud',
    'No son un seguro, sino un programa de servicios de salud: dan acceso a consultas médicas, estudios de laboratorio, atención dental y visual, y descuentos en medicamentos y hospitales dentro de una red, a cambio de una cuota. Funcionan como complemento de un seguro de gastos médicos o como una primera opción para quien todavía no cuenta con uno.'
  )
) as v(slug, detail)
where s.slug = v.slug
  and s.detail is null;
