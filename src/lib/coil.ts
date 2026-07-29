/**
 * Trazo que recorre la sección de los seguros y se enrolla por el camino.
 *
 * Es el mismo gesto de la trayectoria de la marca, pero atravesando la
 * sección entera: baja en diagonal describiendo un vaivén amplio de lado a
 * lado, da un par de vueltas y sale por abajo. Va al fondo, detrás de los
 * ramos, y su única función es sugerir que la página sigue.
 */

export const COIL_VIEWBOX = { width: 1000, height: 1240 }

type Point = { x: number; y: number }

/* Entra y sale fuera del lienzo para que la línea no parezca empezar y
   terminar en el aire. */
const START: Point = { x: 210, y: -80 }
const END: Point = { x: 800, y: 1320 }

/** Amplitud del vaivén lateral. Es lo que le da recorrido. */
const SWING = 355

/**
 * Punto de la trayectoria.
 *
 * Una diagonal de arriba abajo, más una onda lateral: en vez de una recta
 * tendida hacia un costado, la línea cruza de lado a lado mientras baja, que
 * es lo que hace que se lea de fondo en toda la sección.
 */
function baseline(t: number): Point {
  const sweep = Math.sin(t * Math.PI * 1.45 - 0.42) * SWING
  // El vaivén se apaga en los extremos, para entrar y salir limpio.
  const fade = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) ** 0.55

  return {
    x: START.x + (END.x - START.x) * t + sweep * fade,
    y: START.y + (END.y - START.y) * t,
  }
}

/** Tangente unitaria de la trayectoria en `t`. */
function tangent(t: number): Point {
  const step = 0.0008
  const a = baseline(t - step)
  const b = baseline(t + step)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 1
  return { x: dx / length, y: dy / length }
}

const round = (value: number) => Math.round(value * 10) / 10

/** Dónde cae cada vuelta a lo largo del recorrido. */
const PLACES: Record<number, number[]> = {
  2: [0.27, 0.71],
  3: [0.2, 0.52, 0.82],
}

/**
 * Devuelve el trazo con `loops` vueltas repartidas a lo largo del recorrido.
 *
 * Cada vuelta es una sola curva cúbica cuyos puntos de control se cruzan: eso
 * es lo que hace que la línea se monte sobre sí misma y se lea como un rizo.
 */
export function coilPath(loops: number): string {
  const radius = loops >= 3 ? 96 : 112
  const mouth = 30
  const places = PLACES[loops] ?? PLACES[2]!

  const parts: string[] = []
  let cursor = baseline(0)
  let cursorDir = tangent(0)
  parts.push(`M${round(cursor.x)} ${round(cursor.y)}`)

  /** Tramo suave entre dos puntos, respetando la tangente en ambos extremos. */
  const glide = (to: Point, toDir: Point) => {
    const reach = Math.hypot(to.x - cursor.x, to.y - cursor.y) / 3
    parts.push(
      `C${round(cursor.x + cursorDir.x * reach)} ${round(cursor.y + cursorDir.y * reach)}` +
        ` ${round(to.x - toDir.x * reach)} ${round(to.y - toDir.y * reach)}` +
        ` ${round(to.x)} ${round(to.y)}`,
    )
    cursor = to
    cursorDir = toDir
  }

  places.forEach((t) => {
    const centre = baseline(t)
    const dir = tangent(t)
    // Normal a un lado de la marcha: todos los rizos giran igual.
    const normal = { x: dir.y, y: -dir.x }

    const entry = { x: centre.x - dir.x * (mouth / 2), y: centre.y - dir.y * (mouth / 2) }
    const exit = { x: centre.x + dir.x * (mouth / 2), y: centre.y + dir.y * (mouth / 2) }

    glide(entry, dir)

    // El rizo: los controles se cruzan, así que la curva se monta sobre sí misma.
    parts.push(
      `C${round(entry.x + normal.x * radius + dir.x * radius * 0.9)}` +
        ` ${round(entry.y + normal.y * radius + dir.y * radius * 0.9)}` +
        ` ${round(exit.x + normal.x * radius - dir.x * radius * 0.9)}` +
        ` ${round(exit.y + normal.y * radius - dir.y * radius * 0.9)}` +
        ` ${round(exit.x)} ${round(exit.y)}`,
    )
    cursor = exit
    cursorDir = dir
  })

  glide(baseline(1), tangent(1))

  return parts.join(' ')
}
