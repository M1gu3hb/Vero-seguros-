import { expect, test, type Page } from '@playwright/test'

/*
 * Estas pruebas comprueban el comportamiento del sitio, no el contenido: todo
 * lo que se ve es editable desde el CMS, así que fijar aquí nombres de ramos o
 * de aseguradoras haría que la suite se rompiera cada vez que Verónica cambia
 * algo. Se verifican invariantes: que haya contenido, que los enlaces se
 * formen bien y que el número de WhatsApp nunca se escriba.
 */

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
  test('renderiza la identidad y todas las secciones con contenido', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Verónica Méndez \| Seguros con Sentido Humano/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Seguros con Sentido Humano').first()).toBeVisible()

    await scrollThrough(page)

    // Cada ramo publicado tiene nombre y descripción
    const servicios = await page.locator('#seguros h3').allInnerTexts()
    expect(servicios.length).toBeGreaterThan(0)
    for (const nombre of servicios) expect(nombre.trim().length).toBeGreaterThan(2)

    // Y cada aseguradora publicada se ve, con logotipo o con su nombre
    const marcas = await page
      .locator('#aseguradoras img, #aseguradoras [class*="name"]')
      .count()
    expect(marcas).toBeGreaterThan(0)

    // La biografía llega separada en párrafos, no como un bloque
    const parrafos = await page.locator('#sobre-veronica p').count()
    expect(parrafos).toBeGreaterThan(2)
  })

  test('los logotipos de las aseguradoras se sirven correctamente', async ({ page, request }) => {
    await page.goto('/')

    const sources = await page
      .locator('#aseguradoras img')
      .evaluateAll((nodes) => nodes.map((n) => (n as HTMLImageElement).getAttribute('src') ?? ''))

    expect(sources.length).toBeGreaterThan(0)

    for (const src of [...new Set(sources)]) {
      const response = await request.get(src)
      expect(response.ok(), `no se pudo cargar ${src}`).toBe(true)
    }

    // Cada logotipo debe pintar realmente algo y no quedar en blanco
    const painted = await page.locator('#aseguradoras img').evaluateAll((nodes) =>
      nodes.map((n) => {
        const img = n as HTMLImageElement
        return { src: img.getAttribute('src'), ok: img.naturalWidth > 0 && img.naturalHeight > 0 }
      }),
    )
    expect(painted.filter((p) => !p.ok)).toEqual([])
  })

  test('el enlace de WhatsApp se forma bien y lleva mensaje prellenado', async ({ page }) => {
    await page.goto('/')

    // Se busca dentro de <main>: el botón del encabezado se oculta en pantallas
    // pequeñas y el del hero está siempre presente.
    const link = page.locator('main a[href^="https://wa.me/"]').first()
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\/\d{10,15}\?text=.+/)

    const message = decodeURIComponent(href!.split('?text=')[1] ?? '')
    expect(message.trim().length).toBeGreaterThan(10)
  })

  test('el número de WhatsApp no aparece escrito en el sitio', async ({ page }) => {
    await page.goto('/')

    // El número se toma del propio enlace: así la prueba sigue siendo válida
    // aunque Verónica lo cambie desde el administrador.
    const href = await page.locator('main a[href^="https://wa.me/"]').first().getAttribute('href')
    const digits = href!.match(/wa\.me\/(\d+)/)![1]!
    const local = digits.slice(-10)

    await scrollThrough(page)
    const text = await page.locator('body').innerText()

    for (const forma of [
      digits,
      local,
      `${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`,
      `${local.slice(0, 2)}-${local.slice(2, 6)}-${local.slice(6)}`,
    ]) {
      expect(text, `el número no debe aparecer como «${forma}»`).not.toContain(forma)
    }
  })

  test('el correo se muestra y abre un enlace mailto', async ({ page }) => {
    await page.goto('/')
    await scrollThrough(page)

    const mailto = page.locator('main a[href^="mailto:"]').first()
    await expect(mailto).toBeVisible()

    const href = await mailto.getAttribute('href')
    const address = href!.replace(/^mailto:/, '').split('?')[0]!
    expect(address).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i)
    await expect(page.getByText(address).first()).toBeVisible()
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

/*
 * Se usa `page.emulateMedia` y no `test.use({ reducedMotion })`: con esta
 * configuración de proyectos la opción no llega al navegador, y una prueba que
 * no emula nada da un falso positivo.
 */
test.describe('movimiento reducido', () => {
  test('el contenido está visible de verdad, sin necesidad de hacer scroll', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    expect(
      await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    ).toBe(true)
    await page.waitForTimeout(500)

    /*
     * `toBeVisible` de Playwright considera visible un elemento con
     * `opacity: 0`, así que aquí se mide la opacidad calculada: es la única
     * forma de detectar que una aparición al hacer scroll dejó el contenido
     * invisible para una persona.
     */
    const invisibles = await page.locator('[data-reveal]').evaluateAll((nodes) =>
      nodes
        .filter((n) => Number.parseFloat(getComputedStyle(n).opacity) < 0.99)
        .map((n) => n.textContent?.slice(0, 40) ?? ''),
    )
    expect(invisibles).toEqual([])

    // Y ningún bloque queda desplazado de su posición final
    const desplazados = await page.locator('[data-reveal]').evaluateAll((nodes) =>
      nodes.filter((n) => getComputedStyle(n).transform !== 'none').length,
    )
    expect(desplazados).toBe(0)

    await expect(page.getByRole('heading', { name: 'Seguro de Vida' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /Sobre Verónica/ })).toBeVisible()
  })

  test('la cinta de aseguradoras se sustituye por una lista estática', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForTimeout(400)

    const marquee = page.locator('#aseguradoras [class*="marquee"]').first()
    await expect(marquee).toBeHidden()

    // Las aseguradoras siguen visibles en la lista estática
    const marcas = await page.locator('#aseguradoras img, #aseguradoras [class*="name"]').count()
    expect(marcas).toBeGreaterThan(0)
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
