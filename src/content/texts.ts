/**
 * Registro de todo el texto visible de la página.
 *
 * Cada frase que se lee en el sitio tiene aquí una clave, un rótulo con el que
 * se presenta en el administrador y un largo máximo. De aquí salen tres cosas
 * a la vez:
 *
 *  1. Los campos del administrador, sin escribirlos uno por uno.
 *  2. La vista previa editable, que trabaja sobre este mismo mapa de claves.
 *  3. El valor inicial de la base de datos.
 *
 * Hay dos orígenes. Las frases que ya vivían en `site_settings` siguen ahí —su
 * columna se indica en `column`— y el resto, que antes estaba escrito en el
 * código, pasa a la tabla `site_texts`. Para quien edita, la diferencia no
 * existe: todo se ve y se guarda igual.
 */

import { defaultSettings, humanSection, processSection } from '@/content/site-content'
import type { SiteSettings } from '@/content/site-content'

/** Cómo se edita: una línea o un texto con párrafos. */
export type TextKind = 'linea' | 'parrafo'

/** A qué pestaña del administrador pertenece. */
export type TextGroup =
  | 'identidad'
  | 'inicio'
  | 'seguros'
  | 'humano'
  | 'proceso'
  | 'sobre'
  | 'aseguradoras'
  | 'pagos'
  | 'cierre'

export type TextEntry = {
  key: string
  label: string
  hint?: string
  kind: TextKind
  min: number
  max: number
  group: TextGroup
  /** Si viene de `site_settings`, la propiedad correspondiente. */
  column?: keyof SiteSettings
  /** Valor con el que nace el sitio. */
  value: string
}

const linea = (min: number, max: number) => ({ kind: 'linea' as const, min, max })
const parrafo = (min: number, max: number) => ({ kind: 'parrafo' as const, min, max })

const pilar = (n: number): TextEntry[] => {
  const fuente = humanSection.pillars[n - 1]
  return [
    {
      key: `humano.pilar${n}.titulo`,
      label: `Punto ${n} · título`,
      ...linea(2, 60),
      group: 'humano',
      value: fuente?.title ?? '',
    },
    {
      key: `humano.pilar${n}.texto`,
      label: `Punto ${n} · descripción`,
      ...parrafo(10, 300),
      group: 'humano',
      value: fuente?.description ?? '',
    },
  ]
}

const paso = (n: number): TextEntry[] => {
  const fuente = processSection.steps[n - 1]
  return [
    {
      key: `proceso.paso${n}.titulo`,
      label: `Paso ${n} · título`,
      ...linea(2, 80),
      group: 'proceso',
      value: fuente?.title ?? '',
    },
    {
      key: `proceso.paso${n}.texto`,
      label: `Paso ${n} · descripción`,
      ...parrafo(10, 300),
      group: 'proceso',
      value: fuente?.description ?? '',
    },
  ]
}

