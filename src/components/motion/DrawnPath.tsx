'use client'

import { motion, useReducedMotion } from 'motion/react'

type DrawnPathProps = {
  d: string
  viewBox: string
  className?: string
  preserveAspectRatio?: string
}

/**
 * Traza una curva al entrar en pantalla.
 *
 * Es el gesto de «trayectoria» de la marca aplicado al recorrido del proceso.
 * Con movimiento reducido la curva se muestra completa desde el principio: lo
 * garantiza el CSS (`[data-draw]` en globals.css), no el estado de React.
 */
export function DrawnPath({ d, viewBox, className, preserveAspectRatio }: DrawnPathProps) {
  const reduceMotion = useReducedMotion()

  return (
    <svg
      viewBox={viewBox}
      className={className}
      preserveAspectRatio={preserveAspectRatio}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <motion.path
        d={d}
        data-draw=""
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduceMotion ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}
