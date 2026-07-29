import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ListField } from '@/components/admin/ListField'

/** Lee los valores que el formulario enviaría para un campo repetido. */
function valoresEnviados(form: HTMLFormElement, name: string) {
  return new FormData(form).getAll(name)
}

function montar(values: string[]) {
  const { container } = render(
    <form>
      <ListField name="plazos" label="Plazos" values={values} />
    </form>,
  )
  return container.querySelector('form') as HTMLFormElement
}

describe('<ListField />', () => {
  it('envía un valor por renglón, en orden', () => {
    const form = montar(['3 meses', '6 meses', '12 meses'])
    expect(valoresEnviados(form, 'plazos')).toEqual(['3 meses', '6 meses', '12 meses'])
  })

  it('quitar un renglón no toca a los demás', () => {
    const form = montar(['3 meses', '6 meses', '12 meses'])
    fireEvent.click(screen.getByRole('button', { name: 'Quitar el elemento 2' }))
    expect(valoresEnviados(form, 'plazos')).toEqual(['3 meses', '12 meses'])
  })

  it('agrega un renglón vacío y lo envía escrito', () => {
    const form = montar(['3 meses'])
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }))
    const nuevo = screen.getByRole('textbox', { name: 'Plazos: elemento 2' })
    fireEvent.change(nuevo, { target: { value: '18 meses' } })
    expect(valoresEnviados(form, 'plazos')).toEqual(['3 meses', '18 meses'])
  })

  it('permite reordenar sin perder lo escrito', () => {
    const form = montar(['3 meses', '6 meses'])
    fireEvent.click(screen.getByRole('button', { name: 'Bajar el elemento 1' }))
    expect(valoresEnviados(form, 'plazos')).toEqual(['6 meses', '3 meses'])
  })

  it('deja siempre un renglón para escribir, aunque se vacíe la lista', () => {
    const form = montar(['3 meses'])
    fireEvent.click(screen.getByRole('button', { name: 'Quitar el elemento 1' }))
    expect(valoresEnviados(form, 'plazos')).toEqual([''])
  })

  it('no deja pasar del tope de elementos', () => {
    montar(Array.from({ length: 12 }, (_, index) => `${index + 1} meses`))
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled()
  })
})
