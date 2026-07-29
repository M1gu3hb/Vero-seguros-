import { expect, test } from '@playwright/test'

/*
 * Se usa `||` y no `??`: en GitHub Actions una variable no configurada llega
 * como cadena vacía, y una URL vacía haría que la petición se resolviera
 * contra la propia aplicación en lugar de contra Supabase.
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://vuzyhbiwnnngeohysxcw.supabase.co'
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'sb_publishable_26WQI_ceor1wl2Nk43BR1A_NH1zJYDK'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL?.trim()
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD?.trim()

test.describe('acceso al administrador', () => {
  test('un visitante sin sesión es enviado a /admin/login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login$/)
    await expect(page.getByRole('heading', { name: 'Administrador del sitio' })).toBeVisible()
  })

  test('la pantalla de acceso pide correo y contraseña', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password')
  })

  test('rechaza credenciales vacías o mal formadas sin llamar al servidor', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('input[name="email"]').fill('no-es-correo')
    await page.locator('input[name="password"]').fill('123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Escribe un correo válido.')).toBeVisible()
  })

  /*
   * La contraseña ya no viaja desde el navegador: la comprueba el servidor
   * contra Supabase. Si esta prueba fallara, es que el navegador ha vuelto a
   * hablar con Supabase por su cuenta.
   */
  /*
   * Un intento fallido puede acabar de dos maneras legítimas: con el
   * «correo o contraseña incorrectos» de siempre, o con el freno de intentos
   * si la prueba anterior ya gastó unos cuantos desde esta misma dirección.
   * Las dos valen; lo que no vale es entrar.
   */
  const RECHAZO = /Correo o contraseña incorrectos\.|Demasiados intentos/

  test('la contraseña no sale del servidor', async ({ page }) => {
    const aSupabase: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('supabase.co')) aSupabase.push(request.url())
    })

    await page.goto('/admin/login')
    await page.locator('input[name="email"]').fill('nadie@example.com')
    await page.locator('input[name="password"]').fill('contrasena-inventada')
    await page.getByRole('button', { name: 'Entrar' }).click()

    // Dentro del formulario: Next.js pone otro `role="alert"` suyo en la página.
    await expect(page.locator('form [role="alert"]')).toHaveText(RECHAZO)
    expect(aSupabase, 'el navegador no debe hablar con Supabase').toEqual([])
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test('el mensaje de error no distingue el correo de la contraseña', async ({ page }) => {
    /*
     * Decir «ese correo no existe» le confirmaría a quien prueba cuáles de sus
     * correos son buenos. El mensaje tiene que ser el mismo siempre.
     */
    await page.goto('/admin/login')
    await page.locator('input[name="email"]').fill('no-existe-nadie-asi@example.com')
    await page.locator('input[name="password"]').fill('contrasena-inventada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    // Dentro del formulario: Next.js pone otro `role="alert"` suyo en la página.
    await expect(page.locator('form [role="alert"]')).toHaveText(RECHAZO)
  })

  test('el administrador no se indexa', async ({ request }) => {
    const response = await request.get('/admin/login')
    const html = await response.text()
    expect(html).toContain('noindex')
    expect(response.headers()['x-robots-tag']).toContain('noindex')
  })
})

