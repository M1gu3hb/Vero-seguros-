'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

type Bloque = {
  text: string
  className?: string
}

type TypedProps = {
  /** Los párrafos, en orden. Se escriben de corrido, uno tras otro. */
  blocks: Bloque[]
  /** Milisegundos entre palabra y palabra. */
  speed?: number
  /** Espera antes de la primera palabra, en milisegundos. */
  delay?: number
  /** Envuelve los bloques a partir del índice indicado. */
  bodyFrom?: number
  bodyClassName?: string
}

/**
 * Texto que se escribe solo al llegar a él.
 *
 * Todos los párrafos forman una sola tirada: empieza por la primera palabra y
 * no se detiene hasta la última, de principio a fin, sin arrancar de nuevo en
 * cada párrafo. Va palabra por palabra, no letra por letra: en un texto largo
 * el efecto lee igual de «máquina de escribir» y no obliga a esperar una
 * eternidad para terminar de leer.
 *
 * El texto completo está siempre en el HTML —cada palabra es un `span` que
 * sólo cambia de opacidad—, así que los lectores de pantalla y los buscadores
 * ven todo desde el principio, se ejecute o no la animación. Si el sistema
 * pide movimiento reducido, no se anima nada.
 */
export function Typed({
  blocks,
  speed = 45,
  delay = 250,
  bodyFrom,
  bodyClassName,
}: TypedProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.12 })

  /* Cada bloque con sus palabras y con la posición desde la que empieza a
     contar dentro de la tirada completa. */
  const partes = useMemo(() => {
    let acumulado = 0
    return blocks.map((bloque) => {
      const words = bloque.text.split(/\s+/).filter(Boolean)
      const offset = acumulado
      acumulado += words.length
      return { ...bloque, words, offset }
    })
  }, [blocks])

  const total = partes.reduce((suma, parte) => suma + parte.words.length, 0)

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

    let frame = 0
    let inicio: number | null = null

    const paso = (ahora: number) => {
      if (inicio === null) inicio = ahora
      const transcurrido = ahora - inicio - delay
      const objetivo = transcurrido < 0 ? 0 : Math.min(total, Math.floor(transcurrido / speed) + 1)
      setShown(objetivo)
      if (objetivo < total) frame = requestAnimationFrame(paso)
    }

    frame = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(frame)
    // Arranca una sola vez, cuando el texto entra en pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, shown === null])

  const escribiendo = shown !== null && shown < total

  const parrafo = (parte: (typeof partes)[number], key: number) => (
    <p key={key} className={parte.className}>
      {parte.words.map((word, index) => {
        const posicion = parte.offset + index
        const visible = shown === null || posicion < shown
        return (
          <Fragment key={`${index}-${word}`}>
            <span
              data-typed-word={visible ? undefined : 'oculta'}
              data-typed-caret={escribiendo && posicion === shown - 1 ? '' : undefined}
            >
              {word}
            </span>
            {index < parte.words.length - 1 ? ' ' : null}
          </Fragment>
        )
      })}
    </p>
  )

  const corte = bodyFrom ?? partes.length

  return (
    <div ref={ref} data-typed={escribiendo ? '' : undefined}>
      {partes.slice(0, corte).map((parte, index) => parrafo(parte, index))}
      {corte < partes.length ? (
        <div className={bodyClassName}>
          {partes.slice(corte).map((parte, index) => parrafo(parte, corte + index))}
        </div>
      ) : null}
    </div>
  )
}
