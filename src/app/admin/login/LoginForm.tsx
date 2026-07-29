'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'

import { loginSchema } from '@/lib/schemas'
import { createClient } from '@/lib/supabase/client'
import styles from './login.module.css'

/**
 * Inicio de sesión.
 *
 * La contraseña se verifica siempre en Supabase; aquí sólo se valida el
 * formato antes de enviarla. No hay ninguna comparación de credenciales en el
 * navegador ni contraseñas en el código.
 */
export function LoginForm() {
  const router = useRouter()
  const emailId = useId()
  const passwordId = useId()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const parsed = loginSchema.safeParse({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos.')
      return
    }

    setPending(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      })

      if (signInError) {
        setError('Correo o contraseña incorrectos.')
        return
      }

      router.replace('/admin')
      router.refresh()
    } catch {
      setError('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor={emailId}>
          Correo
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          className={styles.input}
          required
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={passwordId}>
          Contraseña
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          className={styles.input}
          required
        />
      </div>

      <button type="submit" className={`btn btn--primary ${styles.submit}`} disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