test.describe('política de seguridad de contenido', () => {
  test('la página pública declara una sola política y no habla con nadie', async ({ request }) => {
    const response = await request.get('/')
    const csp = response.headers()['content-security-policy']

    expect(csp).toBeTruthy()
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("base-uri 'self'")
    // La página pública recibe su contenido ya pintado desde el servidor.
    expect(csp).toContain("connect-src 'self'")
  })

  test('el administrador firma cada respuesta y no admite código sin firma', async ({ request }) => {
    const response = await request.get('/admin/login')
    const csp = response.headers()['content-security-policy'] ?? ''

    const firma = csp.match(/'nonce-([^']+)'/)
    expect(firma, 'el administrador tiene que llevar una firma por respuesta').not.toBeNull()

    const scriptSrc = csp.split(';').find((parte) => parte.trim().startsWith('script-src'))
    expect(scriptSrc).not.toContain('unsafe-inline')
    expect(scriptSrc).not.toContain('unsafe-eval')
    expect(scriptSrc).toContain('strict-dynamic')

    // Y todos los scripts de la página llevan esa misma firma.
    const html = await response.text()
    const scripts = html.match(/<script[^>]*>/g) ?? []
    expect(scripts.length).toBeGreaterThan(0)
    for (const script of scripts) {
      expect(script, `un script sin firma: ${script}`).toContain(`nonce="${firma![1]}"`)
    }
  })

  test('la firma cambia en cada visita', async ({ request }) => {
    const primera = await request.get('/admin/login')
    const segunda = await request.get('/admin/login')

    const firmaDe = (respuesta: { headers: () => Record<string, string> }) =>
      (respuesta.headers()['content-security-policy'] ?? '').match(/'nonce-([^']+)'/)?.[1]

    expect(firmaDe(primera)).toBeTruthy()
    expect(firmaDe(primera)).not.toBe(firmaDe(segunda))
  })

  test('la página carga sin que el navegador rechace nada', async ({ page }) => {
    const rechazos: string[] = []
    page.on('console', (mensaje) => {
      if (mensaje.type() === 'error' && /Content Security Policy/i.test(mensaje.text())) {
        rechazos.push(mensaje.text())
      }
    })

    for (const ruta of ['/', '/admin/login']) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')
    }

    expect(rechazos).toEqual([])
  })
})

