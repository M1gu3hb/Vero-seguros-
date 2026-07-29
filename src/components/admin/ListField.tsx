'use client'

import { useId, useState } from 'react'

import styles from '@/app/admin/admin.module.css'

type ListFieldProps = {
  /** Nombre del campo repetido: se envía una vez por elemento. */
  name: string
  label: string
  hint?: string
  error?: string[] | undefined
  values: string[]
  /** Tope de elementos. */
  max?: number
  placeholder?: string
  onChanged?: () => void
}

/** Identificador estable para cada renglón, para no reordenar al escribir. */
let nextKey = 0
const newRow = (value: string) => ({ key: `fila-${(nextKey += 1)}`, value })

/**
 * Lista editable de textos breves.
 *
 * Cada renglón es un campo con el mismo `name`, así que el formulario los
 * envía como un arreglo en orden. Se puede agregar, quitar y reordenar sin
 * tocar los demás, que era justo lo que hacía falta para los plazos de pago:
 * quitar «12 meses» no debería obligar a reescribir la lista entera.
 */
export function ListField({
  name,
  label,
  hint,
  error,
  values,
  max = 12,
  placeholder,
  onChanged,
}: ListFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const [rows, setRows] = useState(() =>
    values.length > 0 ? values.map(newRow) : [newRow('')],
  )

  const change = (next: typeof rows) => {
    setRows(next)
    onChanged?.()
  }

  return (
    <div className={styles.field}>
      <span className={styles.label} id={id}>
        {label}
      </span>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}

      <ul className={styles.listRows} aria-labelledby={id}>
        {rows.map((row, index) => (
          <li key={row.key} className={styles.listRow}>
            <input
              type="text"
              name={name}
              className={styles.input}
              defaultValue={row.value}
              maxLength={40}
              placeholder={placeholder}
              aria-label={`${label}: elemento ${index + 1}`}
              aria-describedby={
                [hint ? hintId : null, error?.length ? errorId : null].filter(Boolean).join(' ') ||
                undefined
              }
              onChange={(event) => {
                const value = event.currentTarget.value
                setRows((current) =>
                  current.map((item) => (item.key === row.key ? { ...item, value } : item)),
                )
              }}
            />

            <span className={styles.listRowActions}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Subir el elemento ${index + 1}`}
                disabled={index === 0}
                onClick={() => {
                  const next = [...rows]
                  const current = next[index]
                  const above = next[index - 1]
                  if (!current || !above) return
                  next[index - 1] = current
                  next[index] = above
                  change(next)
                }}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Bajar el elemento ${index + 1}`}
                disabled={index === rows.length - 1}
                onClick={() => {
                  const next = [...rows]
                  const current = next[index]
                  const below = next[index + 1]
                  if (!current || !below) return
                  next[index + 1] = current
                  next[index] = below
                  change(next)
                }}
              >
                ↓
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Quitar el elemento ${index + 1}`}
                onClick={() => {
                  const next = rows.filter((item) => item.key !== row.key)
                  change(next.length > 0 ? next : [newRow('')])
                }}
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.listFoot}>
        <button
          type="button"
          className={styles.linkButton}
          disabled={rows.length >= max}
          onClick={() => change([...rows, newRow('')])}
        >
          Agregar
        </button>
        <span className={styles.counter}>
          {rows.filter((row) => row.value.trim()).length} / {max}
        </span>
      </div>

      {error?.length ? (
        <p id={errorId} className={styles.fieldError} role="alert">
          {error.join(' ')}
        </p>
      ) : null}
    </div>
  )
}
