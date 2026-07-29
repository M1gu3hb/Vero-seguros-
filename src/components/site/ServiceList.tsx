'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'

import { Reveal } from '@/components/motion/Reveal'
import { ServiceIcon } from '@/components/site/ServiceIcon'
import type { Service } from '@/content/site-content'
import styles from './Services.module.css'

const formatIndex = (index: number) => String(index + 1).padStart(2, '0')

/* ── El signo que indica el estado ──────────────────────────────────────────
 *
 * Dos barras dentro de una caja cuadrada. Girando y encogiendo esas dos barras
 * se pasa del más a la punta de flecha y de ahí al menos, sin cortes: la misma
 * forma se transforma en la siguiente.
 *
 *   más     ✚   en reposo
 *   flecha  ⌄   al pasar el cursor, invitando a pulsar
 *   menos   —   cuando el ramo está abierto
 */
type Estado = 'mas' | 'flecha' | 'menos'

const BARRA_A: Variants = {
  mas: { rotate: 0, x: '0%', scaleX: 1 },
  flecha: { rotate: 45, x: '-25%', scaleX: 0.707 },
  menos: { rotate: 0, x: '0%', scaleX: 1 },
}

const BARRA_B: Variants = {
  mas: { rotate: 90, x: '0%', scaleX: 1 },
  flecha: { rotate: -45, x: '25%', scaleX: 0.707 },
  menos: { rotate: 0, x: '0%', scaleX: 1 },
}

const MORFO = { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const }

function Marca({ estado }: { estado: Estado }) {
  const reduceMotion = useReducedMotion()
  const rebota = estado === 'flecha' && !reduceMotion

  return (
    <motion.span
      className={styles.marca}
      aria-hidden="true"
      animate={rebota ? { y: [0, 2.5, 0] } : { y: 0 }}
      transition={
        rebota
          ? { duration: 1.15, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.2, ease: 'easeOut' }
      }
    >
      <motion.span
        className={styles.marcaBarra}
        variants={BARRA_A}
        animate={estado}
        transition={reduceMotion ? { duration: 0 } : MORFO}
      />
      <motion.span
        className={styles.marcaBarra}
        variants={BARRA_B}
        animate={estado}
        transition={reduceMotion ? { duration: 0 } : MORFO}
      />
    </motion.span>
  )
}

/* ── El texto que se despliega ──────────────────────────────────────────── */

function Detalle({ id, text, open }: { id: string; text: string; open: boolean }) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          id={id}
          className={styles.detail}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  height: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.3, ease: 'linear' },
                }
          }
          style={{ overflow: 'hidden' }}
        >
          <p className={styles.detailText}>{text}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/* ── Un ramo ────────────────────────────────────────────────────────────── */

type ItemProps = {
  service: Service
  index: string
  open: boolean
  onToggle: () => void
}

function useEstado(open: boolean) {
  const [activo, setActivo] = useState(false)
  const estado: Estado = open ? 'menos' : activo ? 'flecha' : 'mas'
  const manejadores = {
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setActivo(true)
    },
    onPointerLeave: () => setActivo(false),
    onFocus: () => setActivo(true),
    onBlur: () => setActivo(false),
  }
  return { estado, manejadores }
}

