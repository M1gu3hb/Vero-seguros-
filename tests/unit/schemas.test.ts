import { describe, expect, it } from 'vitest'

import {
  contactSchema,
  idSchema,
  imageSchema,
  insurerSchema,
  loginSchema,
  MAX_TEXTOS_POR_LOTE,
  normalizeText,
  passwordChangeSchema,
  paymentTermsSchema,
  serviceSchema,
  slugSchema,
  textsSchema,
} from '@/lib/schemas'
import { SUPABASE_URL } from '@/lib/supabase/config'
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
  const almacen = `${SUPABASE_URL}/storage/v1/object/public/site-media`

  it('convierte las cadenas vacías en null', () => {
    const result = imageSchema.safeParse({ url: '', alt: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.url).toBeNull()
      expect(result.data.alt).toBeNull()
    }
  })

  it('acepta una imagen subida desde el administrador', () => {
    const result = imageSchema.safeParse({
      url: `${almacen}/sobre/foto.webp`,
      alt: 'Verónica Méndez',
    })
    expect(result.success).toBe(true)
  })

  it('acepta una ruta del propio sitio, como los logotipos incluidos', () => {
    expect(imageSchema.safeParse({ url: '/brand/zurich.svg', alt: '' }).success).toBe(true)
  })

  it('rechaza una URL inválida', () => {
    expect(imageSchema.safeParse({ url: 'no-es-una-url', alt: '' }).success).toBe(false)
  })

  /*
   * Lo importante de este bloque: una dirección pegada a mano no puede
   * apuntar fuera. Si pudiera, la página cargaría una imagen de un tercero
   * —que vería la dirección de cada visitante y podría cambiarla cuando
   * quisiera— y ni siquiera se mostraría, porque el optimizador de imágenes
   * admite exactamente esta misma lista.
   */
  it.each([
    'https://servidor-ajeno.com/foto.jpg',
    'https://otro-proyecto.supabase.co/storage/v1/object/public/site-media/foto.jpg',
    `http://${new URL(SUPABASE_URL).hostname}/storage/v1/object/public/site-media/foto.jpg`,
    `${SUPABASE_URL}/rest/v1/site_settings`,
    'javascript:alert(1)',
    'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    '//evil.example.com/foto.jpg',
  ])('rechaza «%s»', (url) => {
    expect(imageSchema.safeParse({ url, alt: '' }).success).toBe(false)
  })

  it('la aseguradora tampoco admite un logotipo de fuera', () => {
    const base = { name: 'Zurich', imageAlt: '', isVisible: true }
    expect(insurerSchema.safeParse({ ...base, imageUrl: '/brand/zurich.svg' }).success).toBe(true)
    expect(
      insurerSchema.safeParse({ ...base, imageUrl: 'https://servidor-ajeno.com/logo.svg' }).success,
    ).toBe(false)
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

describe('textsSchema', () => {
  it('acepta un lote normal', () => {
    expect(textsSchema.safeParse({ values: { 'inicio.titulo': 'Hola' } }).success).toBe(true)
  })

  it('rechaza un lote vacío', () => {
    expect(textsSchema.safeParse({ values: {} }).success).toBe(false)
  })

  /*
   * El campo llega como JSON desde el navegador, así que su tamaño no lo
   * decide el catálogo: lo decide quien envía el formulario.
   */
  it('rechaza un lote con demasiadas frases', () => {
    const values = Object.fromEntries(
      Array.from({ length: MAX_TEXTOS_POR_LOTE + 1 }, (_, i) => [`grupo.clave${i}`, 'x']),
    )
    expect(textsSchema.safeParse({ values }).success).toBe(false)
  })

  it('rechaza una frase desmedida', () => {
    expect(textsSchema.safeParse({ values: { 'inicio.titulo': 'x'.repeat(4001) } }).success).toBe(
      false,
    )
  })
})

describe('idSchema', () => {
  it('exige un identificador con forma de uuid', () => {
    expect(idSchema.safeParse('7d3f1a2e-5b6c-4d8e-9f01-23456789abcd').success).toBe(true)
    for (const valor of ['', '1', 'todos', "' or 1=1 --"]) {
      expect(idSchema.safeParse(valor).success).toBe(false)
    }
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
