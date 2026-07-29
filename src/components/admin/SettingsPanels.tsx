'use client'

import { useActionState, useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { saveAboutImage, saveContact, saveHeroImage, savePaymentTerms } from '@/actions/content'
import { idleState } from '@/actions/types'
import { ListField } from '@/components/admin/ListField'
import { MediaField } from '@/components/admin/MediaField'
import { TextAreaField, TextField } from '@/components/admin/fields'
import { FormFoot, PanelHead, useDirty } from '@/components/admin/form'
import type { SiteSettings } from '@/content/site-content'

type PanelProps = { settings: SiteSettings }

/* ── Contacto ───────────────────────────────────────────────────────────────
   Lo que no es texto de la página: a dónde escriben y por dónde te escriben. */

export function ContactPanel({ settings }: PanelProps) {
  const [state, formAction, pending] = useActionState(saveContact, idleState)
  const { dirty, markDirty } = useDirty(state)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead
        title="Formas de contacto"
        hint="A dónde llegan los mensajes. El número de WhatsApp nunca aparece escrito en el sitio: sólo se usa para armar el enlace del botón."
      />

      <div className={styles.fields}>
        <div className={styles.fieldRow}>
          <TextField
            name="contactEmail"
            label="Correo"
            type="email"
            inputMode="email"
            autoComplete="email"
            hint="Se muestra en el sitio y abre la aplicación de correo."
            defaultValue={settings.contactEmail}
            error={state.errors?.contactEmail}
            required
          />
          <TextField
            name="whatsappNumber"
            label="Número de WhatsApp (interno)"
            inputMode="numeric"
            hint="Con clave del país y sin espacios. Por ejemplo: 525540085632. No se muestra en el sitio."
            defaultValue={settings.whatsappNumber}
            error={state.errors?.whatsappNumber}
            maxLength={15}
            required
          />
        </div>

        <TextAreaField
          name="whatsappMessage"
          label="Mensaje prellenado"
          hint="Es el texto que aparece escrito cuando alguien abre la conversación contigo, y también el cuerpo del correo."
          defaultValue={settings.whatsappMessage}
          error={state.errors?.whatsappMessage}
          maxLength={400}
          required
        />
      </div>

      <FormFoot state={state} pending={pending} dirty={dirty} />
    </form>
  )
}

/* ── Fotografías ───────────────────────────────────────────────────────────── */

export function HeroImagePanel({ settings }: PanelProps) {
  const [state, formAction, pending] = useActionState(saveHeroImage, idleState)
  const { dirty, markDirty } = useDirty(state)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead
        title="Fotografía de inicio"
        hint="Si cargas una fotografía tuya, sustituirá al monograma en la tarjeta de presentación; si no, el diseño funciona igual."
      />
      <div className={styles.fields}>
        <MediaField
          label="Fotografía principal (opcional)"
          urlName="heroImageUrl"
          altName="heroImageAlt"
          defaultUrl={settings.heroImageUrl}
          defaultAlt={settings.heroImageAlt}
          folder="inicio"
          onChanged={markDirty}
        />
      </div>
      <FormFoot state={state} pending={pending} dirty={dirty} />
    </form>
  )
}

export function AboutImagePanel({ settings }: PanelProps) {
  const [state, formAction, pending] = useActionState(saveAboutImage, idleState)
  const { dirty, markDirty } = useDirty(state)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead title="Tu fotografía" hint="Aparece junto a la biografía." />
      <div className={styles.fields}>
        <MediaField
          label="Fotografía de la sección (opcional)"
          urlName="aboutImageUrl"
          altName="aboutImageAlt"
          defaultUrl={settings.aboutImageUrl}
          defaultAlt={settings.aboutImageAlt}
          folder="sobre"
          onChanged={markDirty}
        />
      </div>
      <FormFoot state={state} pending={pending} dirty={dirty} />
    </form>
  )
}

/* ── Plazos y visibilidad de las formas de pago ───────────────────────────── */

export function PaymentTermsPanel({ settings }: PanelProps) {
  const [state, formAction, pending] = useActionState(savePaymentTerms, idleState)
  const { dirty, markDirty } = useDirty(state)
  const [visible, setVisible] = useState(settings.promosVisible)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead
        title="Plazos y modalidades"
        hint="Las listas que aparecen a la derecha de la sección. Quitar uno no afecta a los demás; si dejas una lista vacía, ese bloque no aparece."
      />

      <div className={styles.fields}>
        <div className={styles.fieldRow}>
          <ListField
            name="promosInstallments"
            label="Plazos"
            hint="Uno por renglón."
            values={settings.promosInstallments}
            error={state.errors?.promosInstallments}
            placeholder="3 meses"
            onChanged={markDirty}
          />
          <ListField
            name="promosFrequencies"
            label="Modalidades"
            hint="Con qué periodicidad se puede pagar."
            values={settings.promosFrequencies}
            error={state.errors?.promosFrequencies}
            placeholder="Mensual"
            onChanged={markDirty}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              name="promosVisible"
              className={styles.switchInput}
              checked={visible}
              onChange={(event) => setVisible(event.currentTarget.checked)}
            />
            Mostrar la sección en el sitio
          </label>
          <p className={styles.hint}>
            {visible
              ? 'La sección está visible para quien visita la página.'
              : 'La sección está oculta: nadie la verá en el sitio público.'}
          </p>
        </div>
      </div>

      <FormFoot state={state} pending={pending} dirty={dirty} />
    </form>
  )
}
