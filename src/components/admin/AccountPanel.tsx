'use client'

import { useActionState, useEffect, useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { changePassword } from '@/actions/auth'
import { idleState } from '@/actions/types'
import { TextField } from '@/components/admin/fields'
import { FormFoot, PanelHead, useDirty } from '@/components/admin/form'

export function AccountPanel({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(changePassword, idleState)
  const { dirty, markDirty } = useDirty(state)

  /*
   * Los dos campos son controlados a propósito.
   *
   * React vacía por su cuenta los campos de un formulario cuando la acción
   * termina, así que un dedazo en la repetición borraba **las dos**
   * contraseñas y había que escribirlas otra vez desde cero. Conservándolas,
   * corregir es cambiar una letra. Al cambiarla de verdad sí se limpian: ya no
   * hacen falta.
   */
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')

  useEffect(() => {
    if (state.status === 'success') {
      setClave('')
      setRepetida('')
    }
  }, [state.status, state.at])

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
          hint="Al menos 10 caracteres. Usa algo que sólo tú recuerdes. Puedes pulsar el ojo para ver lo que escribes."
          error={state.errors?.password}
          value={clave}
          onValueChange={setClave}
          required
        />
        <TextField
          name="confirm"
          label="Repite la nueva contraseña"
          type="password"
          autoComplete="new-password"
          error={state.errors?.confirm}
          value={repetida}
          onValueChange={setRepetida}
          required
        />
      </div>

      <FormFoot state={state} pending={pending} dirty={dirty} submitLabel="Cambiar contraseña" />
    </form>
  )
}
