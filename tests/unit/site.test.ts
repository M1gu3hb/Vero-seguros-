import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * La dirección canónica del sitio.
 *
 * De ella salen el `<link rel="canonical">`, las tarjetas al compartir el
 * enlace, el `robots.txt` y el mapa del sitio. Si se equivoca, Google indexa
 * una dirección que ya no es y la vista previa de WhatsApp se rompe.
 *
 * Esto pasó de verdad: al renombrar el dominio del proyecto en Vercel, la
 * variable escrita a mano se quedó apuntando al anterior y todos los metadatos
 * siguieron señalando una dirección que ya sólo redirige. De ahí el orden que
 * se comprueba aquí, que va a contracorriente a propósito: en Vercel manda el
 * dominio de la plataforma, porque lo mantiene ella y no hay nada que recordar.
 *
 * `SITE_URL` se calcula al importar el módulo, así que cada caso necesita una
 * importación nueva.
 */
async function leerSitioUrl() {
  vi.resetModules()
  const { SITE_URL } = await import('@/lib/site')
  return SITE_URL
}

describe('SITE_URL', () => {
  const original = { ...process.env }

  beforeEach(() => {
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  afterEach(() => {
    process.env = { ...original }
  })

  it('en Vercel usa el dominio principal del proyecto', async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'veronica-mendez.vercel.app'
    expect(await leerSitioUrl()).toBe('https://veronica-mendez.vercel.app')
  })

  it('en Vercel el dominio de la plataforma gana a la variable escrita a mano', async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'dominio-nuevo.vercel.app'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://dominio-viejo.vercel.app'
    expect(await leerSitioUrl()).toBe('https://dominio-nuevo.vercel.app')
  })

  it('fuera de Vercel manda la variable escrita a mano', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://veronicamendez.mx'
    expect(await leerSitioUrl()).toBe('https://veronicamendez.mx')
  })

  it('sin nada configurado cae en el servidor local', async () => {
    expect(await leerSitioUrl()).toBe('http://localhost:3000')
  })

  it('quita la barra final, venga de donde venga', async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'veronica-mendez.vercel.app/'
    expect(await leerSitioUrl()).toBe('https://veronica-mendez.vercel.app')

    delete process.env.VERCEL_PROJECT_PRODUCTION_URL
    process.env.NEXT_PUBLIC_SITE_URL = 'https://veronicamendez.mx/'
    expect(await leerSitioUrl()).toBe('https://veronicamendez.mx')
  })
})
