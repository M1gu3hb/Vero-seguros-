'use client'

import { motion, useReducedMotion } from 'motion/react'

import { MaskedWords, wordsDuration } from '@/components/motion/MaskedWords'

type UnderlinedTitleProps = {
  id?: string
  text: string
  className?: string
  /** Clase del filete dorado que se traza debajo. */
  ruleClassName?: string
  /** Clase de la ventana que recorta cada palabra al entrar. */
  maskClassName?: string
  wordClassName?: string
}

const STAGGER = 0.055

/**
 * Título que se compone palabra por palabra y se subraya al terminar.
 *
 * Las palabras suben desde detrás de una ventana que las recorta y, cuando la
 * frase está completa, un filete dorado se traza de izquierda a derecha por
 * debajo. Con movimiento reducido todo aparece en su sitio desde el principio,
 * por las reglas de `globals.css`.
 */
export function UnderlinedTitle({
  id,
  text,
  className,
  ruleClassName,
  maskClassName,
  wordClassName,
}: UnderlinedTitleProps) {
  const reduceMotion = useReducedMotion()

  return (
    <h2 id={id} className={className}>
      <MaskedWords
        text={text}
        stagger={STAGGER}
        maskClassName={maskClassName}
        wordClassName={wordClassName}
      />

      <motion.span
        className={ruleClassName}
        data-rule=""
        aria-hidden="true"
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 0.9,
                delay: wordsDuration(text, STAGGER) + 0.12,
                ease: [0.22, 1, 0.36, 1],
              }
        }
      />
    </h2>
  )
}
