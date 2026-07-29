'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/** Etiquetas permitidas. El mapa vive fuera del componente para no recrear
 *  componentes de `motion` en cada render. */
const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  p: motion.p,
  figure: motion.figure,
  header: motion.header,
} as const

type RevealProps = {
  children: ReactNode
  /** Retraso en segundos, para escalonar elementos hermanos. */
  delay?: number
  /** Desplazamiento inicial en píxeles. */
  y?: number
  as?: keyof typeof MOTION_TAGS
  className?: string
}

/**
 * Aparición progresiva al entrar en pantalla.
 *
 * El árbol de elementos es siempre el mismo en servidor y en cliente: cambiarlo
 * según el ajuste de movimiento provoca una discordancia de hidratación que
 * puede dejar pegado el `opacity: 0` del HTML servido, con el contenido
 * invisible. Por eso quien garantiza el resultado con movimiento reducido es el
 * CSS (`[data-reveal]` en globals.css), que gana a los estilos en línea y no
 * depende de JavaScript.
 */
export function Reveal({ children, delay = 0, y = 18, as = 'div', className }: RevealProps) {
  const reduceMotion = useReducedMotion()
  const MotionTag = MOTION_TAGS[as]

  return (
    <MotionTag
      className={className}
      data-reveal=""
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -60px 0px' }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </MotionTag>
  )
}
