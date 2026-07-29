'use client'

import { useEffect, useRef } from 'react'

import styles from '@/app/admin/admin.module.css'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmación antes de eliminar.
 *
 * Diálogo modal accesible: foco inicial en «Cancelar», cierre con Escape,
 * foco contenido y retorno del foco al elemento que lo abrió.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return

    openerRef.current = document.activeElement
    cancelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className={styles.dialogBackdrop} onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
        className={styles.dialog}
      >
        <h2 id="confirm-title" className={styles.dialogTitle}>
          {title}
        </h2>
        <p id="confirm-text" className={styles.dialogText}>
          {description}
        </p>
        <div className={styles.dialogActions}>
          <button
            ref={cancelRef}
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${styles.btnDanger}`}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
