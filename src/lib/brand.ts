/**
 * Geometría del monograma VM.
 *
 * Reconstruido vectorialmente a partir de la tarjeta de presentación de
 * Verónica: letras serif de alto contraste (tipo Didone), serifas planas y
 * delgadas, altura de mayúscula de 100 unidades. La serifa superior del asta
 * fina de la V toca la serifa del asta izquierda de la M — ahí ocurre el
 * entrelace — mientras que los trazos permanecen separados.
 *
 * Es la única fuente de verdad de la marca: los archivos de `public/brand/`
 * y el componente `<Monogram />` usan exactamente estas trayectorias.
 */
export const MONOGRAM_VIEWBOX = '0 0 225 100'

export const MONOGRAM_PATHS: readonly string[] = [
  // V — asta gruesa, asta fina y vértice sobre la línea base
  'M5 0 L24 0 L53 83 L82 0 L91 0 L56 100 L40 100 Z',
  'M0 0 H29 V4.5 H0 Z',
  'M78 0 H93 V4.5 H78 Z',
  // M — astas verticales, diagonal gruesa y diagonal fina hasta la base
  'M97 0 L127 0 L163 100 L149 100 L113 0 L113 100 L97 100 Z',
  'M196 0 L220 0 L220 100 L204 100 L204 0 L171 100 L163 100 Z',
  'M92 0 H132 V4.5 H92 Z',
  'M191 0 H225 V4.5 H191 Z',
  'M92 95.5 H118 V100 H92 Z',
  'M199 95.5 H225 V100 H199 Z',
]

/** Relación de aspecto del monograma (ancho / alto). */
export const MONOGRAM_RATIO = 225 / 100

/**
 * Curva «trayectoria»: la onda de la tarjeta, redibujada como una sola
 * trayectoria continua. Se usa como transición entre secciones y como
 * elemento de fondo. Lienzo de 1440 × 120, orientada de izquierda a derecha.
 */
export const TRAJECTORY_PATH =
  'M0 74 C 180 74, 300 18, 480 18 C 660 18, 780 96, 960 96 C 1140 96, 1260 34, 1440 34'

/** Swash dorado que subraya la frase de marca en la tarjeta. */
export const SWASH_PATH = 'M0 6 C 40 -2, 160 -2, 200 6'
