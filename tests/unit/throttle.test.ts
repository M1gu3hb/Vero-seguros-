import { beforeEach, describe, expect, it } from 'vitest'

import { anotarFallo, intentoPermitido, olvidar, reiniciarFreno } from '@/lib/throttle'

/*
 * El freno de intentos existe para que probar contraseñas a mano —o en bucle—
 * deje de tener sentido. Lo que se comprueba aquí es que frena de verdad y,
 * sobre todo, que se suelta solo: una traba que se quedara puesta dejaría a
 * Verónica fuera de su propio panel, que es peor que no tener traba.
 */
describe('freno de intentos', () => {
  beforeEach(() => reiniciarFreno())

  it('deja pasar el primer intento', () => {
    expect(intentoPermitido('187.1.1.1').permitido).toBe(true)
  })

  it('aguanta unos cuantos fallos antes de frenar', () => {
    for (let i = 0; i < 9; i += 1) anotarFallo('187.1.1.1')
    expect(intentoPermitido('187.1.1.1').permitido).toBe(true)
  })

  it('frena al décimo fallo y dice cuánto falta', () => {
    for (let i = 0; i < 10; i += 1) anotarFallo('187.1.1.1')

    const resultado = intentoPermitido('187.1.1.1')
    expect(resultado.permitido).toBe(false)
    expect(resultado.segundos).toBeGreaterThan(0)
    expect(resultado.segundos).toBeLessThanOrEqual(60)
  })

  it('la traba se suelta sola pasado el minuto', () => {
    const ahora = 1_000_000
    for (let i = 0; i < 10; i += 1) anotarFallo('187.1.1.1', ahora)

    expect(intentoPermitido('187.1.1.1', ahora).permitido).toBe(false)
    expect(intentoPermitido('187.1.1.1', ahora + 61_000).permitido).toBe(true)
  })

  it('frena a quien falla, no a los demás', () => {
    for (let i = 0; i < 10; i += 1) anotarFallo('187.1.1.1')

    expect(intentoPermitido('187.1.1.1').permitido).toBe(false)
    expect(intentoPermitido('201.2.2.2').permitido).toBe(true)
  })

  it('entrar bien borra el historial', () => {
    for (let i = 0; i < 10; i += 1) anotarFallo('187.1.1.1')
    olvidar('187.1.1.1')
    expect(intentoPermitido('187.1.1.1').permitido).toBe(true)
  })

  it('los fallos sueltos y espaciados no acaban frenando', () => {
    let ahora = 1_000_000
    for (let i = 0; i < 30; i += 1) {
      anotarFallo('187.1.1.1', ahora)
      expect(intentoPermitido('187.1.1.1', ahora).permitido).toBe(true)
      ahora += 11 * 60 * 1000 // fuera de la ventana
    }
  })
})