export const TEXT_ENTRIES: readonly TextEntry[] = [
  /* ── Identidad ─────────────────────────────────────────────────────────── */
  {
    key: 'identidad.nombre',
    label: 'Nombre',
    ...linea(2, 80),
    group: 'identidad',
    column: 'brandName',
    value: defaultSettings.brandName,
  },
  {
    key: 'identidad.cargo',
    label: 'Cargo',
    ...linea(2, 90),
    group: 'identidad',
    column: 'brandRole',
    value: defaultSettings.brandRole,
  },
  {
    key: 'identidad.frase',
    label: 'Frase de marca',
    ...linea(2, 90),
    group: 'identidad',
    column: 'brandTagline',
    value: defaultSettings.brandTagline,
  },
  {
    key: 'identidad.cobertura',
    label: 'Texto de cobertura',
    ...linea(2, 90),
    group: 'identidad',
    column: 'coverageText',
    value: defaultSettings.coverageText,
  },
  {
    key: 'identidad.botonContacto',
    label: 'Botón del encabezado',
    hint: 'El botón oscuro de arriba a la derecha.',
    ...linea(2, 40),
    group: 'identidad',
    value: 'Ponte en contacto',
  },

  /* ── Inicio ────────────────────────────────────────────────────────────── */
  {
    key: 'inicio.etiqueta',
    label: 'Etiqueta superior',
    ...linea(2, 90),
    group: 'inicio',
    column: 'heroEyebrow',
    value: defaultSettings.heroEyebrow,
  },
  {
    key: 'inicio.titulo',
    label: 'Título principal',
    ...parrafo(10, 160),
    group: 'inicio',
    column: 'heroTitle',
    value: defaultSettings.heroTitle,
  },
  {
    key: 'inicio.descripcion',
    label: 'Descripción',
    ...parrafo(20, 500),
    group: 'inicio',
    column: 'heroDescription',
    value: defaultSettings.heroDescription,
  },
  {
    key: 'inicio.botonWhatsapp',
    label: 'Botón de WhatsApp',
    ...linea(2, 40),
    group: 'inicio',
    column: 'heroPrimaryCta',
    value: defaultSettings.heroPrimaryCta,
  },
  {
    key: 'inicio.botonCorreo',
    label: 'Botón de correo',
    ...linea(2, 40),
    group: 'inicio',
    column: 'heroSecondaryCta',
    value: defaultSettings.heroSecondaryCta,
  },
  {
    key: 'inicio.desliza',
    label: 'Aviso de desplazamiento',
    hint: 'La palabra pequeña del final de la primera pantalla.',
    ...linea(2, 24),
    group: 'inicio',
    value: 'Desliza',
  },

  /* ── Seguros ───────────────────────────────────────────────────────────── */
  {
    key: 'seguros.etiqueta',
    label: 'Rótulo de la sección',
    ...linea(2, 40),
    group: 'seguros',
    value: 'Seguros',
  },
  {
    key: 'seguros.titulo',
    label: 'Título',
    ...linea(2, 90),
    group: 'seguros',
    value: '¿Qué quieres proteger?',
  },
  {
    key: 'seguros.descripcion',
    label: 'Texto de entrada',
    ...parrafo(20, 400),
    group: 'seguros',
    value:
      'Trabajo con distintas aseguradoras y ramos. Cuéntame tu caso y revisamos juntos qué alternativas existen para ti.',
  },
  {
    key: 'seguros.abrir',
    label: 'Aviso para abrir un ramo',
    ...linea(2, 30),
    group: 'seguros',
    value: 'Qué cubre',
  },
  {
    key: 'seguros.cerrar',
    label: 'Aviso para cerrarlo',
    ...linea(2, 30),
    group: 'seguros',
    value: 'Cerrar',
  },

  /* ── Sentido humano ────────────────────────────────────────────────────── */
  {
    key: 'humano.etiqueta',
    label: 'Rótulo de la sección',
    ...linea(2, 40),
    group: 'humano',
    value: humanSection.eyebrow,
  },
  {
    key: 'humano.titulo',
    label: 'Título',
    ...parrafo(10, 160),
    group: 'humano',
    value: humanSection.title,
  },
  ...pilar(1),
  ...pilar(2),
  ...pilar(3),
  ...pilar(4),
  ...pilar(5),

  /* ── Proceso ───────────────────────────────────────────────────────────── */
  {
    key: 'proceso.etiqueta',
    label: 'Rótulo de la sección',
    ...linea(2, 40),
    group: 'proceso',
    value: processSection.eyebrow,
  },
  {
    key: 'proceso.titulo',
    label: 'Título',
    ...parrafo(10, 160),
    group: 'proceso',
    value: processSection.title,
  },
  ...paso(1),
  ...paso(2),
  ...paso(3),

  /* ── Sobre Verónica ────────────────────────────────────────────────────── */
  {
    key: 'sobre.etiqueta',
    label: 'Rótulo de la sección',
    ...linea(2, 40),
    group: 'sobre',
    value: 'Trayectoria',
  },
  {
    key: 'sobre.titulo',
    label: 'Título',
    ...linea(2, 90),
    group: 'sobre',
    column: 'aboutTitle',
    value: defaultSettings.aboutTitle,
  },
  {
    key: 'sobre.intro',
    label: 'Introducción',
    hint: 'Dos o tres líneas, destacadas en un tamaño mayor.',
    ...parrafo(20, 500),
    group: 'sobre',
    column: 'aboutIntro',
    value: defaultSettings.aboutIntro,
  },
  {
    key: 'sobre.biografia',
    label: 'Biografía',
    hint: 'Deja una línea en blanco entre párrafos.',
    ...parrafo(20, 4000),
    group: 'sobre',
    column: 'aboutBody',
    value: defaultSettings.aboutBody,
  },
  {
    key: 'sobre.cita',
    label: 'Cita destacada',
    ...parrafo(10, 300),
    group: 'sobre',
    column: 'aboutQuote',
    value: defaultSettings.aboutQuote,
  },
  {
    key: 'sobre.desde',
    label: 'Pie del monograma',
    hint: 'Sólo se ve mientras no haya fotografía cargada.',
    ...linea(2, 60),
    group: 'sobre',
    value: 'Agente desde 2018',
  },

  /* ── Aseguradoras ──────────────────────────────────────────────────────── */
  {
    key: 'aseguradoras.etiqueta',
    label: 'Rótulo de la sección',
    ...linea(2, 40),
    group: 'aseguradoras',
    value: 'Respaldo',
  },
  {
    key: 'aseguradoras.titulo',
    label: 'Título',
    ...linea(2, 90),
    group: 'aseguradoras',
    value: 'Aseguradoras con las que trabajo',
  },
  {
    key: 'aseguradoras.nota',
    label: 'Nota de disponibilidad',
    ...parrafo(10, 400),
    group: 'aseguradoras',
    value:
      'La disponibilidad de productos, coberturas y condiciones depende de cada aseguradora y del perfil de contratación.',
  },

  /* ── Formas de pago ────────────────────────────────────────────────────── */
  {
    key: 'pagos.etiqueta',
    label: 'Rótulo de la sección',
    ...linea(2, 40),
    group: 'pagos',
    value: 'Formas de pago',
  },
  {
    key: 'pagos.titulo',
    label: 'Título',
    ...linea(2, 90),
    group: 'pagos',
    column: 'promosTitle',
    value: defaultSettings.promosTitle,
  },
  {
    key: 'pagos.descripcion',
    label: 'Descripción',
    ...parrafo(20, 700),
    group: 'pagos',
    column: 'promosDescription',
    value: defaultSettings.promosDescription,
  },
  {
    key: 'pagos.rotuloPlazos',
    label: 'Rótulo de los plazos',
    ...linea(2, 90),
    group: 'pagos',
    column: 'promosInstallmentsLabel',
    value: defaultSettings.promosInstallmentsLabel,
  },
  {
    key: 'pagos.rotuloModalidades',
    label: 'Rótulo de las modalidades',
    ...linea(2, 90),
    group: 'pagos',
    column: 'promosFrequenciesLabel',
    value: defaultSettings.promosFrequenciesLabel,
  },
  {
    key: 'pagos.nota',
    label: 'Nota de condiciones',
    ...parrafo(10, 400),
    group: 'pagos',
    column: 'promosNote',
    value: defaultSettings.promosNote,
  },

  /* ── Cierre y pie ──────────────────────────────────────────────────────── */
  {
    key: 'cierre.etiqueta',
    label: 'Rótulo de la sección',
    ...linea(2, 40),
    group: 'cierre',
    value: 'Contacto',
  },
  {
    key: 'cierre.titulo',
    label: 'Título',
    ...parrafo(10, 160),
    group: 'cierre',
    value: 'Protege lo que has construido con tanto esfuerzo.',
  },
  {
    key: 'cierre.descripcion',
    label: 'Descripción',
    ...parrafo(20, 400),
    group: 'cierre',
    value:
      'Estoy lista para asesorarte de manera personalizada y sin compromiso. Escríbeme y platicamos con calma.',
  },
  {
    key: 'cierre.botonWhatsapp',
    label: 'Botón de WhatsApp',
    ...linea(2, 40),
    group: 'cierre',
    value: 'Platiquemos por WhatsApp',
  },
  {
    key: 'cierre.botonCorreo',
    label: 'Botón de correo',
    ...linea(2, 40),
    group: 'cierre',
    value: 'Quiero recibir orientación',
  },
  {
    key: 'cierre.rotuloCorreo',
    label: 'Rótulo del correo',
    ...linea(2, 30),
    group: 'cierre',
    value: 'Correo',
  },
  {
    key: 'cierre.rotuloCobertura',
    label: 'Rótulo de la cobertura',
    ...linea(2, 30),
    group: 'cierre',
    value: 'Cobertura',
  },
  {
    key: 'pie.contacto',
    label: 'Pie · título de contacto',
    ...linea(2, 30),
    group: 'cierre',
    value: 'Contacto',
  },
  {
    key: 'pie.secciones',
    label: 'Pie · título de secciones',
    ...linea(2, 30),
    group: 'cierre',
    value: 'Secciones',
  },
  {
    key: 'pie.nota',
    label: 'Pie · nota legal',
    ...parrafo(20, 600),
    group: 'cierre',
    value:
      'La contratación, las coberturas, las condiciones y la disponibilidad de cada producto dependen de la aseguradora correspondiente y del perfil de contratación. Este sitio tiene fines informativos y no constituye una oferta de contrato.',
  },
] as const

