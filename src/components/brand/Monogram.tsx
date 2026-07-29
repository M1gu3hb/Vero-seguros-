import { MONOGRAM_PATHS, MONOGRAM_VIEWBOX } from '@/lib/brand'

type MonogramProps = {
  /** Altura del monograma. El ancho se calcula solo. Ignorada si `fluid`. */
  height?: number | string
  /** Ocupa todo el ancho disponible y calcula la altura. */
  fluid?: boolean
  className?: string
  /** Texto accesible. Si se omite, el monograma queda como decoración. */
  title?: string
}

/**
 * Monograma VM.
 *
 * Se dibuja en línea (no con <img>) para heredar el color mediante
 * `currentColor` y poder animarlo sin cargar un archivo adicional.
 */
export function Monogram({ height = 28, fluid = false, className, title }: MonogramProps) {
  const isDecorative = !title

  return (
    <svg
      viewBox={MONOGRAM_VIEWBOX}
      {...(fluid ? {} : { height })}
      className={className}
      fill="currentColor"
      fillRule="nonzero"
      role={isDecorative ? 'presentation' : 'img'}
      aria-hidden={isDecorative || undefined}
      aria-label={title}
      focusable="false"
      style={fluid ? { width: '100%', height: 'auto' } : { width: 'auto' }}
    >
      {MONOGRAM_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
