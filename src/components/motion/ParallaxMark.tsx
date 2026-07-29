'use client'

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

import { Monogram } from '@/components/brand/Monogram'

type ParallaxMarkProps = {
  className?: string
  /** Recorrido vertical total, en píxeles, durante el primer tramo de scroll. */
  distance?: number
}

/**
 * Monograma de fondo que responde muy sutilmente al desplazamiento.
 * Con movimiento reducido queda completamente estático.
 */
export function ParallaxMark({ className, distance = 70 }: ParallaxMarkProps) {
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const raw = useTransform(scrollY, [0, 900], [0, distance], { clamp: true })
  const y = useSpring(raw, { stiffness: 110, damping: 30, mass: 0.4 })

  if (reduceMotion) {
    return (
      <div className={className}>
        <Monogram fluid />
      </div>
    )
  }

  return (
    <motion.div className={className} style={{ y }}>
      <Monogram fluid />
    </motion.div>
  )
}
