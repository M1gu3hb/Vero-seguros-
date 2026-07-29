/**
 * Contenido inicial del sitio.
 *
 * Es la fuente de verdad para tres cosas:
 *  1. El seed reproducible de Supabase (`supabase/migrations/0002_seed.sql`).
 *  2. El desarrollo local sin base de datos.
 *  3. El respaldo visual si la base de datos no responde momentáneamente.
 *
 * Todo el texto proviene de la información confirmada por Verónica. No añadir
 * cifras, certificaciones, testimonios ni promesas que ella no haya dado.
 */

export type SiteSettings = {
  brandName: string
  brandRole: string
  brandTagline: string
  contactEmail: string
  whatsappNumber: string
  whatsappMessage: string
  coverageText: string

  heroEyebrow: string
  heroTitle: string
  heroDescription: string
  heroPrimaryCta: string
  heroSecondaryCta: string
  heroImageUrl: string | null
  heroImageAlt: string | null

  aboutTitle: string
  aboutIntro: string
  aboutBody: string
  aboutQuote: string
  aboutImageUrl: string | null
  aboutImageAlt: string | null

  promosTitle: string
  promosDescription: string
  promosNote: string
  promosVisible: boolean
}

export type Service = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  sortOrder: number
  isVisible: boolean
}

export type Insurer = {
  id: string
  name: string
  imageUrl: string | null
  imageAlt: string | null
  sortOrder: number
  isVisible: boolean
}

export type SiteContent = {
  settings: SiteSettings
  services: Service[]
  insurers: Insurer[]
}

export const defaultSettings: SiteSettings = {
  brandName: 'Verónica Méndez',
  brandRole: 'Agente de Seguros Certificada',
  brandTagline: 'Seguros con Sentido Humano',
  contactEmail: 'veronicam0602@gmail.com',
  // Sólo se usa para construir el enlace wa.me. Nunca se muestra en el sitio.
  whatsappNumber: '525540085632',
  whatsappMessage:
    'Hola, Verónica. Vi tu página y me gustaría recibir orientación para proteger lo que más me importa.',
  coverageText: 'Atención a nivel nacional',

  heroEyebrow: 'Agente de Seguros Certificada · Desde 2018',
  heroTitle: 'Protege lo que más importa con una asesoría que sí te escucha.',
  heroDescription:
    'Desde 2018 acompaño a personas, familias y empresas a elegir su seguro con calma y con información clara. Escucho lo que quieres cuidar, comparo alternativas y te explico cada opción sin prisa.',
  heroPrimaryCta: 'Platiquemos por WhatsApp',
  heroSecondaryCta: 'Escríbeme por correo',
  heroImageUrl: null,
  heroImageAlt: null,

  aboutTitle: 'Sobre Verónica',
  aboutIntro:
    'Desde 2018 tengo el privilegio de ayudar a personas, familias y empresas a proteger lo que más valoran. Mi trabajo empieza escuchando.',
  aboutBody: [
    'Creo firmemente que un seguro no es un gasto, sino una decisión de amor, responsabilidad y previsión. Por eso mi compromiso es escucharte, conocer tus necesidades y presentarte diferentes propuestas, para que elijas la opción que realmente se adapte a tu estilo de vida, tus objetivos y tu presupuesto.',
    'La confianza de mis clientes es mi mayor satisfacción. Ellos valoran la atención personalizada, el acompañamiento cercano y el respaldo que les brindo antes, durante y después de contratar su seguro. Su recomendación y su fidelidad son el reflejo del compromiso con el que desempeño mi trabajo.',
    'Además de ser agente de seguros, soy mamá y proveedora de mis hijos, por lo que entiendo el esfuerzo que implica construir un patrimonio y el deseo de proteger a quienes más amamos. Esa experiencia me impulsa a ejercer esta profesión con honestidad, empatía, responsabilidad y profundo respeto por cada persona que deposita su confianza en mí.',
    'Me siento verdaderamente privilegiada cada vez que alguien decide asegurar conmigo su vida, su salud, su hogar, su patrimonio o el futuro de su familia. Mi propósito es brindarte la tranquilidad de saber que, pase lo que pase, cuentas con un respaldo sólido cuando más lo necesites.',
  ].join('\n\n'),
  aboutQuote:
    'Un seguro no es un gasto, sino una decisión de amor, responsabilidad y previsión.',
  aboutImageUrl: null,
  aboutImageAlt: null,

  promosTitle: 'Facilidades de pago',
  promosDescription:
    'Encuentra alternativas de pago que se adapten a ti. Algunas aseguradoras ofrecen meses sin intereses y modalidades mensuales, trimestrales, semestrales o anuales, de acuerdo con el producto y las condiciones vigentes.',
  promosNote:
    'Promociones y facilidades sujetas a disponibilidad, aseguradora, producto, método de pago y condiciones vigentes.',
  promosVisible: true,
}

