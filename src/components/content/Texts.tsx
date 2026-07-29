'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

import { TEXT_BY_KEY, defaultTexts } from '@/content/texts'

type TextsValue = {
  texts: Record<string, string>
  /** En el administrador, cada frase se puede pulsar y escribir encima. */
  editing: boolean
  onChange?: (key: string, value: string) => void
}

const TextsContext = createContext<TextsValue>({ texts: defaultTexts, editing: false })

export function TextsProvider({
  texts,
  editing = false,
  onChange,
  children,
}: Omit<TextsValue, 'editing'> & { editing?: boolean; children: ReactNode }) {
  return (
    <TextsContext.Provider value={{ texts, editing, onChange }}>{children}</TextsContext.Provider>
  )
}

/** El valor de una frase, para cuando hace falta como cadena (un `alt`, un título). */
export function useTextValue(key: string): string {
  const { texts } = useContext(TextsContext)
  return texts[key] ?? defaultTexts[key] ?? ''
}

/**
 * Si se está editando sobre el diseño.
 *
 * Lo consultan las piezas que normalmente animan el texto —el título que se
 * compone palabra por palabra, la biografía que se escribe sola, la cita—:
 * partido en trozos no se podría escribir encima, así que mientras se edita se
 * muestran planas.
 */
export function useEditing(): boolean {
  return useContext(TextsContext).editing
}

/**
 * Una frase de la página.
 *
 * En el sitio público imprime el texto y nada más: no envuelve en ninguna
 * etiqueta, así que el diseño no cambia en absoluto. Dentro del administrador
 * se convierte en un campo que se edita pulsando encima, sobre el diseño real.
 */
export function Txt({ k }: { k: string }) {
  const { texts, editing, onChange } = useContext(TextsContext)
  const value = texts[k] ?? defaultTexts[k] ?? ''

  if (!editing) return <>{value}</>

  return <Editable textKey={k} value={value} onChange={onChange} />
}

/**
 * El campo que se escribe encima del diseño.
 *
 * Se apoya en `contentEditable` en lugar de un `input`, que es lo que permite
 * que el texto conserve exactamente la tipografía, el tamaño y el salto de
 * línea que tendrá en la página: se edita lo que se ve.
 *
 * React no controla el contenido mientras se escribe —lo pisaría en cada
 * pulsación—, así que el valor se confirma al salir del campo y sólo se
 * vuelve a sincronizar cuando cambia desde fuera y el campo no tiene el foco.
 */
function Editable({
  textKey,
  value,
  onChange,
}: {
  textKey: string
  value: string
  onChange?: (key: string, value: string) => void
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inicial = useRef(value)
  const entry = TEXT_BY_KEY.get(textKey)
  const multilinea = entry?.kind === 'parrafo'

  useEffect(() => {
    const el = ref.current
    if (!el || document.activeElement === el) return
    if (leer(el) !== value) el.textContent = value
  }, [value])

  const confirmar = useCallback(() => {
    const el = ref.current
    if (!el) return
    const limpio = leer(el)
    if (limpio !== value) onChange?.(textKey, limpio)
  }, [onChange, textKey, value])

  return (
    <span
      ref={ref}
      className="txt"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multilinea || undefined}
      data-txt-kind={entry?.kind}
      aria-label={entry?.label ?? textKey}
      data-txt={textKey}
      spellCheck
      onBlur={confirmar}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          if (ref.current) ref.current.textContent = value
          ref.current?.blur()
          return
        }
        if (event.key === 'Enter' && !multilinea) {
          event.preventDefault()
          ref.current?.blur()
        }
      }}
      onPaste={(event) => {
        // Sólo texto: pegar desde otra página no debe traerse su formato.
        event.preventDefault()
        const plano = event.clipboardData.getData('text/plain')
        const seleccion = window.getSelection()
        if (!seleccion?.rangeCount) return
        seleccion.deleteFromDocument()
        seleccion.getRangeAt(0).insertNode(document.createTextNode(plano))
        seleccion.collapseToEnd()
      }}
    >
      {inicial.current}
    </span>
  )
}

/**
 * Lee el contenido conservando los saltos de línea y descartando el formato.
 *
 * No sirve `innerText`: devuelve el texto **como se ve**, y un rótulo con
 * `text-transform: uppercase` se guardaría en mayúsculas para siempre. Se lee
 * el texto crudo y se reponen a mano los saltos que el navegador introduce al
 * escribir dentro de un elemento editable.
 */
function leer(el: HTMLElement): string {
  const copia = el.cloneNode(true) as HTMLElement

  copia.querySelectorAll('br').forEach((salto) => salto.replaceWith('\n'))
  copia.querySelectorAll('div, p').forEach((bloque) => bloque.prepend('\n'))

  return (copia.textContent ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
