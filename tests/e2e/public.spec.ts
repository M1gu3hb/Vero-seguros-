import { expect, test, type Page } from '@playwright/test'

const WHATSAPP_DIGITS = '525540085632'
const EMAIL = 'veronicam0602@gmail.com'

/** Recorre la página para disparar las apariciones al hacer scroll. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 90))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(400)
}

test.describe('página pública', () => {
  test('renderiza la identidad y el contenido inicial', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Verónica Méndez \| Seguros con Sentido Humano/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Seguros con Sentido Humano').first()).toBeVisible()

    await scrollThrough(page)

    for (const name of [
      'Seguro de Vida',
      'Gastos Médicos Mayores',
      'Seguro de Auto',
      'Seguro para Camión',
      'Responsabilidad Civil',
      'Seguro de Hogar',
      'Gastos Funerarios',
      'Membresías de Salud',
    ]) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    }

    await expect(page.getByText('Zurich').first()).toBeVisible()
  })

  test('el enlace de WhatsApp lleva el número y el mensaje correctos', async ({ page }) => {
    await page.goto('/')

    // Se busca dentro de <main>: el botón del encabezado se oculta en pantallas
    // pequeñas y el del hero está siempre presente.
    const link = page.locator(`main a[href^="https://wa.me/${WHATSAPP_DIGITS}"]`).first()
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toContain(`https://wa.me/${WHATSAPP_DIGITS}?text=`)

    const message = decodeURIComponent(href!.split('?text=')[1] ?? '')
    expect(message).toContain('Hola, Verónica')
  })

  test('el número de WhatsApp no aparece escrito en el sitio', async ({ page }) => {
    await page.goto('/')
    await scrollThrough(page)

    const text = await page.locator('body').innerText()
    expect(text).not.toContain('5540085632')
    expect(text).not.toContain('55 4008 5632')
    expect(text).not.toContain('55-4008-5632')
  })

  test('el correo abre un enlace mailto', async ({ page }) => {
    await page.goto('/')
    await scrollThrough(page)

    const mailto = page.locator(`main a[href^="mailto:${EMAIL}"]`).first()
    await expect(mailto).toHaveAttribute('href', new RegExp(`^mailto:${EMAIL}`))
    await expect(page.getByText(EMAIL).first()).toBeVisible()
  })

  test('las anclas de navegación existen y apuntan a secciones reales', async ({ page }) => {
    await page.goto('/')

    for (const id of ['inicio', 'seguros', 'sobre-veronica', 'aseguradoras', 'contacto']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1)
    }
  })

  test('no hay desplazamiento horizontal', async ({ page }) => {
    await page.goto('/')
    await scrollThrough(page)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflow).toBe(false)
  })

  test('no expone un enlace al administrador', async ({ page }) => {
    await page.goto('/')
    await scrollThrough(page)
    await expect(page.locator('a[href*="/admin"]')).toHaveCount(0)
  })

  test('no produce errores en consola', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto('/')
    await scrollThrough(page)

    // Las peticiones bloqueadas por la red del entorno no son fallos del sitio.
    const relevant = errors.filter((error) => !/net::ERR_|Failed to load resource/.test(error))
    expect(relevant).toEqual([])
  })

  test('la estructura de encabezados es correcta', async ({ page }) => {
    await page.goto('/')
    await scrollThrough(page)

    await expect(page.locator('h1')).toHaveCount(1)
    expect(await page.locator('h2').count()).toBeGreaterThan(3)
  })

  test('publica datos estructurados sin inventar información', async ({ page }) => {
    await page.goto('/')
    const raw = await page.locator('script[type="application/ld+json"]').first().innerText()
    const data = JSON.parse(raw)

    const person = data['@graph'].find((node: { '@type': string }) => node['@type'] === 'Person')
    expect(person.name).toBe('Verónica Méndez')
    expect(person.jobTitle).toBe('Agente de Seguros Certificada')
    expect(person.address).toBeUndefined()
    expect(person.telephone).toBeUndefined()
    expect(person.aggregateRating).toBeUndefined()
  })
})

test.describe('menú móvil', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 992, 'sólo aplica en pantallas pequeñas')

  test('se abre, navega y se cierra con Escape', async ({ page }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Abrir menú' })
    await expect(toggle).toBeVisible()
    await toggle.click()

    const dialog = page.getByRole('dialog', { name: 'Menú de navegación' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Seguros' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await toggle.click()
    await dialog.getByRole('link', { name: 'Seguros' }).click()
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(/#seguros$/)
  })
})

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' })

  test('el contenido sigue siendo legible sin animaciones', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Seguro de Vida' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /Sobre Verónica/ })).toBeVisible()
    await expect(page.getByText('Zurich').first()).toBeVisible()
  })
})

test.describe('metadatos', () => {
  test('sirve robots.txt y sitemap.xml', async ({ request }) => {
    const robots = await request.get('/robots.txt')
    expect(robots.ok()).toBe(true)
    expect(await robots.text()).toContain('Sitemap:')
    expect(await (await request.get('/robots.txt')).text()).toContain('/admin')

    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBe(true)
    expect(await sitemap.text()).toContain('<urlset')
  })

  test('envía cabeceras de seguridad', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })
})
