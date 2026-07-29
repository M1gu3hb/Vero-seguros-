import { expect, test } from '@playwright/test'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://vuzyhbiwnnngeohysxcw.supabase.co'
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_26WQI_ceor1wl2Nk43BR1A_NH1zJYDK'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD

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

  test('el administrador no se indexa', async ({ request }) => {
    const response = await request.get('/admin/login')
    const html = await response.text()
    expect(html).toContain('noindex')
  })
})

test.describe('protección de la base de datos', () => {
  test('un usuario no autorizado no puede escribir', async ({ request }) => {
    const headers = {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }

    // UPDATE: la política no expone ninguna fila, así que no se modifica nada.
    const update = await request.patch(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.1`, {
      headers,
      data: { brand_name: 'Intento no autorizado' },
    })
    expect(await update.json()).toEqual([])

    // INSERT: rechazado explícitamente por la política.
    const insert = await request.post(`${SUPABASE_URL}/rest/v1/services`, {
      headers,
      data: { name: 'Intruso', slug: 'intruso-no-autorizado', description: 'No debería existir.' },
    })
    expect(insert.ok()).toBe(false)

    // DELETE: no borra nada.
    await request.delete(`${SUPABASE_URL}/rest/v1/insurers?name=eq.Zurich`, { headers })

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

  test('puede editar un texto y el cambio persiste y se publica', async ({ page }) => {
    const value = `Atención a nivel nacional · ${Date.now()}`

    await page.locator('input[name="coverageText"]').fill(value)
    await expect(page.getByText('Tienes cambios sin guardar')).toBeVisible()

    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.getByText('Identidad y contacto actualizados.')).toBeVisible()

    await page.reload()
    await expect(page.locator('input[name="coverageText"]')).toHaveValue(value)

    await page.goto('/')
    await expect(page.getByText(value).first()).toBeVisible()

    // Se restaura el contenido original.
    await page.goto('/admin')
    await page.locator('input[name="coverageText"]').fill('Atención a nivel nacional')
    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.getByText('Identidad y contacto actualizados.')).toBeVisible()
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
