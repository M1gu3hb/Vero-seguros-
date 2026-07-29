/**
 * Freno para los intentos de acceso.
 *
 * Cuenta los fallos por origen dentro de una ventana de tiempo y, pasado un
 * número, deja de aceptar intentos durante un rato. No es una cárcel: el
 * bloqueo dura un minuto y se levanta solo, así que ni siquiera un ataque
 * dirigido puede dejar a la administradora fuera de su propio panel. Lo que
 * hace es quitarle sentido a probar contraseñas a mano o en bucle.
 *
 * Vive en memoria a propósito. El servidor es efímero —cada instancia tiene su
 * propio recuento y se reinicia con ella—, así que esto es una traba, no la
 * defensa: por debajo están el límite de peticiones de Supabase, que sí es
 * central, y una contraseña que sólo conoce ella.
 */

const VENTANA_MS = 10 * 60 * 1000
const INTENTOS_MAXIMOS = 10
const ESPERA_MS = 60 * 1000
/** Cuántos orígenes distintos se recuerdan antes de empezar a olvidar. */
const MEMORIA_MAXIMA = 5_000

type Registro = { fallos: number; desde: number; bloqueadoHasta: number }

const registros = new Map<string, Registro>()

function limpiar(ahora: number) {
  for (const [clave, registro] of registros) {
    if (ahora - registro.desde > VENTANA_MS && ahora > registro.bloqueadoHasta) {
      registros.delete(clave)
    }
  }
}

/**
 * ¿Se admite un intento más desde este origen?
 *
 * Devuelve los segundos que faltan cuando la respuesta es que no, para poder
 * decírselo a quien está esperando.
 */
export function intentoPermitido(clave: string, ahora = Date.now()): {
  permitido: boolean
  segundos: number
} {
  const registro = registros.get(clave)
  if (!registro) return { permitido: true, segundos: 0 }

  if (ahora < registro.bloqueadoHasta) {
    return { permitido: false, segundos: Math.ceil((registro.bloqueadoHasta - ahora) / 1000) }
  }

  // Fuera de la ventana, el recuento anterior ya no cuenta.
  if (ahora - registro.desde > VENTANA_MS) {
    registros.delete(clave)
  }

  return { permitido: true, segundos: 0 }
}

/** Anota un intento fallido y bloquea si ya son demasiados. */
export function anotarFallo(clave: string, ahora = Date.now()): void {
  if (registros.size > MEMORIA_MAXIMA) limpiar(ahora)

  const registro = registros.get(clave)

  if (!registro || ahora - registro.desde > VENTANA_MS) {
    registros.set(clave, { fallos: 1, desde: ahora, bloqueadoHasta: 0 })
    return
  }

  registro.fallos += 1
  if (registro.fallos >= INTENTOS_MAXIMOS) {
    registro.bloqueadoHasta = ahora + ESPERA_MS
    registro.fallos = 0
    registro.desde = ahora
  }
}

/** Una entrada correcta borra el historial de ese origen. */
export function olvidar(clave: string): void {
  registros.delete(clave)
}

/** Sólo para las pruebas: deja el contador a cero. */
export function reiniciarFreno(): void {
  registros.clear()
}
