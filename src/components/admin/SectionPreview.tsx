'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import styles from '@/app/admin/admin.module.css'
import { TextsProvider } from '@/components/content/Texts'

type SectionPreviewProps = {
  /** Los textos con los que se pinta, incluidos los cambios sin guardar. */
  texts: Record<string, string>
  onChange: (key: string, value: string) => void
  /** Ancho, en píxeles, con el que se compone la sección antes de encogerla. */
  width?: number
  children: ReactNode
}

/**
 * La sección real, a escala, con el texto editable encima.
 *
 * No es una imitación ni una maqueta: es exactamente el mismo componente que
 * pinta la página, con sus mismas hojas de estilo. Se compone al ancho de una
 * pantalla de escritorio y luego se encoge para que quepa en el panel, de modo
 * que lo que se ve es lo que va a quedar publicado.
 *
 * Pulsando sobre cualquier frase se escribe encima. Al salir del campo, el
 * cambio sube al panel: los campos de arriba y esta vista trabajan sobre el
 * mismo borrador y se reflejan el uno al otro.
 */
export function SectionPreview({
  texts,
  onChange,
  width = 1280,
  children,
}: SectionPreviewProps) {
  const marco = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(1)
  const [alto, setAlto] = useState<number | null>(null)

  /*
   * La sección se compone siempre a `width` y se reduce con una escala, así
   * que dentro se comporta como en una pantalla ancha —con su rejilla de dos
   * columnas y sus tamaños— aunque el panel sea estrecho. El alto del marco se
   * calcula a partir del alto real ya escalado, porque una transformación no
   * ocupa sitio en la maquetación.
   */
  useEffect(() => {
    const marcoEl = marco.current
    const lienzoEl = lienzo.current
    if (!marcoEl || !lienzoEl) return

    const medir = () => {
      // El marco ya no depende del lienzo: mide lo que le da el panel.
      const disponible = marcoEl.clientWidth
      if (disponible <= 0) return
      const nueva = Math.min(1, disponible / width)
      setEscala(nueva)
      setAlto(lienzoEl.scrollHeight * nueva)
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(marcoEl)
    observador.observe(lienzoEl)
    return () => observador.disconnect()
  }, [width])

  return (
    <div ref={marco} className={styles.preview} style={alto ? { height: alto } : undefined}>
      <div
        ref={lienzo}
        className={styles.previewCanvas}
        style={{ width, transform: `scale(${escala})` }}
      >
        <TextsProvider texts={texts} editing onChange={onChange}>
          {children}
        </TextsProvider>
      </div>
    </div>
  )
}
