'use client'

import { useActionState, useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { saveAbout, saveHero, saveIdentity, savePromos } from '@/actions/content'
import { idleState } from '@/actions/types'
import { MediaField } from '@/components/admin/MediaField'
import { TextAreaField, TextField } from '@/components/admin/fields'
import { FormFoot, PanelHead, useDirty } from '@/components/admin/form'
import type { SiteSettings } from '@/content/site-content'

type PanelProps = { settings: SiteSettings }

/* ── Identidad y contacto ───────────────────────────────────────────────── */

export function IdentityPanel({ settings }: PanelProps) {
  const [state, formAction, pending] = useActionState(saveIdentity, idleState)
  const { dirty, markDirty } = useDirty(state)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead
        title="Identidad y contacto"
        hint="Tu nombre, tu cargo, tu frase de marca y las formas de contacto. El número de WhatsApp nunca aparece escrito en el sitio: sólo se usa para armar el enlace del botón."
      />

      <div className={styles.fields}>
        <div className={styles.fieldRow}>
          <TextField
            name="brandName"
            label="Nombre"
            defaultValue={settings.brandName}
            error={state.errors?.brandName}
            maxLength={80}
            required
          />
          <TextField
            name="brandRole"
            label="Cargo"
            defaultValue={settings.brandRole}
            error={state.errors?.brandRole}
            maxLength={90}
            required
          />
        </div>

        <TextField
          name="brandTagline"
          label="Frase de marca"
          hint="Aparece en el encabezado, en el cierre y en el pie de página."
          defaultValue={settings.brandTagline}
          error={state.errors?.brandTagline}
          maxLength={90}
          required
        />

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
          label="Mensaje prellenado de WhatsApp"
          hint="Es el texto que aparece escrito cuando alguien abre la conversación contigo."
          defaultValue={settings.whatsappMessage}
          error={state.errors?.whatsappMessage}
          maxLength={400}
          required
        />

        <TextField
          name="coverageText"
          label="Texto de cobertura"
          defaultValue={settings.coverageText}
          error={state.errors?.coverageText}
          maxLength={90}
          required
        />
      </div>

      <FormFoot state={state} pending={pending} dirty={dirty} />
    </form>
  )
}

/* ── Inicio (hero) ──────────────────────────────────────────────────────── */

export function HeroPanel({ settings }: PanelProps) {
  const [state, formAction, pending] = useActionState(saveHero, idleState)
  const { dirty, markDirty } = useDirty(state)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead
        title="Inicio"
        hint="Lo primero que se ve al entrar. Si cargas una fotografía tuya, sustituirá al monograma en la tarjeta de presentación; si no, el diseño funciona igual."
      />

      <div className={styles.fields}>
        <TextField
          name="heroEyebrow"
          label="Etiqueta superior"
          defaultValue={settings.heroEyebrow}
          error={state.errors?.heroEyebrow}
          maxLength={90}
          required
        />

        <TextAreaField
          name="heroTitle"
          label="Título principal"
          hint="Una sola frase, clara y directa."
          defaultValue={settings.heroTitle}
          error={state.errors?.heroTitle}
          maxLength={160}
          required
        />

        <TextAreaField
          name="heroDescription"
          label="Descripción"
          defaultValue={settings.heroDescription}
          error={state.errors?.heroDescription}
          maxLength={500}
          required
        />

        <div className={styles.fieldRow}>
          <TextField
            name="heroPrimaryCta"
            label="Texto del botón de WhatsApp"
            defaultValue={settings.heroPrimaryCta}
            error={state.errors?.heroPrimaryCta}
            maxLength={40}
            required
          />
          <TextField
            name="heroSecondaryCta"
            label="Texto del botón de correo"
            defaultValue={settings.heroSecondaryCta}
            error={state.errors?.heroSecondaryCta}
            maxLength={40}
            required
          />
        </div>

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

/* ── Sobre Verónica ─────────────────────────────────────────────────────── */

export function AboutPanel({ settings }: PanelProps) {
  const [state, formAction, pending] = useActionState(saveAbout, idleState)
  const { dirty, markDirty } = useDirty(state)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead
        title="Sobre Verónica"
        hint="Tu historia. Separa los párrafos dejando una línea en blanco entre uno y otro."
      />

      <div className={styles.fields}>
        <TextField
          name="aboutTitle"
          label="Título"
          defaultValue={settings.aboutTitle}
          error={state.errors?.aboutTitle}
          maxLength={90}
          required
        />

        <TextAreaField
          name="aboutIntro"
          label="Introducción"
          hint="Dos o tres líneas, destacadas en un tamaño mayor."
          defaultValue={settings.aboutIntro}
          error={state.errors?.aboutIntro}
          maxLength={500}
          required
        />

        <TextAreaField
          name="aboutBody"
          label="Biografía"
          hint="Deja una línea en blanco entre párrafos."
          defaultValue={settings.aboutBody}
          error={state.errors?.aboutBody}
          maxLength={4000}
          tall
          required
        />

        <TextAreaField
          name="aboutQuote"
          label="Cita destacada"
          defaultValue={settings.aboutQuote}
          error={state.errors?.aboutQuote}
          maxLength={300}
          required
        />

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

/* ── Promociones y formas de pago ───────────────────────────────────────── */

export function PromosPanel({ settings }: PanelProps) {
  const [state, formAction, pending] = useActionState(savePromos, idleState)
  const { dirty, markDirty } = useDirty(state)
  const [visible, setVisible] = useState(settings.promosVisible)

  return (
    <form className={styles.panel} action={formAction} onChange={markDirty}>
      <PanelHead
        title="Promociones y formas de pago"
        hint="Puedes ocultar toda la sección si en algún momento deja de haber facilidades vigentes."
      />

      <div className={styles.fields}>
        <TextField
          name="promosTitle"
          label="Título"
          defaultValue={settings.promosTitle}
          error={state.errors?.promosTitle}
          maxLength={90}
          required
        />

        <TextAreaField
          name="promosDescription"
          label="Descripción"
          defaultValue={settings.promosDescription}
          error={state.errors?.promosDescription}
          maxLength={700}
          required
        />

        <TextAreaField
          name="promosNote"
          label="Nota de condiciones"
          hint="Se muestra en letra pequeña, al final de la sección."
          defaultValue={settings.promosNote}
          error={state.errors?.promosNote}
          maxLength={400}
          required
        />

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
