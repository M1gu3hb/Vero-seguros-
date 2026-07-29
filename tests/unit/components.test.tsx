import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
    expect(within(section).getByText('01')).toBeInTheDocument()
    expect(within(section).getByText('08')).toBeInTheDocument()
  })

  it('no renderiza nada si no hay servicios', () => {
    const { container } = render(<Services services={[]} />)
    expect(container).toBeEmptyDOMElement()
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
