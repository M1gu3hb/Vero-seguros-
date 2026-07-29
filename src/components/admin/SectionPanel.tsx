'use client'

import { useActionState, useEffect, useState, type ReactNode } from 'react'

import styles from '@/app/admin/admin.module.css'
import { saveTexts } from '@/actions/content'
import { idleState } from '@/actions/types'
import { SectionPreview } from '@/components/admin/SectionPreview'
import { TextAreaField, TextField } from '@/components/admin/fields'
import { FormFoot, PanelHead } from '@/components/admin/form'
import { textsOfGroup, type TextGroup } from '@/content/texts'

type SectionPanelProps = {
  group: TextGroup
  title: string
  hint: string
  /** Todos los textos publicados, por clave. */
  texts: Record<string, string>
  /**
   * La sección tal como se ve en la página. Recibe el borrador para poder
   * pintar lo que todavía no se ha guardado.
   */
  preview: (draft: Record<string, string>) => ReactNode
  /** Ancho con el que se compone la vista previa antes de encogerla. */
  previewWidth?: number
  /** Campos que no son texto: imágenes, listas, interruptores. */
  children?: ReactNode
}

/**
 * Un panel de sección.
 *
 * Arriba, los campos uno a uno, como han estado siempre. Abajo, la sección
 * entera tal como se ve en la página, a escala y con el texto editable
 * directamente encima: se pulsa sobre una frase y se escribe.
 *
 * Las dos formas trabajan sobre el mismo borrador, así que da igual por dónde
 * se edite: lo que se escribe arriba aparece abajo y al revés. Se guarda una
 * sola vez, con el botón del final.
 */
export function SectionPanel({
  group,
  title,
  hint,
  texts,
  preview,
  previewWidth,
  children,
}: SectionPanelProps) {
  const entradas = textsOfGroup(group)
  const [state, formAction, pending] = useActionState(saveTexts, idleState)
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(entradas.map((entrada) => [entrada.key, texts[entrada.key] ?? entrada.value])),
  )
  const [dirty, setDirty] = useState(false)

  // Al guardar con éxito, el borrador pasa a ser lo publicado.
  useEffect(() => {
    if (state.status === 'success') setDirty(false)
  }, [state.status, state.at])

  const cambiar = (key: string, value: string) => {
    setDraft((actual) => (actual[key] === value ? actual : { ...actual, [key]: value }))
    setDirty(true)
  }

  return (
    <form className={styles.panel} action={formAction}>
      <PanelHead title={title} hint={hint} />

      <input type="hidden" name="values" value={JSON.stringify(draft)} readOnly />

      <div className={styles.fields}>
        {entradas.map((entrada) => {
          const comunes = {
            name: `campo-${entrada.key}`,
            label: entrada.label,
            hint: entrada.hint,
            error: state.errors?.[entrada.key],
            maxLength: entrada.max,
            value: draft[entrada.key] ?? '',
            onValueChange: (value: string) => cambiar(entrada.key, value),
          }

          return entrada.kind === 'parrafo' ? (
            <TextAreaField key={entrada.key} {...comunes} tall={entrada.max > 900} />
          ) : (
            <TextField key={entrada.key} {...comunes} />
          )
        })}

        {children}
      </div>

      <details className={styles.previewBox}>
        <summary className={styles.previewSummary}>
          Vista previa · edita el texto sobre el diseño
        </summary>
        <p className={styles.hint}>
          Es la sección tal como queda publicada. Pulsa sobre cualquier frase y escribe encima; al
          salir del recuadro el cambio se refleja también en los campos de arriba.
        </p>
        <SectionPreview texts={{ ...texts, ...draft }} onChange={cambiar} width={previewWidth}>
          {preview({ ...texts, ...draft })}
        </SectionPreview>
      </details>

      <FormFoot state={state} pending={pending} dirty={dirty} submitLabel="Guardar textos" />
    </form>
  )
}
