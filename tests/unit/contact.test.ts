import { describe, expect, it } from 'vitest'

import {
  DEFAULT_MAIL_SUBJECT,
  buildMailtoUrl,
  buildWhatsAppUrl,
  normalizeWhatsAppNumber,
} from '@/lib/contact'
import { defaultSettings } from '@/content/site-content'

describe('normalizeWhatsAppNumber', () => {
  it('elimina espacios, guiones y el signo más', () => {
    expect(normalizeWhatsAppNumber('+52 55 4008 5632')).toBe('525540085632')
    expect(normalizeWhatsAppNumber('55-4008-5632')).toBe('5540085632')
  })
})

describe('buildWhatsAppUrl', () => {
  it('arma el enlace con el número y el mensaje prellenado', () => {
    const url = buildWhatsAppUrl('525540085632', 'Hola, Verónica.')
    expect(url).toBe('https://wa.me/525540085632?text=Hola%2C%20Ver%C3%B3nica.')
  })

  it('usa el número confirmado de Verónica con el contenido inicial', () => {
    const url = buildWhatsAppUrl(
      defaultSettings.whatsappNumber,
      defaultSettings.whatsappMessage,
    )
    expect(url).not.toBeNull()
    expect(url?.startsWith('https://wa.me/525540085632?text=')).toBe(true)
    expect(decodeURIComponent(url!.split('?text=')[1] ?? '')).toBe(
      defaultSettings.whatsappMessage,
    )
  })

  it('devuelve null si el número no es utilizable', () => {
    expect(buildWhatsAppUrl('123', 'hola')).toBeNull()
    expect(buildWhatsAppUrl('', 'hola')).toBeNull()
    expect(buildWhatsAppUrl('1234567890123456789', 'hola')).toBeNull()
  })

  it('omite el parámetro de texto cuando no hay mensaje', () => {
    expect(buildWhatsAppUrl('525540085632', '   ')).toBe('https://wa.me/525540085632')
  })
})

describe('buildMailtoUrl', () => {
  it('genera un mailto válido con asunto', () => {
    expect(buildMailtoUrl('veronicam0602@gmail.com', DEFAULT_MAIL_SUBJECT)).toBe(
      'mailto:veronicam0602@gmail.com?subject=Orientaci%C3%B3n%20sobre%20seguros',
    )
  })

  it('genera un mailto simple sin asunto', () => {
    expect(buildMailtoUrl('veronicam0602@gmail.com')).toBe('mailto:veronicam0602@gmail.com')
  })
})
