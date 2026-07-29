'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

type TiltProps = {
  children: ReactNode
  className?: string
  /** Inclinación máxima en grados. */
  max?: number
}

const SPRING = { stiffness: 150, damping: 18, mass: 0.4 }

/**
 * Inclinación suave siguiendo el ratón.
 *
 * Un gesto discreto: unos pocos grados, con muelle, para que la fotografía
 * responda al cursor sin convertirse en un juguete. No se activa con dedo ni
 * con lápiz —ahí el gesto no tiene sentido y estorbaría al desplazamiento— ni
 * cuando el sistema pide movimiento reducido.
 */
export function Tilt({ children, className, max = 7 }: TiltProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  // −0.5 … 0.5 respecto al centro del elemento
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), SPRING)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), SPRING)

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const box = ref.current?.getBoundingClientRect()
    if (!box || box.width === 0 || box.height === 0) return
    px.set((event.clientX - box.left) / box.width - 0.5)
    py.set((event.clientY - box.top) / box.height - 0.5)
  }

  function reset() {
    px.set(0)
    py.set(0)
  }

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ perspective: '900px' }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        {children}
      </motion.div>
    </div>
  )
}
