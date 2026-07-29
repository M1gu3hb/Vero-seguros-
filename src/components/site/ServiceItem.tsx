'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { ServiceIcon } from '@/components/site/ServiceIcon'
import type { Service } from '@/content/site-content'
import styles from './Services.module.css'

type ItemProps = {
  service: Service
  index: string
}

/**
 * Panel que se abre bajo un ramo con lo que cubre ese tipo de seguro.
 *
 * Va después del encabezado, nunca dentro del botón, para que la estructura
 * del documento siga siendo una lista de títulos con su contenido.
 */
function Detail({ id, text, open }: { id: string; text: string; open: boolean }) {
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

/** El signo que indica si el ramo está abierto o cerrado. */
function Marker({ open }: { open: boolean }) {
  return (
    <span className={styles.marker} data-open={open ? '' : undefined} aria-hidden="true">
      <span className={styles.markerBar} />
      <span className={`${styles.markerBar} ${styles.markerBarUp}`} />
    </span>
  )
}

/**
 * Uno de los dos ramos destacados.
 *
 * Toda la tarjeta responde al clic —el botón se extiende sobre ella con un
 * pseudoelemento—, pero el nombre accesible sigue siendo el del seguro.
 */
export function FeaturedService({ service, index }: ItemProps) {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const expandable = Boolean(service.detail)

  return (
    <li className={styles.feature} data-open={open ? '' : undefined}>
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
        {expandable ? (
          <button
            type="button"
            className={styles.trigger}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            {service.name}
          </button>
        ) : (
          service.name
        )}
      </h3>

      <p className={styles.featureText}>{service.description}</p>

      {expandable ? (
        <>
          <span className={styles.hint} aria-hidden="true">
            {open ? 'Cerrar' : 'Qué cubre'}
            <Marker open={open} />
          </span>
          <Detail id={panelId} text={service.detail ?? ''} open={open} />
        </>
      ) : null}
    </li>
  )
}

/** Uno de los ramos del índice. */
export function ServiceRow({ service, index }: ItemProps) {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const expandable = Boolean(service.detail)

  return (
    <>
      <div className={styles.rowInner} data-open={open ? '' : undefined}>
        <span className={`${styles.index} ${styles.rowIndex}`} aria-hidden="true">
          {index}
        </span>
        <ServiceIcon name={service.icon} className={styles.rowIcon} />
        <h3 className={styles.rowName}>
          {expandable ? (
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((value) => !value)}
            >
              {service.name}
            </button>
          ) : (
            service.name
          )}
        </h3>
        <p className={styles.rowText}>{service.description}</p>
        {expandable ? <Marker open={open} /> : null}
      </div>

      {expandable ? <Detail id={panelId} text={service.detail ?? ''} open={open} /> : null}
    </>
  )
}