test.describe('protección de la base de datos', () => {
  const headers = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }

  test('un usuario no autorizado no puede escribir', async ({ request }) => {
    expect(SUPABASE_URL).toMatch(/^https:\/\//)

    /*
     * Ahora el rechazo llega antes de las políticas: sin sesión de
     * administración no hay siquiera permiso para escribir en la tabla, así
     * que la base contesta «permiso denegado» en vez de «cero filas».
     */
    const update = await request.patch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.1`, {
      headers,
      data: { brand_name: 'Intento no autorizado' },
    })
    expect(update.ok()).toBe(false)

    const insert = await request.post(`${SUPABASE_URL}/rest/v1/services`, {
      headers,
      data: { name: 'Intruso', slug: 'intruso-no-autorizado', description: 'No debería existir.' },
    })
    expect(insert.ok()).toBe(false)

    const borrado = await request.delete(`${SUPABASE_URL}/rest/v1/insurers?name=eq.Zurich`, {
      headers,
    })
    expect(borrado.ok()).toBe(false)

    const texto = await request.post(`${SUPABASE_URL}/rest/v1/site_texts`, {
      headers,
      data: { key: 'intruso.clave', value: 'no debería existir' },
    })
    expect(texto.ok()).toBe(false)

    // La lectura pública sí funciona y el contenido sigue intacto.
    const settings = await request.get(`${SUPABASE_URL}/rest/v1/site_settings?select=brand_name`, {
      headers,
    })
    expect(await settings.text()).toContain('Verónica Méndez')

    const insurers = await request.get(
      `${SUPABASE_URL}/rest/v1/insurers?select=name&name=eq.Zurich`,
      { headers },
    )
    expect(await insurers.text()).toContain('Zurich')

    const intruder = await request.get(
      `${SUPABASE_URL}/rest/v1/services?select=slug&slug=eq.intruso-no-autorizado`,
      { headers },
    )
    expect(await intruder.json()).toEqual([])
  })

  test('la lista de administradoras no se puede leer ni tocar desde fuera', async ({ request }) => {
    const lectura = await request.get(`${SUPABASE_URL}/rest/v1/admin_users?select=*`, { headers })
    // O no hay permiso, o la política no deja ver ninguna fila. Nunca datos.
    if (lectura.ok()) expect(await lectura.json()).toEqual([])

    const alta = await request.post(`${SUPABASE_URL}/rest/v1/admin_users`, {
      headers,
      data: { user_id: '00000000-0000-4000-8000-000000000000', email: 'intruso@example.com' },
    })
    expect(alta.ok()).toBe(false)
  })

  test('la bitácora de cambios no se lee ni se escribe desde fuera', async ({ request }) => {
    const lectura = await request.get(`${SUPABASE_URL}/rest/v1/content_audit?select=*`, { headers })
    if (lectura.ok()) expect(await lectura.json()).toEqual([])

    const escritura = await request.post(`${SUPABASE_URL}/rest/v1/content_audit`, {
      headers,
      data: { tabla: 'services', fila: 'x', accion: 'baja' },
    })
    expect(escritura.ok()).toBe(false)
  })

  /*
   * El bucket es público para que las fotos se vean por su dirección. Lo que
   * no debe poder hacerse es pedir el índice: ahí aparecerían también las
   * fotos que se subieron y luego se sustituyeron, que ya no salen en ningún
   * sitio de la página.
   */
  test('las imágenes se ven por su dirección, pero el bucket no se puede listar', async ({
    request,
  }) => {
    const listado = await request.post(`${SUPABASE_URL}/storage/v1/object/list/site-media`, {
      headers,
      data: { prefix: '', limit: 100 },
    })

    if (listado.ok()) {
      expect(await listado.json()).toEqual([])
    }
  })
})

/*
 * Las pruebas con sesión sólo se ejecutan si se proporcionan credenciales de
 * una cuenta administradora de prueba (ver .env.example).
 */
test.describe('sesión de la administradora', () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    'define E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para ejecutar estas pruebas',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('input[name="email"]').fill(ADMIN_EMAIL!)
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD!)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/admin')
  })

  /*
   * Ésta es la única prueba que **guarda** de verdad, así que se ejecuta en un
   * solo tamaño de pantalla: los tres proyectos corren en paralelo contra la
   * misma base de datos y se pisarían el mismo texto.
   */
  test('puede editar un texto y el cambio persiste y se publica', async ({ page }, info) => {
    test.skip(info.project.name !== 'escritorio', 'guarda en la base: se corre una sola vez')

    const campo = page.locator('input[name="campo-identidad.cobertura"]')
    const value = `Atención a nivel nacional · ${Date.now()}`

    await campo.fill(value)
    await expect(page.getByText('Tienes cambios sin guardar')).toBeVisible()

    await page.getByRole('button', { name: 'Guardar textos' }).click()
    await expect(page.getByText('Textos actualizados.')).toBeVisible()

    await page.reload()
    await expect(campo).toHaveValue(value)

    await page.goto('/')
    await expect(page.getByText(value).first()).toBeVisible()

    // Se restaura el contenido original.
    await page.goto('/admin')
    await campo.fill('Atención a nivel nacional')
    await page.getByRole('button', { name: 'Guardar textos' }).click()
    await expect(page.getByText('Textos actualizados.')).toBeVisible()
  })

  /*
   * Editar sobre el diseño y editar en los campos son la misma cosa: lo que se
   * escribe en un sitio tiene que aparecer en el otro, porque se guarda una
   * sola vez.
   */
  test('lo que se escribe sobre el diseño llega al campo de arriba', async ({ page }) => {
    await page.getByRole('button', { name: 'Sentido humano', exact: true }).click()

    // La vista previa vive dentro de un desplegable: hay que abrirlo.
    await page.getByText('Vista previa · edita el texto sobre el diseño').click()

    const sobreElDiseno = page.locator('[data-txt="humano.etiqueta"]')
    await expect(sobreElDiseno).toBeVisible()

    const valor = `Cercanía real ${Date.now()}`
    await sobreElDiseno.fill(valor)
    await sobreElDiseno.blur()

    await expect(page.locator('input[name="campo-humano.etiqueta"]')).toHaveValue(valor)
    await expect(page.getByText('Tienes cambios sin guardar')).toBeVisible()
  })

  test('lista los servicios y pide confirmación antes de eliminar', async ({ page }) => {
    await page.getByRole('button', { name: 'Seguros', exact: true }).click()

    const items = page.locator('li button[aria-expanded]')
    expect(await items.count()).toBeGreaterThan(0)

    await items.first().click()
    await page.getByRole('button', { name: 'Eliminar servicio' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('alertdialog')).toBeHidden()
  })

  test('puede cerrar sesión', async ({ page }) => {
    await page.getByRole('button', { name: 'Salir' }).click()
    await expect(page).toHaveURL(/\/admin\/login$/)
  })
})
