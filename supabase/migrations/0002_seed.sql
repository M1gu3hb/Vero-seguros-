-- ===========================================================================
-- 0002 · Contenido inicial (seed reproducible)
--
-- Idempotente: se puede ejecutar varias veces sin duplicar ni pisar cambios
-- ya hechos desde el CMS (las filas existentes se respetan).
--
-- El mismo contenido vive en `src/content/site-content.ts`, que además sirve
-- de respaldo visual si la base de datos no responde.
-- ===========================================================================

-- ── Ajustes del sitio ──────────────────────────────────────────────────────
insert into public.site_settings (
  id,
  brand_name, brand_role, brand_tagline,
  contact_email, whatsapp_number, whatsapp_message, coverage_text,
  hero_eyebrow, hero_title, hero_description, hero_primary_cta, hero_secondary_cta,
  about_title, about_intro, about_body, about_quote,
  promos_title, promos_description, promos_note, promos_visible
) values (
  1,
  'Verónica Méndez',
  'Agente de Seguros Certificada',
  'Seguros con Sentido Humano',
  'veronicam0602@gmail.com',
  '525540085632',
  'Hola, Verónica. Vi tu página y me gustaría recibir orientación para proteger lo que más me importa.',
  'Atención a nivel nacional',

  'Agente de Seguros Certificada · Desde 2018',
  'Protege lo que más importa con una asesoría que sí te escucha.',
  'Desde 2018 acompaño a personas, familias y empresas a elegir su seguro con calma y con información clara. Escucho lo que quieres cuidar, comparo alternativas y te explico cada opción sin prisa.',
  'Platiquemos por WhatsApp',
  'Escríbeme por correo',

  'Sobre Verónica',
  'Desde 2018 tengo el privilegio de ayudar a personas, familias y empresas a proteger lo que más valoran. Mi trabajo empieza escuchando.',
  E'Creo firmemente que un seguro no es un gasto, sino una decisión de amor, responsabilidad y previsión. Por eso mi compromiso es escucharte, conocer tus necesidades y presentarte diferentes propuestas, para que elijas la opción que realmente se adapte a tu estilo de vida, tus objetivos y tu presupuesto.\n\nLa confianza de mis clientes es mi mayor satisfacción. Ellos valoran la atención personalizada, el acompañamiento cercano y el respaldo que les brindo antes, durante y después de contratar su seguro. Su recomendación y su fidelidad son el reflejo del compromiso con el que desempeño mi trabajo.\n\nAdemás de ser agente de seguros, soy mamá y proveedora de mis hijos, por lo que entiendo el esfuerzo que implica construir un patrimonio y el deseo de proteger a quienes más amamos. Esa experiencia me impulsa a ejercer esta profesión con honestidad, empatía, responsabilidad y profundo respeto por cada persona que deposita su confianza en mí.\n\nMe siento verdaderamente privilegiada cada vez que alguien decide asegurar conmigo su vida, su salud, su hogar, su patrimonio o el futuro de su familia. Mi propósito es brindarte la tranquilidad de saber que, pase lo que pase, cuentas con un respaldo sólido cuando más lo necesites.',
  'Un seguro no es un gasto, sino una decisión de amor, responsabilidad y previsión.',

  'Facilidades de pago',
  'Encuentra alternativas de pago que se adapten a ti. Algunas aseguradoras ofrecen meses sin intereses y modalidades mensuales, trimestrales, semestrales o anuales, de acuerdo con el producto y las condiciones vigentes.',
  'Promociones y facilidades sujetas a disponibilidad, aseguradora, producto, método de pago y condiciones vigentes.',
  true
)
on conflict (id) do nothing;

-- ── Servicios ──────────────────────────────────────────────────────────────
insert into public.services (name, slug, description, icon, sort_order, is_visible)
values
  ('Seguro de Vida', 'vida',
   'Alternativas pensadas para brindar protección financiera a quienes más dependen de ti.',
   'vida', 1, true),
  ('Gastos Médicos Mayores', 'gastos-medicos-mayores',
   'Orientación para comparar coberturas, deducibles y opciones de atención según tus necesidades.',
   'salud', 2, true),
  ('Seguro de Auto', 'auto',
   'Opciones para proteger tu vehículo y contar con respaldo ante diferentes imprevistos.',
   'auto', 3, true),
  ('Seguro para Camión', 'camion',
   'Soluciones para unidades de carga o de trabajo, de acuerdo con su uso y su operación.',
   'camion', 4, true),
  ('Responsabilidad Civil', 'responsabilidad-civil',
   'Alternativas de protección ante daños a terceros, según la actividad y el riesgo.',
   'responsabilidad', 5, true),
  ('Seguro de Hogar', 'hogar',
   'Protección para tu vivienda, tus pertenencias y tu patrimonio.',
   'hogar', 6, true),
  ('Gastos Funerarios', 'gastos-funerarios',
   'Previsión y apoyo para evitar que la familia enfrente sola gastos inesperados.',
   'funerarios', 7, true),
  ('Membresías de Salud', 'membresias-de-salud',
   'Acceso a servicios y beneficios de salud conforme al programa contratado.',
   'membresia', 8, true)
on conflict (slug) do nothing;

-- ── Aseguradoras ───────────────────────────────────────────────────────────
-- Sólo nombres. Los logotipos se agregan después, si la marca lo autoriza,
-- desde el CMS (imagen opcional por aseguradora).
insert into public.insurers (name, sort_order, is_visible)
select v.name, v.sort_order, true
from (values
  ('Zurich', 1),
  ('GNP', 2),
  ('MAPFRE', 3),
  ('MetLife', 4),
  ('SURA', 5),
  ('Chubb', 6),
  ('AXA', 7),
  ('Afirme', 8),
  ('Mutus', 9),
  ('VRIM', 10)
) as v(name, sort_order)
where not exists (
  select 1 from public.insurers i where i.name = v.name
);
