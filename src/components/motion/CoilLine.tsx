'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimate, useInView, useReducedMotion } from 'motion/react'

import { COIL_VIEWBOX, coilPath } from '@/lib/coil'

type CoilLineProps = {
  className?: string
}

/** Segundos de espera antes de volver a trazar la línea. */
const PAUSE = 2.4
/** Vueltas de cada pasada: van alternando. */
const LOOPS = [2, 3] as const

const espera = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * La línea de la marca cruzando el fondo de la sección.
 *
 * Se traza sola al llegar a los seguros, baja en diagonal con un vaivén amplio
 * de lado a lado, da dos o tres vueltas —alternando en cada pasada— y se
 * desvanece; al rato vuelve a empezar. Va detrás de todo, no recibe ratón y
 * desaparece por completo si el sistema pide movimiento reducido.
 *
 * El lienzo no se monta ni se desmonta nunca, y la animación se ordena a mano
 * en lugar de reiniciarse cambiando la identidad del elemento. Quitar un nodo
 * del documento hace que el navegador recoloque el desplazamiento —su
 * mecanismo para que el contenido no baile— y eso provocaba un salto de
 * varios cientos de píxeles justo al llegar a la sección siguiente.
 */
export function CoilLine({ className }: CoilLineProps) {
  const reduceMotion = useReducedMotion()
  const contenedor = useRef<HTMLDivElement>(null)
  const inView = useInView(contenedor, { amount: 0.1 })
  const [scope, animate] = useAnimate<SVGSVGElement>()
  const [pass, setPass] = useState(0)

  const loops = LOOPS[pass % LOOPS.length] ?? 2
  const animar = inView && !reduceMotion

  useEffect(() => {
    if (!scope.current) return

    if (!animar) {
      animate('path', { opacity: 0 }, { duration: 0 })
      return
    }

    let cancelado = false

    const pasada = async () => {
      await animate(
        'path',
        { pathLength: [0, 1], opacity: [0, 1, 1, 0] },
        {
          pathLength: { duration: 3.4, ease: [0.33, 0, 0.2, 1] },
          opacity: { duration: 5.2, times: [0, 0.1, 0.7, 1] },
        },
      )
      if (cancelado) return
      await espera(PAUSE * 1000)
      if (cancelado) return
      setPass((valor) => valor + 1)
    }

    void pasada()

    return () => {
      cancelado = true
    }
    // Cada cambio de pasada vuelve a lanzar el trazo, ya con el otro recorrido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animar, pass])

  return (
    <div ref={contenedor} className={className} aria-hidden="true">
      <svg
        ref={scope}
        viewBox={`0 0 ${COIL_VIEWBOX.width} ${COIL_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        focusable="false"
      >
        <motion.path
          d={coilPath(loops)}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
        />
      </svg>
    </div>
  )
}
