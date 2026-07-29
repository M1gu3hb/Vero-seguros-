'use client'

import { useActionState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { changePassword } from '@/actions/auth'
import { idleState } from '@/actions/types'
import { TextField } from '@/components/admin/fields'
import { FormFoot, PanelHead, useDirty } from '@/components/admin/form'

export function AccountPanel({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(changePassword, idleState)
  const { dirty, markDirty } = useDirty(state)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead
        title="Tu cuenta"
        hint={`Has entrado como ${email}. Aquí puedes cambiar tu contraseña; conviene hacerlo la primera vez que entras.`}
      />

      <div className={styles.fields}>
        <TextField
          name="password"
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          hint="Al menos 10 caracteres. Usa algo que sólo tú recuerdes."
          error={state.errors?.password}
          required
        />
        <TextField
          name="confirm"
          label="Repite la nueva contraseña"
          type="password"
          autoComplete="new-password"
          error={state.errors?.confirm}
          required
        />
      </div>

      <FormFoot state={state} pending={pending} dirty={dirty} submitLabel="Cambiar contraseña" />
    </form>
  )
}
