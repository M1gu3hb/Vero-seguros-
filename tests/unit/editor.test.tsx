import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

/*
 * Las Server Actions sólo existen dentro de Next: importarlas aquí arrastraría
 * la capa de servidor entera. Se sustituye por una que no hace nada, porque lo
 * que se prueba es el formulario, no el guardado.
 */
vi.mock('@/actions/content', () => ({
  saveTexts: async () => ({ status: 'idle' as const, message: '', at: 0 }),
}))

import { SectionPanel } from '@/components/admin/SectionPanel'
import { Txt, TextsProvider } from '@/components/content/Texts'
import { HumanSense } from '@/components/site/HumanSense'
import { buildTexts, defaultTexts, textsOfGroup } from '@/content/texts'
import { defaultSettings } from '@/content/site-content'

/** El panel completo de una sección, con sus campos y su vista previa. */
function montarPanel() {
  const vista = render(
    <SectionPanel
      group="humano"
      title="Sentido humano"
      hint="Los cinco puntos."
      texts={buildTexts(defaultSettings)}
      preview={() => <HumanSense />}
    />,
  )

  const raiz = vista.container
  const campos = raiz.querySelector('[class*="fields"]') as HTMLElement
  const diseno = raiz.querySelector('[class*="previewCanvas"]') as HTMLElement
  return { ...vista, campos, diseno }
}

describe('<Txt />', () => {
  it('en la página pública imprime el texto sin envolverlo', () => {
    const { container } = render(
      <TextsProvider texts={{ 'humano.etiqueta': 'Sentido humano' }}>
        <p>
          <Txt k="humano.etiqueta" />
        </p>
      </TextsProvider>,
    )
    const parrafo = container.querySelector('p')
    expect(parrafo?.textContent).toBe('Sentido humano')
    expect(parrafo?.querySelector('span')).toBeNull()
  })

  it('mientras se edita se convierte en un campo con el nombre de la frase', () => {
    render(
      <TextsProvider texts={defaultTexts} editing onChange={() => {}}>
        <p>
          <Txt k="humano.etiqueta" />
        </p>
      </TextsProvider>,
    )
    const campo = screen.getByRole('textbox', { name: 'Rótulo de la sección' })
    expect(campo).toHaveAttribute('contenteditable', 'true')
    expect(campo).toHaveTextContent(defaultTexts['humano.etiqueta']!)
  })

  it('avisa del cambio al salir del campo, y sólo si cambió', () => {
    const cambios: [string, string][] = []
    render(
      <TextsProvider
        texts={defaultTexts}
        editing
        onChange={(key, value) => cambios.push([key, value])}
      >
        <Txt k="humano.etiqueta" />
      </TextsProvider>,
    )
    const campo = screen.getByRole('textbox')

    fireEvent.blur(campo)
    expect(cambios).toEqual([])

    campo.textContent = 'Cercanía real'
    fireEvent.blur(campo)
    expect(cambios).toEqual([['humano.etiqueta', 'Cercanía real']])
  })
})

describe('<SectionPanel />', () => {
  it('genera un campo por cada frase de la sección', () => {
    const { campos } = montarPanel()
    for (const entrada of textsOfGroup('humano')) {
      expect(within(campos).getByRole('textbox', { name: entrada.label })).toBeTruthy()
    }
  })

  it('lo que se escribe en un campo se refleja en la vista previa', () => {
    const { campos, diseno } = montarPanel()

    const campo = within(campos).getByRole('textbox', { name: 'Rótulo de la sección' })
    fireEvent.change(campo, { target: { value: 'Cercanía' } })

    expect(diseno.textContent).toContain('Cercanía')
  })

  it('y lo que se escribe sobre el diseño vuelve al campo y al envío', () => {
    const { container, campos, diseno } = montarPanel()

    const enDiseno = within(diseno).getByRole('textbox', { name: 'Punto 1 · título' })
    enDiseno.textContent = 'Escucha de verdad'
    fireEvent.blur(enDiseno)

    const campo = within(campos).getByRole('textbox', {
      name: 'Punto 1 · título',
    }) as HTMLInputElement
    expect(campo.value).toBe('Escucha de verdad')

    const oculto = container.querySelector('input[name="values"]') as HTMLInputElement
    expect(JSON.parse(oculto.value)['humano.pilar1.titulo']).toBe('Escucha de verdad')
  })

  it('envía todas las frases de la sección, no sólo las tocadas', () => {
    const { container } = montarPanel()
    const oculto = container.querySelector('input[name="values"]') as HTMLInputElement
    const enviado = JSON.parse(oculto.value)
    for (const entrada of textsOfGroup('humano')) {
      expect(Object.keys(enviado)).toContain(entrada.key)
    }
  })
})
