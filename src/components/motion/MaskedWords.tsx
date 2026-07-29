'use client'

import { Fragment } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

type MaskedWordsProps = {
  text: string
  /** Espera antes de la primera palabra, en segundos. */
  delay?: number
  /** Retardo entre palabra y palabra, en segundos. */
  stagger?: number
  maskClassName?: string
  wordClassName?: string
}

const WORD: Variants = {
  oculta: { y: '105%' },
  visible: {
    y: '0%',
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
}

/**
 * Palabras que suben desde detrás de una ventana que las recorta.
 *
 * Quien decide cuándo empieza el gesto es el envoltorio, no cada palabra: en
 * su posición de partida la palabra está desplazada por completo fuera de su
 * ventana, y un observador de intersección tiene en cuenta el recorte de los
 * ancestros, así que la palabra nunca «entraría en pantalla» por sí misma y
 * se quedaría escondida para siempre. El envoltorio no está recortado, ve la
 * pantalla sin problema y reparte los turnos entre sus hijas.
 */
export function MaskedWords({
  text,
  delay = 0,
  stagger = 0.055,
  maskClassName,
  wordClassName,
}: MaskedWordsProps) {
  const reduceMotion = useReducedMotion()
  const words = text.split(/\s+/).filter(Boolean)

  /*
   * El espacio va fuera de la ventana, no dentro: un `inline-block` con
   * `overflow: hidden` descarta el espacio final y las palabras acabarían
   * pegadas unas a otras.
   */
  const pieces = words.map((word, index) => (
    <Fragment key={`${index}-${word}`}>
      <span className={maskClassName}>
        <motion.span
          className={wordClassName}
          data-reveal=""
          variants={reduceMotion ? undefined : WORD}
        >
          {word}
        </motion.span>
      </span>
      {index < words.length - 1 ? ' ' : null}
    </Fragment>
  ))

  if (reduceMotion) return <>{pieces}</>

  return (
    <motion.span
      initial="oculta"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      {pieces}
    </motion.span>
  )
}

/** Cuánto tarda en componerse una frase completa, en segundos. */
export function wordsDuration(text: string, stagger = 0.055): number {
  return text.split(/\s+/).filter(Boolean).length * stagger
}