/** Índice por clave, para no recorrer la lista en cada consulta. */
export const TEXT_BY_KEY: ReadonlyMap<string, TextEntry> = new Map(
  TEXT_ENTRIES.map((entry) => [entry.key, entry]),
)

/** Las claves que viven en la tabla `site_texts` (las demás son columnas). */
export const STANDALONE_KEYS: readonly string[] = TEXT_ENTRIES.filter(
  (entry) => !entry.column,
).map((entry) => entry.key)

/** Los valores con los que nace el sitio. */
export const defaultTexts: Record<string, string> = Object.fromEntries(
  TEXT_ENTRIES.map((entry) => [entry.key, entry.value]),
)

/** Las claves de un grupo, en el orden en que se declaran. */
export function textsOfGroup(group: TextGroup): TextEntry[] {
  return TEXT_ENTRIES.filter((entry) => entry.group === group)
}

/**
 * El mapa completo que consume la página.
 *
 * Une lo que hay en `site_settings` con lo que hay en `site_texts`, de modo
 * que quien pinta la página no tiene que saber de dónde sale cada frase.
 */
export function buildTexts(
  settings: SiteSettings,
  stored: Record<string, string> = {},
): Record<string, string> {
  const map: Record<string, string> = {}

  for (const entry of TEXT_ENTRIES) {
    if (entry.column) {
      const value = settings[entry.column]
      map[entry.key] = typeof value === 'string' ? value : entry.value
    } else {
      map[entry.key] = stored[entry.key] ?? entry.value
    }
  }

  return map
}

/**
 * Aplica un borrador de textos sobre los ajustes.
 *
 * La vista previa necesita un objeto de ajustes completo —para la fotografía,
 * el correo o los plazos de pago—, pero con las frases que se están editando
 * en este momento, no con las guardadas.
 */
export function settingsWithDraft(
  base: SiteSettings,
  draft: Record<string, string>,
): SiteSettings {
  const result: SiteSettings = { ...base }

  for (const entry of TEXT_ENTRIES) {
    if (!entry.column) continue
    const value = draft[entry.key]
    if (typeof value === 'string') {
      ;(result as Record<string, unknown>)[entry.column] = value
    }
  }

  return result
}
