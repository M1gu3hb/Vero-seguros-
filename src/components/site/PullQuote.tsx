'use client'

import { motion, useReducedMotion } from 'motion/react'

import { MaskedWords, wordsDuration } from '@/components/motion/MaskedWords'
import { Txt, useEditing, useTextValue } from '@/components/content/Texts'
import styles from './About.module.css'

const STAGGER = 0.05

/**
 * La frase que resume el trabajo de Verónica.
 *
 * Entra en tres tiempos: primero el filete dorado baja por el costado, luego
 * la comilla aparece y por último la frase se compone palabra por palabra.
 * Es la única pieza de la página con una entrada tan marcada, y por eso
 * funciona: señala que ahí está lo importante.
 */
export function PullQuote() {
  const reduceMotion = useReducedMotion()
  const editing = useEditing()
  const text = useTextValue('sobre.cita')
  const attribution = `${useTextValue('identidad.nombre')} — ${useTextValue('identidad.cargo')}`
  const spoken = `«${text}»`
  const settled = wordsDuration(text, STAGGER) + 0.35

  if (editing) {
    return (
      <blockquote className={styles.quote}>
        <span className={styles.quoteRule} aria-hidden="true" />
        <span className={styles.quoteMark} aria-hidden="true">
          {'“'}
        </span>
        <p className={styles.quoteText}>
          <Txt k="sobre.cita" />
        </p>
        <footer className={styles.quoteAttribution}>{attribution}</footer>
      </blockquote>
    )
  }

  const enter = (delay: number) =>
    reduceMotion ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <blockquote className={styles.quote}>
      <motion.span
        className={styles.quoteRule}
        data-rule=""
        aria-hidden="true"
        initial={reduceMotion ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />

      {/*
        La comilla es un adorno y su opacidad de reposo vive en el CSS, no en
        la animación: la regla de movimiento reducido lleva todo lo marcado
        como aparición a opacidad 1, y aquí eso dejaría una comilla dorada
        maciza en vez de la marca de agua que se busca.
      */}
      <motion.span
        className={styles.quoteMark}
        data-rule=""
        aria-hidden="true"
        initial={reduceMotion ? false : { scale: 0.7 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={enter(0.18)}
      >
        {'“'}
      </motion.span>

      {/* La frase se lee de corrido; las comillas quedan sólo para la vista. */}
      <p className={styles.quoteText}>
        <span className="visually-hidden">{spoken}</span>
        <span aria-hidden="true">
          <MaskedWords
            text={text}
            delay={0.3}
            stagger={STAGGER}
            maskClassName={styles.quoteMask}
            wordClassName={styles.quoteWord}
          />
        </span>
      </p>

      <motion.footer
        className={styles.quoteAttribution}
        data-reveal=""
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={enter(settled)}
      >
        {attribution}
      </motion.footer>
    </blockquote>
  )
}
