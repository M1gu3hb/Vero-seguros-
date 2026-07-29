'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { deleteService, reorderServices, saveService } from '@/actions/content'
import { idleState } from '@/actions/types'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { SelectField, TextAreaField, TextField } from '@/components/admin/fields'
import { FormFoot, PanelHead, useDirty } from '@/components/admin/form'
import type { Service } from '@/content/site-content'

const ICON_OPTIONS = [
  { value: 'vida', label: 'Vida' },
  { value: 'salud', label: 'Salud / médico' },
  { value: 'auto', label: 'Auto' },
  { value: 'camion', label: 'Camión' },
  { value: 'responsabilidad', label: 'Responsabilidad civil' },
  { value: 'hogar', label: 'Hogar' },
  { value: 'funerarios', label: 'Gastos funerarios' },
  { value: 'membresia', label: 'Membresía' },
  { value: 'proteccion', label: 'Protección (genérico)' },
]

/** Sugiere un identificador a partir del nombre. */
function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function ServiceForm({
  service,
  onSaved,
  onDirty,
}: {
  service?: Service
  onSaved?: () => void
  onDirty?: () => void
}) {
  const [state, formAction, pending] = useActionState(saveService, idleState)
  const { dirty, markDirty } = useDirty(state)
  const formRef = useRef<HTMLFormElement>(null)
  const slugTouched = useRef(Boolean(service))
  const isNew = !service

  useEffect(() => {
    if (state.status === 'success') {
      onSaved?.()
      if (isNew) formRef.current?.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.at])

  return (
    <form
      ref={formRef}
      action={formAction}
      onChange={() => {
        markDirty()
        onDirty?.()
      }}
      onInput={(event) => {
        // Al escribir el nombre se sugiere el identificador, mientras no se
        // haya editado a mano.
        const target = event.target as HTMLInputElement
        if (target.name === 'slug') slugTouched.current = true
        if (target.name !== 'name' || slugTouched.current) return
        const slugInput = formRef.current?.elements.namedItem('slug')
        if (slugInput instanceof HTMLInputElement) slugInput.value = slugify(target.value)
      }}
    >
      {service ? <input type="hidden" name="id" value={service.id} /> : null}

      <div className={styles.fields}>
        <div className={styles.fieldRow}>
          <TextField
            name="name"
            label="Nombre"
            defaultValue={service?.name ?? ''}
            error={state.errors?.name}
            maxLength={80}
            required
          />
          <TextField
            name="slug"
            label="Identificador interno"
            hint="Sólo minúsculas, números y guiones. No se muestra en el sitio."
            defaultValue={service?.slug ?? ''}
            error={state.errors?.slug}
            maxLength={60}
            required
          />
        </div>

        <TextAreaField
          name="description"
          label="Descripción"
          hint="Breve y prudente. Evita prometer coberturas o aprobaciones."
          defaultValue={service?.description ?? ''}
          error={state.errors?.description}
          maxLength={400}
          required
        />

        <div className={styles.fieldRow}>
          <SelectField
            name="icon"
            label="Icono"
            defaultValue={service?.icon ?? 'proteccion'}
            options={ICON_OPTIONS}
          />
          <div className={styles.field}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                name="isVisible"
                className={styles.switchInput}
                defaultChecked={service?.isVisible ?? true}
              />
              Mostrar en el sitio
            </label>
          </div>
        </div>
      </div>

      <FormFoot
        state={state}
        pending={pending}
        dirty={dirty}
        submitLabel={isNew ? 'Agregar servicio' : 'Guardar servicio'}
      />
    </form>
  )
}

function DeleteServiceButton({ service, onDeleted }: { service: Service; onDeleted: () => void }) {
  const [state, formAction, pending] = useActionState(deleteService, idleState)
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
        Eliminar servicio
      </button>

      <form ref={formRef} action={formAction} hidden>
        <input type="hidden" name="id" value={service.id} />
      </form>

      <ConfirmDialog
        open={open}
        pending={pending}
        title={`¿Eliminar «${service.name}»?`}
        description="El servicio desaparecerá del sitio y no se puede recuperar. Si sólo quieres dejar de mostrarlo por un tiempo, usa «Ocultar»."
        onCancel={() => setOpen(false)}
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  )
}

export function ServicesPanel({ services }: { services: Service[] }) {
  const [order, setOrder] = useState(services.map((service) => service.id))
  const [openId, setOpenId] = useState<string | null>(null)
  const [reorderState, reorderAction, reordering] = useActionState(reorderServices, idleState)
  const reorderFormRef = useRef<HTMLFormElement>(null)
  const reorderInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOrder(services.map((service) => service.id))
  }, [services])

  const byId = new Map(services.map((service) => [service.id, service]))
  const ordered = order.map((id) => byId.get(id)).filter((item): item is Service => Boolean(item))

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
        title="Seguros"
        hint="Agrega, edita, reordena, oculta o elimina los ramos que ofreces. El orden es el que se ve en la página; los dos primeros aparecen destacados."
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
        {ordered.map((service, index) => {
          const isOpen = openId === service.id
          return (
            <li key={service.id} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.itemOrder}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || reordering}
                    aria-label={`Subir ${service.name}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => move(index, 1)}
                    disabled={index === ordered.length - 1 || reordering}
                    aria-label={`Bajar ${service.name}`}
                  >
                    ↓
                  </button>
                </span>

                <span className={styles.itemName}>{service.name}</span>

                <span className={`${styles.badge} ${service.isVisible ? '' : styles.badgeHidden}`}>
                  {service.isVisible ? 'Visible' : 'Oculto'}
                </span>

                <button
                  type="button"
                  className={styles.itemToggle}
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : service.id)}
                >
                  {isOpen ? 'Cerrar' : 'Editar'}
                </button>
              </div>

              {isOpen ? (
                <div className={styles.itemBody}>
                  <ServiceForm service={service} onSaved={() => setOpenId(null)} />
                  <div className={styles.itemDanger}>
                    <DeleteServiceButton service={service} onDeleted={() => setOpenId(null)} />
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <details className={styles.adder}>
        <summary className={styles.adderSummary}>Agregar un servicio</summary>
        <div className={styles.newItem}>
          <ServiceForm />
        </div>
      </details>
    </section>
  )
}
