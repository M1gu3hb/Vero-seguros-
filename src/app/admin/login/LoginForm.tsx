'use client'

import { useActionState, useId, useState } from 'react'

import { signIn } from '@/actions/auth'
import { idleState } from '@/actions/types'
import { OjoContrasena, useRevelado } from '@/components/ui/OjoContrasena'
import { loginSchema } from '@/lib/schemas'
import styles from './login.module.css'

/**
 * Inicio de sesión.
 *
 * La contraseña no se comprueba aquí ni viaja a Supabase desde el navegador:
 * se envía al propio servidor, que es quien habla con Supabase, cuenta los
 * intentos fallidos y devuelve la sesión en cookies que el navegador no puede
 * leer. En esta pantalla no hay ninguna contraseña ni ninguna comparación.
 *
 * Lo único que se mira antes de enviar es la forma —que el correo parezca un
 * correo y que la contraseña tenga largo suficiente—, para no gastar un viaje
 * de ida y vuelta en un dedazo.
 */
export function LoginForm() {
  const emailId = useId()
  const passwordId = useId()
  const [state, formAction, pending] = useActionState(signIn, idleState)
  const [formatoInvalido, setFormatoInvalido] = useState<string | null>(null)
  const [claveVisible, alternarClave] = useRevelado()

  const error = formatoInvalido ?? (state.status === 'error' ? state.message : null)

  return (
    <form
      className={styles.form}
      action={formAction}
      onSubmit={(event) => {
        const parsed = loginSchema.safeParse({
          email: String(new FormData(event.currentTarget).get('email') ?? ''),
          password: String(new FormData(event.currentTarget).get('password') ?? ''),
        })

        if (!parsed.success) {
          event.preventDefault()
          setFormatoInvalido(parsed.error.issues[0]?.message ?? 'Revisa los datos.')
          return
        }

        setFormatoInvalido(null)
      }}
      noValidate
    >
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
        <span className="campoClave">
          <input
            id={passwordId}
            name="password"
            type={claveVisible ? 'text' : 'password'}
            autoComplete="current-password"
            className={styles.input}
            required
          />
          <OjoContrasena visible={claveVisible} onToggle={alternarClave} />
        </span>
      </div>

      <button type="submit" className={`btn btn--primary ${styles.submit}`} disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
