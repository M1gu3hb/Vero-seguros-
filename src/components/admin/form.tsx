'use client'

import { useCallback, useEffect, useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import type { ActionState } from '@/actions/types'

/**
 * Marca el formulario como «con cambios sin guardar» y avisa antes de
 * abandonar la página. Se limpia al guardar correctamente.
 */
export function useDirty(state: ActionState) {
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (state.status === 'success') setDirty(false)
  }, [state.status, state.at])

  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const markDirty = useCallback(() => setDirty(true), [])

  return { dirty, markDirty, setDirty }
}

type FormFootProps = {
  state: ActionState
  pending: boolean
  dirty: boolean
  submitLabel?: string
  children?: React.ReactNode
}

/** Pie común: estado de guardado, aviso de cambios pendientes y botón. */
export function FormFoot({
  state,
  pending,
  dirty,
  submitLabel = 'Guardar cambios',
  children,
}: FormFootProps) {
  const showSuccess = state.status === 'success' && !dirty
  const showError = state.status === 'error'

  return (
    <div className={styles.formFoot}>
      <p className={styles.status} aria-live="polite">
        {pending ? (
          <>
            <span className={styles.statusDot} aria-hidden="true" />
            Guardando…
          </>
        ) : showError ? (
          <span className={styles.statusError}>
            <span className={styles.statusDot} aria-hidden="true" /> {state.message}
          </span>
        ) : showSuccess ? (
          <span className={styles.statusSuccess}>
            <span className={styles.statusDot} aria-hidden="true" /> {state.message}
          </span>
        ) : dirty ? (
          <span className={styles.statusDirty}>
            <span className={styles.statusDot} aria-hidden="true" /> Tienes cambios sin guardar
          </span>
        ) : null}
      </p>
      {children}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? 'Guardando…' : submitLabel}
      </button>
    </div>
  )
}

type PanelProps = {
  title: string
  hint?: string
  children: React.ReactNode
}

export function PanelHead({ title, hint }: Omit<PanelProps, 'children'>) {
  return (
    <div className={styles.panelHead}>
      <h2 className={styles.panelTitle}>{title}</h2>
      {hint ? <p className={styles.panelHint}>{hint}</p> : null}
    </div>
  )
}
