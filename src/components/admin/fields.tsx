'use client'

import { useId, useState } from 'react'

import styles from '@/app/admin/admin.module.css'

type BaseProps = {
  name: string
  label: string
  hint?: string
  error?: string[] | undefined
  required?: boolean
  maxLength?: number
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
  const [length, setLength] = useState(defaultValue.length)
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
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={styles.input}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        aria-describedby={
          [hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(' ') || undefined
        }
        onInput={(event) => setLength(event.currentTarget.value.length)}
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

export function TextAreaField({
  name,
  label,
  hint,
  error,
  required,
  maxLength,
  defaultValue = '',
  tall = false,
}: BaseProps & { defaultValue?: string; tall?: boolean }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const [length, setLength] = useState(defaultValue.length)
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
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        aria-describedby={
          [hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(' ') || undefined
        }
        onInput={(event) => setLength(event.currentTarget.value.length)}
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