export const defaultServices: Service[] = [
  {
    id: '11111111-1111-4111-8111-000000000001',
    name: 'Seguro de Vida',
    slug: 'vida',
    description:
      'Alternativas pensadas para brindar protección financiera a quienes más dependen de ti.',
    icon: 'vida',
    sortOrder: 1,
    isVisible: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000002',
    name: 'Gastos Médicos Mayores',
    slug: 'gastos-medicos-mayores',
    description:
      'Orientación para comparar coberturas, deducibles y opciones de atención según tus necesidades.',
    icon: 'salud',
    sortOrder: 2,
    isVisible: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000003',
    name: 'Seguro de Auto',
    slug: 'auto',
    description:
      'Opciones para proteger tu vehículo y contar con respaldo ante diferentes imprevistos.',
    icon: 'auto',
    sortOrder: 3,
    isVisible: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000004',
    name: 'Seguro para Camión',
    slug: 'camion',
    description:
      'Soluciones para unidades de carga o de trabajo, de acuerdo con su uso y su operación.',
    icon: 'camion',
    sortOrder: 4,
    isVisible: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000005',
    name: 'Responsabilidad Civil',
    slug: 'responsabilidad-civil',
    description:
      'Alternativas de protección ante daños a terceros, según la actividad y el riesgo.',
    icon: 'responsabilidad',
    sortOrder: 5,
    isVisible: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000006',
    name: 'Seguro de Hogar',
    slug: 'hogar',
    description: 'Protección para tu vivienda, tus pertenencias y tu patrimonio.',
    icon: 'hogar',
    sortOrder: 6,
    isVisible: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000007',
    name: 'Gastos Funerarios',
    slug: 'gastos-funerarios',
    description:
      'Previsión y apoyo para evitar que la familia enfrente sola gastos inesperados.',
    icon: 'funerarios',
    sortOrder: 7,
    isVisible: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000008',
    name: 'Membresías de Salud',
    slug: 'membresias-de-salud',
    description:
      'Acceso a servicios y beneficios de salud conforme al programa contratado.',
    icon: 'membresia',
    sortOrder: 8,
    isVisible: true,
  },
]

/*
 * Logotipos oficiales incluidos en `public/brand/aseguradoras/`. Están
 * normalizados en un lienzo común de 120 unidades de alto y con una escala
 * óptica por marca, para que la cinta se lea equilibrada: un cuadrado macizo
 * pesa más que un logotipo ancho de trazo fino a la misma altura.
 *
 * Mutus se muestra con su nombre en tipografía porque no se localizó un
 * archivo oficial de su logotipo; se puede cargar desde el CMS.
 */
const INSURER_LOGOS: Record<string, { url: string; alt: string }> = {
  Zurich: { url: '/brand/aseguradoras/zurich.svg', alt: 'Zurich' },
  GNP: { url: '/brand/aseguradoras/gnp.svg', alt: 'GNP Seguros' },
  MAPFRE: { url: '/brand/aseguradoras/mapfre.svg', alt: 'MAPFRE' },
  MetLife: { url: '/brand/aseguradoras/metlife.svg', alt: 'MetLife' },
  SURA: { url: '/brand/aseguradoras/sura.svg', alt: 'Seguros SURA' },
  Chubb: { url: '/brand/aseguradoras/chubb.svg', alt: 'Chubb' },
  AXA: { url: '/brand/aseguradoras/axa.svg', alt: 'AXA' },
  Afirme: { url: '/brand/aseguradoras/afirme.svg', alt: 'Afirme' },
  VRIM: { url: '/brand/aseguradoras/vrim.svg', alt: 'VRIM' },
}

