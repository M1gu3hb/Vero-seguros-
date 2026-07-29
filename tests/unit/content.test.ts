import { describe, expect, it } from 'vitest'

import {
  defaultContent,
  defaultInsurers,
  defaultServices,
  defaultSettings,
} from '@/content/site-content'
import { MONOGRAM_PATHS, MONOGRAM_VIEWBOX } from '@/lib/brand'

describe('contenido inicial', () => {
  it('mantiene la identidad confirmada por Verónica', () => {
    expect(defaultSettings.brandName).toBe('Verónica Méndez')
    expect(defaultSettings.brandRole).toBe('Agente de Seguros Certificada')
    expect(defaultSettings.brandTagline).toBe('Seguros con Sentido Humano')
    expect(defaultSettings.contactEmail).toBe('veronicam0602@gmail.com')
    expect(defaultSettings.whatsappNumber).toBe('525540085632')
  })

  it('carga los ocho ramos confirmados, visibles y ordenados', () => {
    expect(defaultServices).toHaveLength(8)
    expect(defaultServices.map((service) => service.name)).toEqual([
      'Seguro de Vida',
      'Gastos Médicos Mayores',
      'Seguro de Auto',
      'Seguro para Camión',
      'Responsabilidad Civil',
      'Seguro de Hogar',
      'Gastos Funerarios',
      'Membresías de Salud',
    ])
    expect(defaultServices.every((service) => service.isVisible)).toBe(true)
    expect(defaultServices.map((service) => service.sortOrder)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('no repite identificadores de servicio', () => {
    const slugs = defaultServices.map((service) => service.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('carga las diez aseguradoras mencionadas y ninguna otra', () => {
    expect(defaultInsurers.map((insurer) => insurer.name)).toEqual([
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
    ])
  })

  it('no incluye «etcétera» como si fuera una aseguradora', () => {
    const names = defaultInsurers.map((insurer) => insurer.name.toLowerCase())
    expect(names).not.toContain('etcétera')
    expect(names).not.toContain('etc')
  })

  it('no escribe el número de WhatsApp en ningún texto visible', () => {
    const visible = [
      defaultSettings.brandName,
      defaultSettings.brandRole,
      defaultSettings.brandTagline,
      defaultSettings.coverageText,
      defaultSettings.heroEyebrow,
      defaultSettings.heroTitle,
      defaultSettings.heroDescription,
      defaultSettings.heroPrimaryCta,
      defaultSettings.heroSecondaryCta,
      defaultSettings.aboutTitle,
      defaultSettings.aboutIntro,
      defaultSettings.aboutBody,
      defaultSettings.aboutQuote,
      defaultSettings.promosTitle,
      defaultSettings.promosDescription,
      defaultSettings.promosNote,
      ...defaultServices.map((service) => `${service.name} ${service.description}`),
    ].join(' ')

    expect(visible).not.toContain('5540085632')
    expect(visible).not.toContain('55 4008 5632')
    // El mensaje prellenado tampoco debe llevar el número.
    expect(defaultSettings.whatsappMessage).not.toContain('5540085632')
  })

  it('no promete resultados ni usa llamadas agresivas', () => {
    const copy = [
      defaultSettings.heroTitle,
      defaultSettings.heroDescription,
      defaultSettings.heroPrimaryCta,
      defaultSettings.heroSecondaryCta,
      ...defaultServices.map((service) => service.description),
    ]
      .join(' ')
      .toLowerCase()

    for (const forbidden of [
      'compra ahora',
      'contrata ya',
      'última oportunidad',
      'garantizado',
      'la mejor asesora',
    ]) {
      expect(copy).not.toContain(forbidden)
    }
  })

  it('expone el mismo contenido agregado', () => {
    expect(defaultContent.settings).toBe(defaultSettings)
    expect(defaultContent.services).toBe(defaultServices)
    expect(defaultContent.insurers).toBe(defaultInsurers)
  })
})

describe('monograma', () => {
  it('define nueve trazos sobre un lienzo de altura 100', () => {
    expect(MONOGRAM_PATHS).toHaveLength(9)
    expect(MONOGRAM_VIEWBOX).toBe('0 0 225 100')
  })

  it('todos los trazos son trayectorias cerradas y válidas', () => {
    for (const path of MONOGRAM_PATHS) {
      expect(path.startsWith('M')).toBe(true)
      expect(path.trim().endsWith('Z')).toBe(true)
    }
  })
})
