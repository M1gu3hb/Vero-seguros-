'use client'

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'

/**
 * Hilo de avance de lectura bajo el encabezado.
 *
 * Es un indicador, no un adorno: ayuda a situarse en una página larga de una
 * sola columna. Con movimiento reducido se retira por completo desde el CSS,
 * porque su única razón de ser es el desplazamiento.
 */
export function ReadingProgress() {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })

  if (reduceMotion) return null

  return <motion.div className="progress" style={{ scaleX }} aria-hidden="true" />
}