export const defaultInsurers: Insurer[] = [
  'Zurich',
  'GNP',
  'MAPFRE',
  'MetLife',
  'SURA',
  'Chubb',
  'AXA',
  'Afirme',
  'Mutus',
  'VRIM',
].map((name, index) => ({
  id: `22222222-2222-4222-8222-${String(index + 1).padStart(12, '0')}`,
  name,
  imageUrl: INSURER_LOGOS[name]?.url ?? null,
  imageAlt: INSURER_LOGOS[name]?.alt ?? null,
  sortOrder: index + 1,
  isVisible: true,
}))

export const defaultContent: SiteContent = {
  settings: defaultSettings,
  services: defaultServices,
  insurers: defaultInsurers,
}

/* ───────────────────────────────────────────────────────────────────────────
   Contenido editorial fijo.

   Estas secciones no se editan desde el CMS a propósito: el administrador
   debe seguir siendo sencillo. Viven en el repositorio y se versionan con el
   código.
   ─────────────────────────────────────────────────────────────────────────── */

export const servicesSection = {
  eyebrow: 'Seguros',
  title: '¿Qué quieres proteger?',
  description:
    'Trabajo con distintas aseguradoras y ramos. Cuéntame tu caso y revisamos juntos qué alternativas existen para ti.',
}

export const humanSection = {
  eyebrow: 'Sentido humano',
  title: 'Lo que cambia cuando alguien te escucha antes de venderte.',
  pillars: [
    {
      title: 'Escucha real',
      description:
        'Antes de hablar de coberturas quiero entender qué quieres cuidar y por qué.',
    },
    {
      title: 'Comparación de propuestas',
      description:
        'Te presento diferentes alternativas y te explico en qué se distinguen.',
    },
    {
      title: 'A tu medida',
      description:
        'La opción correcta es la que se adapta a tu estilo de vida, tus objetivos y tu presupuesto.',
    },
    {
      title: 'Acompañamiento completo',
      description: 'Estoy contigo antes, durante y después de contratar tu seguro.',
    },
    {
      title: 'Trato honesto',
      description:
        'Honestidad, empatía, responsabilidad y respeto en cada conversación.',
    },
  ],
}

export const processSection = {
  eyebrow: 'Cómo trabajamos',
  title: 'Tres pasos, sin prisa y sin compromiso.',
  steps: [
    {
      title: 'Me cuentas qué necesitas proteger',
      description:
        'Una conversación tranquila para entender tu situación, tus prioridades y tu presupuesto.',
    },
    {
      title: 'Comparamos alternativas',
      description:
        'Reviso opciones de distintas aseguradoras y te explico con claridad en qué se diferencian.',
    },
    {
      title: 'Eliges con claridad y te acompaño',
      description:
        'La decisión es tuya. Yo me quedo cerca para lo que necesites antes, durante y después.',
    },
  ],
}

export const insurersSection = {
  eyebrow: 'Respaldo',
  title: 'Aseguradoras con las que trabajo',
  note: 'La disponibilidad de productos, coberturas y condiciones depende de cada aseguradora y del perfil de contratación.',
}

export const closingSection = {
  eyebrow: 'Contacto',
  title: 'Protege lo que has construido con tanto esfuerzo.',
  description:
    'Estoy lista para asesorarte de manera personalizada y sin compromiso. Escríbeme y platicamos con calma.',
}

export const footerNote =
  'La contratación, las coberturas, las condiciones y la disponibilidad de cada producto dependen de la aseguradora correspondiente y del perfil de contratación. Este sitio tiene fines informativos y no constituye una oferta de contrato.'
