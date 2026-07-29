import type { ReactNode } from 'react'

type SectionHeadingProps = {
  /** Numeral de sección, en dos dígitos. */
  index: string
  /** Admite un nodo para que el rótulo pueda ser un texto editable. */
  label: ReactNode
  onNavy?: boolean
  children?: ReactNode
}

/**
 * Etiqueta de sección con numeral.
 *
 * Da al recorrido la estructura de un índice impreso: la regla, el número y la
 * versalita del rótulo, exactamente como los bloques de la tarjeta de
 * presentación. No añade información: sólo ordena la que ya hay.
 */
export function SectionEyebrow({ index, label, onNavy = false }: SectionHeadingProps) {
  return (
    <p className={`eyebrow ${onNavy ? 'eyebrow--on-navy' : ''}`}>
      <span className="eyebrow__index" aria-hidden="true">
        {index}
      </span>
      {label}
    </p>
  )
}

/** Las cuatro marcas de esquina de un bloque enmarcado. */
export function CropMarks() {
  return (
    <>
      <span className="crop crop--tl" aria-hidden="true" />
      <span className="crop crop--tr" aria-hidden="true" />
      <span className="crop crop--bl" aria-hidden="true" />
      <span className="crop crop--br" aria-hidden="true" />
    </>
  )
}
