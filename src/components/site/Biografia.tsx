'use client'

import { Typed } from '@/components/motion/Typed'
import { Txt, useEditing, useTextValue } from '@/components/content/Texts'

type BiografiaProps = {
  introClassName?: string
  bodyClassName?: string
}

/**
 * Separa la biografía en párrafos.
 *
 * Se acepta cualquier convención de salto de línea: el navegador envía los
 * campos de texto con CRLF, así que un texto guardado antes de normalizarlo en
 * el servidor puede traer `\r\n\r\n` en vez de `\n\n`.
 */
export function partirEnParrafos(texto: string): string[] {
  return texto
    .split(/(?:\r\n?|\n)\s*(?:\r\n?|\n)/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean)
}

/**
 * La introducción y la biografía.
 *
 * En la página se escriben solas al llegar a ellas, de corrido, de la primera
 * palabra a la última. Mientras se edita desde el administrador se muestran
 * planas y se puede escribir encima: repartidas en palabras no habría manera.
 */
export function Biografia({ introClassName, bodyClassName }: BiografiaProps) {
  const editing = useEditing()
  const intro = useTextValue('sobre.intro')
  const cuerpo = useTextValue('sobre.biografia')

  if (editing) {
    return (
      <>
        <p className={introClassName}>
          <Txt k="sobre.intro" />
        </p>
        <div className={bodyClassName}>
          <p>
            <Txt k="sobre.biografia" />
          </p>
        </div>
      </>
    )
  }

  return (
    <Typed
      speed={48}
      bodyFrom={1}
      bodyClassName={bodyClassName}
      blocks={[
        { text: intro, className: introClassName },
        ...partirEnParrafos(cuerpo).map((parrafo) => ({ text: parrafo })),
      ]}
    />
  )
}
