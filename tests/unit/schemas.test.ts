import { describe, expect, it } from 'vitest'

import {
  contactSchema,
  imageSchema,
  insurerSchema,
  loginSchema,
  normalizeText,
  passwordChangeSchema,
  paymentTermsSchema,
  serviceSchema,
  slugSchema,
} from '@/lib/schemas'
import { defaultSettings } from '@/content/site-content'

describe('contactSchema', () => {
  it('acepta el contenido inicial', () => {
    expect(
      contactSchema.safeParse({
        contactEmail: defaultSettings.contactEmail,
        whatsappNumber: defaultSettings.whatsappNumber,
        whatsappMessage: defaultSettings.whatsappMessage,
      }).success,
    ).toBe(true)
  })

  it('normaliza el número de WhatsApp escrito con formato', () => {
    const result = contactSchema.safeParse({
      contactEmail: 'v@example.com',
      whatsappNumber: '+52 55 4008 5632',
      whatsappMessage: 'Hola, me gustaría recibir orientación.',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.whatsappNumber).toBe('525540085632')
  })

  it('rechaza un correo inválido', () => {
    expect(
      contactSchema.safeParse({
        contactEmail: 'no-es-correo',
        whatsappNumber: '525540085632',
        whatsappMessage: 'Hola, me gustaría recibir orientación.',
      }).success,
    ).toBe(false)
  })

  it('rechaza un número demasiado corto', () => {
    expect(
      contactSchema.safeParse({
        contactEmail: 'v@example.com',
        whatsappNumber: '55400',
        whatsappMessage: 'Hola, me gustaría recibir orientación.',
      }).success,
    ).toBe(false)
  })
})

describe('saltos de línea', () => {
  /*
   * El navegador envía el contenido de un campo de texto con saltos CRLF. Si no
   * se normalizan, la biografía se guarda con «\r\n\r\n» y deja de partirse en
   * párrafos al mostrarla.
   */
  it('convierte CRLF en saltos simples', () => {
    const limpio = normalizeText('Primer párrafo del texto.\r\n\r\nSegundo párrafo del texto.')
    expect(limpio).toBe('Primer párrafo del texto.\n\nSegundo párrafo del texto.')
    expect(limpio).not.toContain('\r')
    expect(limpio.split(/\n{2,}/)).toHaveLength(2)
  })

  it('reduce tres o más saltos seguidos a una separación de párrafo', () => {
    const limpio = normalizeText('Primer párrafo.\n\n\n\n\nSegundo párrafo.')
    expect(limpio.split(/\n{2,}/)).toHaveLength(2)
    expect(limpio).not.toContain('\n\n\n')
  })

  it('conserva el texto cuando ya viene limpio', () => {
    const cuerpo = 'Primer párrafo.\n\nSegundo párrafo.\n\nTercer párrafo.'
    expect(normalizeText(cuerpo)).toBe(cuerpo)
  })
})

describe('imageSchema', () => {
  it('convierte las cadenas vacías en null', () => {
    const result = imageSchema.safeParse({ url: '', alt: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBeNull()
      expect(result.data.alt).toBeNull()
    }
  })

  it('acepta una URL válida', () => {
    const result = imageSchema.safeParse({
      url: 'https://ejemplo.supabase.co/storage/v1/object/public/site-media/foto.webp',
      alt: 'Verónica Méndez',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza una URL inválida', () => {
    expect(imageSchema.safeParse({ url: 'no-es-una-url', alt: '' }).success).toBe(false)
  })
})

describe('slugSchema', () => {
  it('acepta identificadores en minúsculas con guiones', () => {
    expect(slugSchema.safeParse('gastos-medicos-mayores').success).toBe(true)
  })

  it.each(['Gastos Medicos', 'con_guion_bajo', 'ACENTOS', 'doble--guion', '-inicio', 'fin-'])(
    'rechaza «%s»',
    (value) => {
      expect(slugSchema.safeParse(value).success).toBe(false)
    },
  )
})

describe('serviceSchema', () => {
  const base = {
    name: 'Seguro de Vida',
    slug: 'vida',
    description: 'Alternativas pensadas para brindar protección financiera.',
    icon: 'vida',
    isVisible: true,
  }

  it('acepta un servicio nuevo sin id', () => {
    expect(serviceSchema.safeParse(base).success).toBe(true)
  })

  it('rechaza una descripción demasiado corta', () => {
    expect(serviceSchema.safeParse({ ...base, description: 'corta' }).success).toBe(false)
  })

  it('rechaza un id que no es uuid', () => {
    expect(serviceSchema.safeParse({ ...base, id: '123' }).success).toBe(false)
  })
})

describe('insurerSchema', () => {
  it('acepta una aseguradora sin logotipo', () => {
    const result = insurerSchema.safeParse({
      name: 'Zurich',
      imageUrl: '',
      imageAlt: '',
      isVisible: true,
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.imageUrl).toBeNull()
  })
})

describe('paymentTermsSchema', () => {
  const base = {
    promosVisible: true,
    promosInstallments: defaultSettings.promosInstallments,
    promosFrequencies: defaultSettings.promosFrequencies,
  }

  it('acepta el contenido inicial', () => {
    expect(paymentTermsSchema.safeParse(base).success).toBe(true)
  })

  it('descarta los renglones vacíos de las listas', () => {
    const result = paymentTermsSchema.safeParse({
      ...base,
      promosInstallments: ['3 meses', '   ', '', '12 meses'],
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promosInstallments).toEqual(['3 meses', '12 meses'])
  })

  it('admite una lista vacía: así se oculta ese bloque', () => {
    const result = paymentTermsSchema.safeParse({ ...base, promosFrequencies: [] })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promosFrequencies).toEqual([])
  })

  it('rechaza un elemento demasiado largo', () => {
    expect(
      paymentTermsSchema.safeParse({ ...base, promosInstallments: ['x'.repeat(41)] }).success,
    ).toBe(false)
  })

  it('rechaza más de doce elementos', () => {
    expect(
      paymentTermsSchema.safeParse({
        ...base,
        promosInstallments: Array.from({ length: 13 }, (_, i) => `${i + 1} meses`),
      }).success,
    ).toBe(false)
  })
})

describe('loginSchema', () => {
  it('exige un correo válido y una contraseña de al menos 8 caracteres', () => {
    expect(loginSchema.safeParse({ email: 'a@b.mx', password: '12345678' }).success).toBe(true)
    expect(loginSchema.safeParse({ email: 'a@b.mx', password: 'corta' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'nope', password: '12345678' }).success).toBe(false)
  })
})

describe('passwordChangeSchema', () => {
  it('exige que ambas contraseñas coincidan', () => {
    expect(
      passwordChangeSchema.safeParse({ password: 'contrasena-larga', confirm: 'contrasena-larga' })
        .success,
    ).toBe(true)
    expect(
      passwordChangeSchema.safeParse({ password: 'contrasena-larga', confirm: 'otra-cosa' })
        .success,
    ).toBe(false)
  })
})
