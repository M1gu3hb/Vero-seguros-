'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

type TypedProps = {
  text: string
  className?: string
  /** Milisegundos entre palabra y palabra. */
  speed?: number
  /** Espera antes de empezar, en milisegundos. */
  delay?: number
}

/**
 * Texto que se escribe solo al llegar a él.
 *
 * Va palabra por palabra, no letra por letra: en un texto largo el efecto
 * lee igual de «máquina de escribir» y se termina en un tiempo razonable, en
 * lugar de obligar a esperar medio minuto para leer un párrafo.
 *
 * El texto completo está siempre en el HTML —cada palabra es un `span` que
 * sólo cambia de opacidad—, así que los lectores de pantalla y los buscadores
 * ven el párrafo entero desde el principio, se ejecute o no la animación.
 * Si el sistema pide movimiento reducido, no se anima nada.
 */
export function Typed({ text, className, speed = 26, delay = 0 }: TypedProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text])

  /*
   * `null` significa «todavía no decide el cliente»: es el estado con el que
   * se genera el HTML en el servidor y con el que se hidrata, y muestra el
   * texto completo. Sólo al montar en el navegador, y sólo si se va a animar,
   * se pasa a 0 para empezar a escribir.
   */
  const [shown, setShown] = useState<number | null>(null)

  useEffect(() => {
    if (reduceMotion) return
    setShown(0)
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion || !inView || shown === null) return
    if (shown >= words.length) return

    let frame = 0
    let start: number | null = null

    const step = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start - delay
      const target = elapsed < 0 ? 0 : Math.min(words.length, Math.floor(elapsed / speed) + 1)
      setShown(target)
      if (target < words.length) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
    // Sólo debe arrancar una vez, cuando el párrafo entra en pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, shown === null])

  const typing = shown !== null && shown < words.length

  return (
    <p ref={ref} className={className} data-typed={typing ? '' : undefined}>
      {words.map((word, index) => {
        const visible = shown === null || index < shown
        return (
          <Fragment key={`${index}-${word}`}>
            <span
              data-typed-word={visible ? undefined : 'oculta'}
              data-typed-caret={typing && index === shown - 1 ? '' : undefined}
            >
              {word}
            </span>
            {index < words.length - 1 ? ' ' : null}
          </Fragment>
        )
      })}
    </p>
  )
}
