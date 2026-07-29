import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { About } from '@/components/site/About'
import { Footer } from '@/components/site/Footer'
import { Payments } from '@/components/site/Payments'
import { Services } from '@/components/site/Services'
import { ServiceIcon } from '@/components/site/ServiceIcon'
import { defaultServices, defaultSettings } from '@/content/site-content'

describe('<Services />', () => {
  it('muestra todos los ramos visibles', () => {
    render(<Services services={defaultServices} />)
    for (const service of defaultServices) {
      expect(screen.getByRole('heading', { name: service.name })).toBeInTheDocument()
    }
  })

  it('destaca los dos primeros y numera el resto de forma correlativa', () => {
    render(<Services services={defaultServices} />)
    const section = screen.getByRole('region', { name: /qué quieres proteger/i })
    // «01» aparece dos veces: el numeral de la sección y el del primer ramo
    expect(within(section).getAllByText('01').length).toBeGreaterThanOrEqual(1)
    expect(within(section).getByText('08')).toBeInTheDocument()
    expect(within(section).getByText('05')).toBeInTheDocument()
  })

  it('no renderiza nada si no hay servicios', () => {
    const { container } = render(<Services services={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('cada ramo se puede abrir para leer qué cubre', async () => {
    render(<Services services={defaultServices} />)

    const boton = screen.getByRole('button', { name: 'Seguro de Auto' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveAttribute('aria-controls')

    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')

    const auto = defaultServices.find((service) => service.slug === 'auto')
    const panel = await screen.findByText(auto!.detail!)
    expect(panel).toBeInTheDocument()
    expect(panel.closest(`#${CSS.escape(boton.getAttribute('aria-controls')!)}`)).not.toBeNull()

    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })

  it('un ramo sin texto de cobertura no se convierte en botón', () => {
    const [first] = defaultServices
    if (!first) throw new Error('falta el contenido inicial')
    render(<Services services={[{ ...first, detail: null }]} />)
    expect(screen.queryByRole('button', { name: first.name })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: first.name })).toBeInTheDocument()
  })

  it('funciona con un único servicio', () => {
    const [first] = defaultServices
    render(<Services services={first ? [first] : []} />)
    expect(screen.getByRole('heading', { name: first?.name })).toBeInTheDocument()
  })
})

describe('<ServiceIcon />', () => {
  it('cae en el icono genérico si el identificador no existe', () => {
    const { container } = render(<ServiceIcon name="no-existe" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.querySelectorAll('path, circle, rect').length).toBeGreaterThan(0)
  })
})

/**
 * La biografía se escribe palabra por palabra, así que cada párrafo queda
 * repartido en varios `span`. Lo que interesa comprobar sigue siendo lo mismo:
 * que el texto completo esté en el documento y separado en los párrafos
 * correctos.
 */
function parrafosDe(section: HTMLElement) {
  return Array.from(section.querySelectorAll('p')).map((p) =>
    (p.textContent ?? '').replace(/\s+/g, ' ').trim(),
  )
}

describe('<About />', () => {
  it('separa la biografía en párrafos con saltos simples', () => {
    render(
      <About
        settings={{ ...defaultSettings, aboutBody: 'Uno del texto.\n\nDos del texto.\n\nTres.' }}
      />,
    )
    const parrafos = parrafosDe(screen.getByRole('region', { name: /Sobre Verónica/ }))
    expect(parrafos).toContain('Uno del texto.')
    expect(parrafos).toContain('Dos del texto.')
    expect(parrafos).toContain('Tres.')
  })

  it('también los separa si el texto llega con saltos CRLF del navegador', () => {
    render(
      <About
        settings={{ ...defaultSettings, aboutBody: 'Uno del texto.\r\n\r\nDos del texto.' }}
      />,
    )
    const parrafos = parrafosDe(screen.getByRole('region', { name: /Sobre Verónica/ }))
    expect(parrafos).toContain('Uno del texto.')
    expect(parrafos).toContain('Dos del texto.')
  })

  it('la cita se anuncia completa aunque se componga palabra por palabra', () => {
    render(<About settings={defaultSettings} />)
    const section = screen.getByRole('region', { name: /Sobre Verónica/ })
    const cita = section.querySelector('blockquote')
    expect(cita?.textContent).toContain(defaultSettings.aboutQuote)
  })
})

describe('<Payments />', () => {
  it('muestra la nota de condiciones', () => {
    render(<Payments settings={defaultSettings} />)
    expect(screen.getByText(defaultSettings.promosNote)).toBeInTheDocument()
  })

  it('se oculta por completo si la sección está desactivada', () => {
    const { container } = render(
      <Payments settings={{ ...defaultSettings, promosVisible: false }} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('lista los plazos y las modalidades que estén cargados', () => {
    render(<Payments settings={defaultSettings} />)
    for (const term of [
      ...defaultSettings.promosInstallments,
      ...defaultSettings.promosFrequencies,
    ]) {
      expect(screen.getByText(term)).toBeInTheDocument()
    }
    expect(screen.getByRole('heading', { name: /Meses sin intereses/i })).toBeInTheDocument()
  })

  it('se acomoda con cualquier número de plazos', () => {
    render(
      <Payments
        settings={{ ...defaultSettings, promosInstallments: ['6 meses'], promosFrequencies: [] }}
      />,
    )
    expect(screen.getByText('6 meses')).toBeInTheDocument()
    // El bloque sin elementos no deja un rótulo huérfano
    expect(
      screen.queryByRole('heading', { name: defaultSettings.promosFrequenciesLabel }),
    ).not.toBeInTheDocument()
  })

  it('no muestra el bloque de plazos si las dos listas están vacías', () => {
    render(
      <Payments
        settings={{ ...defaultSettings, promosInstallments: [], promosFrequencies: [] }}
      />,
    )
    expect(
      screen.queryByRole('heading', { name: defaultSettings.promosInstallmentsLabel }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(defaultSettings.promosNote)).toBeInTheDocument()
  })
})

describe('<Footer />', () => {
  it('muestra la identidad, el correo y el año dinámico', () => {
    render(<Footer settings={defaultSettings} year={2031} />)
    expect(screen.getByText(defaultSettings.brandName)).toBeInTheDocument()
    expect(screen.getByText(defaultSettings.brandRole)).toBeInTheDocument()
    expect(screen.getByText(defaultSettings.brandTagline)).toBeInTheDocument()
    expect(screen.getByText(/2031/)).toBeInTheDocument()

    const email = screen.getByRole('link', { name: defaultSettings.contactEmail })
    expect(email).toHaveAttribute('href', `mailto:${defaultSettings.contactEmail}`)
  })

  it('no muestra el número de WhatsApp ni un enlace al administrador', () => {
    const { container } = render(<Footer settings={defaultSettings} year={2031} />)
    expect(container.textContent).not.toContain('5540085632')
    expect(container.querySelector('a[href*="/admin"]')).toBeNull()
  })
})
