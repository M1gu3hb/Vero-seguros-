/**
 * Trazo diagonal que se enrolla.
 *
 * Es el mismo gesto de la trayectoria de la marca, pero recorriendo la sección
 * de arriba abajo: una línea que baja en diagonal, da un par de vueltas por el
 * camino y sale por abajo. Va de fondo, detrás de los seguros, y su única
 * función es sugerir que la página sigue.
 */

export const COIL_VIEWBOX = { width: 720, height: 1000 }

type Point = { x: number; y: number }

/* Diagonal de arriba abajo. Se sale del lienzo por los dos extremos para que
   la línea no parezca empezar y terminar en el aire. */
const START: Point = { x: 40, y: -60 }
const END: Point = { x: 690, y: 1060 }

/** Punto de la diagonal, con una ligera curvatura hacia dentro. */
function baseline(t: number): Point {
  const bend = Math.sin(t * Math.PI) * 58
  return {
    x: START.x + (END.x - START.x) * t - bend,
    y: START.y + (END.y - START.y) * t,
  }
}

/** Tangente unitaria de la diagonal en `t`. */
function tangent(t: number): Point {
  const step = 0.001
  const a = baseline(Math.max(0, t - step))
  const b = baseline(Math.min(1, t + step))
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 1
  return { x: dx / length, y: dy / length }
}

const round = (value: number) => Math.round(value * 10) / 10

/**
 * Devuelve el trazo con `loops` vueltas repartidas a lo largo de la diagonal.
 *
 * Cada vuelta es una sola curva cúbica cuyos puntos de control se cruzan: eso
 * es lo que hace que la línea se monte sobre sí misma y se lea como un rizo.
 */
export function coilPath(loops: number): string {
  /* Radio del rizo y separación entre la entrada y la salida de cada vuelta.
     Con menos vueltas se pueden permitir rizos algo mayores. */
  const radius = loops >= 3 ? 84 : 100
  const mouth = 26

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

  for (let index = 0; index < loops; index += 1) {
    const t = (index + 0.5) / loops
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
  }

  glide(baseline(1), tangent(1))

  return parts.join(' ')
}
