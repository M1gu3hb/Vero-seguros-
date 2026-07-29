import { describe, expect, it } from 'vitest'

import {
  heroSchema,
  identitySchema,
  insurerSchema,
  loginSchema,
  passwordChangeSchema,
  promosSchema,
  serviceSchema,
  slugSchema,
} from '@/lib/schemas'
import { defaultSettings } from '@/content/site-content'

describe('identitySchema', () => {
  const base = {
    brandName: defaultSettings.brandName,
    brandRole: defaultSettings.brandRole,
    brandTagline: defaultSettings.brandTagline,
    contactEmail: defaultSettings.contactEmail,
    whatsappNumber: defaultSettings.whatsappNumber,
    whatsappMessage: defaultSettings.whatsappMessage,
    coverageText: defaultSettings.coverageText,
  }

  it('acepta el contenido inicial', () => {
    expect(identitySchema.safeParse(base).success).toBe(true)
  })

  it('normaliza el número de WhatsApp escrito con formato', () => {
    const result = identitySchema.safeParse({ ...base, whatsappNumber: '+52 55 4008 5632' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.whatsappNumber).toBe('525540085632')
  })

  it('rechaza un correo inválido', () => {
    expect(identitySchema.safeParse({ ...base, contactEmail: 'no-es-correo' }).success).toBe(false)
  })

  it('rechaza un número demasiado corto', () => {
    expect(identitySchema.safeParse({ ...base, whatsappNumber: '55400' }).success).toBe(false)
  })

  it('rechaza campos vacíos', () => {
    expect(identitySchema.safeParse({ ...base, brandName: '   ' }).success).toBe(false)
  })
})

describe('heroSchema', () => {
  const base = {
    heroEyebrow: defaultSettings.heroEyebrow,
    heroTitle: defaultSettings.heroTitle,
    heroDescription: defaultSettings.heroDescription,
    heroPrimaryCta: defaultSettings.heroPrimaryCta,
    heroSecondaryCta: defaultSettings.heroSecondaryCta,
    heroImageUrl: '',
    heroImageAlt: '',
  }

  it('convierte las cadenas vacías de imagen en null', () => {
    const result = heroSchema.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.heroImageUrl).toBeNull()
      expect(result.data.heroImageAlt).toBeNull()
    }
  })

  it('acepta una URL de imagen válida', () => {
    const result = heroSchema.safeParse({
      ...base,
      heroImageUrl: 'https://ejemplo.supabase.co/storage/v1/object/public/site-media/foto.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza una URL inválida', () => {
    expect(heroSchema.safeParse({ ...base, heroImageUrl: 'no-es-url' }).success).toBe(false)
  })

  it('rechaza un título demasiado largo', () => {
    expect(heroSchema.safeParse({ ...base, heroTitle: 'a'.repeat(200) }).success).toBe(false)
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

describe('promosSchema', () => {
  it('acepta el contenido inicial', () => {
    expect(
      promosSchema.safeParse({
        promosTitle: defaultSettings.promosTitle,
        promosDescription: defaultSettings.promosDescription,
        promosNote: defaultSettings.promosNote,
        promosVisible: true,
      }).success,
    ).toBe(true)
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
