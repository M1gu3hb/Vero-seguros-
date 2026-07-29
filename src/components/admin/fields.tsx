'use client'

import { useId, useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { OjoContrasena, useRevelado } from '@/components/ui/OjoContrasena'

type BaseProps = {
  name: string
  label: string
  hint?: string
  error?: string[] | undefined
  required?: boolean
  maxLength?: number
  /**
   * Valor controlado. Se usa donde el campo comparte borrador con la vista
   * previa: lo que se escribe en uno tiene que verse en la otra.
   */
  value?: string
  onValueChange?: (value: string) => void
}

function FieldError({ id, error }: { id: string; error?: string[] }) {
  if (!error || error.length === 0) return null
  return (
    <p id={id} className={styles.fieldError} role="alert">
      {error.join(' ')}
    </p>
  )
}

export function TextField({
  name,
  label,
  hint,
  error,
  required,
  maxLength,
  defaultValue = '',
  value,
  onValueChange,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
}: BaseProps & {
  defaultValue?: string
  type?: 'text' | 'email' | 'password'
  inputMode?: 'text' | 'email' | 'numeric' | 'tel'
  autoComplete?: string
  placeholder?: string
}) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const controlado = value !== undefined
  const [length, setLength] = useState((value ?? defaultValue).length)
  const invalid = Boolean(error?.length)

  /* Una contraseña se puede mirar: escribirla a ciegas es la mitad de los
     «no me deja entrar». El campo sigue siendo `password` mientras esté tapada,
     que es lo que hace que el navegador no la muestre ni la lea en voz alta. */
  const esClave = type === 'password'
  const [visible, alternarVisible] = useRevelado()

  const campo = (
    <input
      id={id}
      name={name}
      type={esClave && visible ? 'text' : type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className={styles.input}
      {...(controlado ? { value } : { defaultValue })}
      required={required}
      maxLength={maxLength}
      aria-invalid={invalid || undefined}
      aria-describedby={
        [hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(' ') || undefined
      }
      onChange={(event) => {
        setLength(event.currentTarget.value.length)
        onValueChange?.(event.currentTarget.value)
      }}
    />
  )

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {esClave ? (
        <span className="campoClave">
          {campo}
          <OjoContrasena visible={visible} onToggle={alternarVisible} />
        </span>
      ) : (
        campo
      )}
      {maxLength ? (
        <span className={styles.counter}>
          {length} / {maxLength}
        </span>
      ) : null}
      <FieldError id={errorId} error={error} />
    </div>
  )
}

export function TextAreaField({
  name,
  label,
  hint,
  error,
  required,
  maxLength,
  defaultValue = '',
  value,
  onValueChange,
  tall = false,
}: BaseProps & { defaultValue?: string; tall?: boolean }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const controlado = value !== undefined
  const [length, setLength] = useState((value ?? defaultValue).length)
  const invalid = Boolean(error?.length)

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        name={name}
        className={`${styles.textarea} ${tall ? styles.textareaTall : ''}`}
        {...(controlado ? { value } : { defaultValue })}
        required={required}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        aria-describedby={
          [hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(' ') || undefined
        }
        onChange={(event) => {
          setLength(event.currentTarget.value.length)
          onValueChange?.(event.currentTarget.value)
        }}
      />
      {maxLength ? (
        <span className={styles.counter}>
          {length} / {maxLength}
        </span>
      ) : null}
      <FieldError id={errorId} error={error} />
    </div>
  )
}

export function SwitchField({
  name,
  label,
  hint,
  defaultChecked = true,
}: {
  name: string
  label: string
  hint?: string
  defaultChecked?: boolean
}) {
  const id = useId()

  return (
    <div className={styles.field}>
      <label className={styles.switch} htmlFor={id}>
        <input
          id={id}
          name={name}
          type="checkbox"
          className={styles.switchInput}
          defaultChecked={defaultChecked}
        />
        {label}
      </label>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  )
}

export function SelectField({
  name,
  label,
  hint,
  defaultValue,
  options,
}: {
  name: string
  label: string
  hint?: string
  defaultValue?: string
  options: { value: string; label: string }[]
}) {
  const id = useId()

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      <select id={id} name={name} className={styles.select} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
