'use client'

import { motion, useReducedMotion } from 'motion/react'

type StepArrowProps = {
  /** Posición dentro de la secuencia: marca el turno de cada flecha. */
  order: number
  className?: string
}

/**
 * Flecha que se dibuja sola entre un paso y el siguiente.
 *
 * El trazo es un solo camino con dos tramos —el asta y la punta—, así que al
 * animar su longitud la flecha se escribe en el orden natural: primero la
 * línea, después la punta. Las flechas aparecen una tras otra, no todas a la
 * vez. Con movimiento reducido se muestran enteras desde el principio, por la
 * regla de `[data-draw]` en `globals.css`.
 */
export function StepArrow({ order, className }: StepArrowProps) {
  const reduceMotion = useReducedMotion()

  return (
    <svg className={className} viewBox="0 0 26 16" fill="none" aria-hidden="true" focusable="false">
      <motion.path
        d="M1.5 8 H23 M17.2 2.7 L23 8 L17.2 13.3"
        data-draw=""
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduceMotion ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.7, delay: 0.35 + order * 0.55, ease: [0.22, 1, 0.36, 1] }
        }
      />
    </svg>
  )
}
