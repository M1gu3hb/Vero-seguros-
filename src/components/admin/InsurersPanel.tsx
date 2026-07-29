'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { deleteInsurer, reorderInsurers, saveInsurer } from '@/actions/content'
import { idleState } from '@/actions/types'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { MediaField } from '@/components/admin/MediaField'
import { TextField } from '@/components/admin/fields'
import { FormFoot, PanelHead, useDirty } from '@/components/admin/form'
import type { Insurer } from '@/content/site-content'

function InsurerForm({ insurer, onSaved }: { insurer?: Insurer; onSaved?: () => void }) {
  const [state, formAction, pending] = useActionState(saveInsurer, idleState)
  const { dirty, markDirty } = useDirty(state)
  const formRef = useRef<HTMLFormElement>(null)
  const isNew = !insurer

  useEffect(() => {
    if (state.status === 'success') {
      onSaved?.()
      if (isNew) formRef.current?.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.at])

  return (
    <form ref={formRef} action={formAction} onChange={markDirty}>
      {insurer ? <input type="hidden" name="id" value={insurer.id} /> : null}

      <div className={styles.fields}>
        <TextField
          name="name"
          label="Nombre de la aseguradora"
          defaultValue={insurer?.name ?? ''}
          error={state.errors?.name}
          maxLength={60}
          required
        />

        <div className={styles.field}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              name="isVisible"
              className={styles.switchInput}
              defaultChecked={insurer?.isVisible ?? true}
            />
            Mostrar en el sitio
          </label>
        </div>

        <MediaField
          label="Logotipo (opcional)"
          hint="Sólo si cuentas con autorización de la marca para usar su logotipo. Si no lo cargas, se muestra el nombre en tipografía."
          urlName="imageUrl"
          altName="imageAlt"
          defaultUrl={insurer?.imageUrl}
          defaultAlt={insurer?.imageAlt}
          folder="aseguradoras"
          onChanged={markDirty}
        />
      </div>

      <FormFoot
        state={state}
        pending={pending}
        dirty={dirty}
        submitLabel={isNew ? 'Agregar aseguradora' : 'Guardar aseguradora'}
      />
    </form>
  )
}

function DeleteInsurerButton({ insurer, onDeleted }: { insurer: Insurer; onDeleted: () => void }) {
  const [state, formAction, pending] = useActionState(deleteInsurer, idleState)
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'success') {
      setOpen(false)
      onDeleted()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.at])

  return (
    <>
      <button type="button" className={styles.linkButton} onClick={() => setOpen(true)}>
        Eliminar aseguradora
      </button>

      <form ref={formRef} action={formAction} hidden>
        <input type="hidden" name="id" value={insurer.id} />
      </form>

      <ConfirmDialog
        open={open}
        pending={pending}
        title={`¿Eliminar «${insurer.name}»?`}
        description="Dejará de aparecer en el sitio y no se puede recuperar. Si sólo quieres dejar de mostrarla por un tiempo, usa «Ocultar»."
        onCancel={() => setOpen(false)}
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  )
}

export function InsurersPanel({ insurers }: { insurers: Insurer[] }) {
  const [order, setOrder] = useState(insurers.map((insurer) => insurer.id))
  const [openId, setOpenId] = useState<string | null>(null)
  const [reorderState, reorderAction, reordering] = useActionState(reorderInsurers, idleState)
  const reorderFormRef = useRef<HTMLFormElement>(null)
  const reorderInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOrder(insurers.map((insurer) => insurer.id))
  }, [insurers])

  const byId = new Map(insurers.map((insurer) => [insurer.id, insurer]))
  const ordered = order.map((id) => byId.get(id)).filter((item): item is Insurer => Boolean(item))

  function move(index: number, direction: -1 | 1) {
    const next = [...order]
    const target = index + direction
    const current = next[index]
    const swap = next[target]
    if (current === undefined || swap === undefined) return
    next[index] = swap
    next[target] = current
    setOrder(next)

    if (reorderInputRef.current) {
      reorderInputRef.current.value = next.join(',')
      reorderFormRef.current?.requestSubmit()
    }
  }

  return (
    <section className={styles.panel}>
      <PanelHead
        title="Aseguradoras"
        hint="Los nombres se muestran en tipografía, en el orden que definas aquí. Puedes añadir un logotipo si la marca lo autoriza."
      />

      <form ref={reorderFormRef} action={reorderAction} hidden>
        <input ref={reorderInputRef} type="hidden" name="ids" defaultValue={order.join(',')} />
      </form>

      <p className={styles.status} aria-live="polite">
        {reordering ? (
          <>
            <span className={styles.statusDot} aria-hidden="true" /> Guardando el orden…
          </>
        ) : reorderState.status === 'success' ? (
          <span className={styles.statusSuccess}>
            <span className={styles.statusDot} aria-hidden="true" /> {reorderState.message}
          </span>
        ) : reorderState.status === 'error' ? (
          <span className={styles.statusError}>
            <span className={styles.statusDot} aria-hidden="true" /> {reorderState.message}
          </span>
        ) : null}
      </p>

      <ul className={styles.items}>
        {ordered.map((insurer, index) => {
          const isOpen = openId === insurer.id
          return (
            <li key={insurer.id} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.itemOrder}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || reordering}
                    aria-label={`Subir ${insurer.name}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => move(index, 1)}
                    disabled={index === ordered.length - 1 || reordering}
                    aria-label={`Bajar ${insurer.name}`}
                  >
                    ↓
                  </button>
                </span>

                <span className={styles.itemName}>{insurer.name}</span>

                <span className={`${styles.badge} ${insurer.isVisible ? '' : styles.badgeHidden}`}>
                  {insurer.isVisible ? 'Visible' : 'Oculta'}
                </span>

                <button
                  type="button"
                  className={styles.itemToggle}
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : insurer.id)}
                >
                  {isOpen ? 'Cerrar' : 'Editar'}
                </button>
              </div>

              {isOpen ? (
                <div className={styles.itemBody}>
                  <InsurerForm insurer={insurer} onSaved={() => setOpenId(null)} />
                  <div className={styles.itemDanger}>
                    <DeleteInsurerButton insurer={insurer} onDeleted={() => setOpenId(null)} />
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <details className={styles.adder}>
        <summary className={styles.adderSummary}>Agregar una aseguradora</summary>
        <div className={styles.newItem}>
          <InsurerForm />
        </div>
      </details>
    </section>
  )
}
