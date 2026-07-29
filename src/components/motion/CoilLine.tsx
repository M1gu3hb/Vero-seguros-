'use client'

import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

import { COIL_VIEWBOX, coilPath } from '@/lib/coil'

type CoilLineProps = {
  className?: string
}

/** Segundos de espera antes de volver a trazar la línea. */
const PAUSE = 2.6
/** Vueltas de cada pasada: van alternando. */
const LOOPS = [2, 3] as const

/**
 * La línea de la marca bajando por el fondo de la sección.
 *
 * Se traza sola al llegar a los seguros, da dos o tres vueltas —alternando en
 * cada pasada— y se desvanece; al rato vuelve a empezar. Es una invitación a
 * seguir bajando, no un elemento de contenido: va detrás de todo, no recibe
 * ratón y desaparece por completo si el sistema pide movimiento reducido.
 */
export function CoilLine({ className }: CoilLineProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  // `once: false`: mientras la sección no esté en pantalla, nada se anima.
  const inView = useInView(ref, { amount: 0.15 })
  const [pass, setPass] = useState(0)

  const loops = LOOPS[pass % LOOPS.length] ?? 2

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {reduceMotion || !inView ? null : (
        <svg
          viewBox={`0 0 ${COIL_VIEWBOX.width} ${COIL_VIEWBOX.height}`}
          /* `meet`, no `slice`: recortando el lienzo la diagonal se salía por
             un costado a media altura y el trazo terminaba de golpe. */
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          focusable="false"
        >
          <motion.path
            key={pass}
            d={coilPath(loops)}
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
            transition={{
              pathLength: { duration: 3.2, ease: [0.33, 0, 0.2, 1] },
              opacity: { duration: 5, times: [0, 0.1, 0.68, 1] },
            }}
            onAnimationComplete={() => {
              window.setTimeout(() => setPass((value) => value + 1), PAUSE * 1000)
            }}
          />
        </svg>
      )}
    </div>
  )
}