/** Uno de los dos ramos destacados. */
function Destacado({ service, index, open, onToggle }: ItemProps) {
  const panelId = useId()
  const { estado, manejadores } = useEstado(open)
  const desplegable = Boolean(service.detail)

  return (
    <li className={styles.feature} data-open={open ? '' : undefined}>
      {/* La zona sensible cubre la cabecera, no el texto desplegado: así se
          puede leer lo que se abrió sin cerrarlo al pulsar dentro. */}
      <div className={styles.featureHead} {...(desplegable ? manejadores : {})}>
        <svg
          className={styles.featureArc}
          viewBox="0 0 400 56"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M0 54 C 90 6, 310 6, 400 54"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <span className={styles.ghostIndex} aria-hidden="true">
          {index}
        </span>

        <div className={styles.featureTop}>
          <span className={styles.medallion}>
            <ServiceIcon name={service.icon} className={styles.icon} />
          </span>
          <span className={styles.index} aria-hidden="true">
            {index}
          </span>
        </div>

        <h3 className={styles.featureName}>
          {desplegable ? (
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={onToggle}
            >
              {service.name}
              {/* Extiende la zona sensible a todo el bloque. Es un elemento
                  real y no un pseudoelemento: así el clic llega al botón
                  desde cualquier punto, no sólo desde el texto. */}
              <span className={styles.cover} aria-hidden="true" />
            </button>
          ) : (
            service.name
          )}
        </h3>

        <p className={styles.featureText}>{service.description}</p>

        {desplegable ? (
          <span className={styles.hint} aria-hidden="true">
            {open ? 'Cerrar' : 'Qué cubre'}
            <Marca estado={estado} />
          </span>
        ) : null}
      </div>

      {desplegable ? <Detalle id={panelId} text={service.detail ?? ''} open={open} /> : null}
    </li>
  )
}

/** Uno de los ramos del índice. */
function Renglon({ service, index, open, onToggle }: ItemProps) {
  const panelId = useId()
  const { estado, manejadores } = useEstado(open)
  const desplegable = Boolean(service.detail)

  return (
    <>
      <div
        className={styles.rowInner}
        data-open={open ? '' : undefined}
        {...(desplegable ? manejadores : {})}
      >
        <span className={`${styles.index} ${styles.rowIndex}`} aria-hidden="true">
          {index}
        </span>
        <ServiceIcon name={service.icon} className={styles.rowIcon} />
        <h3 className={styles.rowName}>
          {desplegable ? (
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={onToggle}
            >
              {service.name}
              {/* Extiende la zona sensible a todo el bloque. Es un elemento
                  real y no un pseudoelemento: así el clic llega al botón
                  desde cualquier punto, no sólo desde el texto. */}
              <span className={styles.cover} aria-hidden="true" />
            </button>
          ) : (
            service.name
          )}
        </h3>
        <p className={styles.rowText}>{service.description}</p>
        {desplegable ? <Marca estado={estado} /> : null}
      </div>

      {desplegable ? <Detalle id={panelId} text={service.detail ?? ''} open={open} /> : null}
    </>
  )
}

/* ── La lista completa ──────────────────────────────────────────────────── */

/**
 * Los ramos, con sus textos desplegables.
 *
 * Sólo hay uno abierto a la vez: abrir otro cierra el anterior. El estado vive
 * aquí, en la lista, porque es una decisión del conjunto y no de cada ramo.
 */
export function ServiceList({ services }: { services: Service[] }) {
  const [abierto, setAbierto] = useState<string | null>(null)
  const alternar = (id: string) => setAbierto((actual) => (actual === id ? null : id))

  const destacados = services.slice(0, 2)
  const resto = services.slice(2)

  return (
    <>
      <Reveal delay={0.05}>
        <ul className={styles.features}>
          {destacados.map((service, index) => (
            <Destacado
              key={service.id}
              service={service}
              index={formatIndex(index)}
              open={abierto === service.id}
              onToggle={() => alternar(service.id)}
            />
          ))}
        </ul>
      </Reveal>

      {resto.length > 0 ? (
        <ul className={styles.list}>
          {resto.map((service, index) => (
            <Reveal
              as="li"
              key={service.id}
              className={styles.row}
              delay={Math.min(index * 0.04, 0.24)}
              y={10}
            >
              <Renglon
                service={service}
                index={formatIndex(index + destacados.length)}
                open={abierto === service.id}
                onToggle={() => alternar(service.id)}
              />
            </Reveal>
          ))}
        </ul>
      ) : null}
    </>
  )
}
