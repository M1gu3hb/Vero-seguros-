import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TextField } from '@/components/admin/fields'

/*
 * El ojo para ver la contraseña.
 *
 * Existe por una razón práctica: escribir una contraseña a ciegas se equivoca,
 * y el campo de acceso no dice en qué te equivocaste, sólo que no entras.
 *
 * Lo que no puede pasar: que el botón envíe el formulario, que se pierda lo
 * escrito al destapar, o que el campo se quede en «texto» sin que se note.
 */
describe('campo de contraseña con ojo', () => {
  it('nace tapado', () => {
    render(<TextField name="password" label="Contraseña" type="password" />)
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
  })

  it('destapa y vuelve a tapar', () => {
    render(<TextField name="password" label="Contraseña" type="password" />)
    const campo = screen.getByLabelText('Contraseña')
    const ojo = screen.getByRole('button', { name: 'Ver la contraseña' })

    fireEvent.click(ojo)
    expect(campo).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar la contraseña' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar la contraseña' }))
    expect(campo).toHaveAttribute('type', 'password')
  })

  it('no pierde lo escrito al destapar', () => {
    render(<TextField name="password" label="Contraseña" type="password" />)
    const campo = screen.getByLabelText('Contraseña')

    fireEvent.change(campo, { target: { value: 'mi-contrasena-larga' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ver la contraseña' }))

    expect(campo).toHaveValue('mi-contrasena-larga')
  })

  /*
   * Sin `type="button"`, un botón dentro de un formulario lo envía: pulsar el
   * ojo intentaría entrar con la contraseña a medio escribir.
   */
  it('el ojo no envía el formulario', () => {
    render(<TextField name="password" label="Contraseña" type="password" />)
    expect(screen.getByRole('button', { name: 'Ver la contraseña' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('los campos que no son contraseña no llevan ojo', () => {
    render(<TextField name="email" label="Correo" type="email" />)
    expect(screen.queryByRole('button', { name: /contraseña/i })).not.toBeInTheDocument()
  })
})
