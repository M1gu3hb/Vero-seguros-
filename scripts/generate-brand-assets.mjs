import fs from 'node:fs'

const VIEWBOX = '0 0 225 100'
const PATHS = [
  'M5 0 L24 0 L53 83 L82 0 L91 0 L56 100 L40 100 Z',
  'M0 0 H29 V4.5 H0 Z',
  'M78 0 H93 V4.5 H78 Z',
  'M97 0 L127 0 L163 100 L149 100 L113 0 L113 100 L97 100 Z',
  'M196 0 L220 0 L220 100 L204 100 L204 0 L171 100 L163 100 Z',
  'M92 0 H132 V4.5 H92 Z',
  'M191 0 H225 V4.5 H191 Z',
  'M92 95.5 H118 V100 H92 Z',
  'M199 95.5 H225 V100 H199 Z',
]
const NAVY = '#13315C'
const CREAM = '#F8EFE6'
const GOLD = '#BF9D5B'

const header = `<!--
  Monograma VM — Verónica Méndez
  Reconstruido a partir de la tarjeta de presentación: serif de alto contraste
  (tipo Didone), serifas planas y delgadas, altura de mayúscula = 100 unidades.
  La serifa del asta fina de la V toca la del asta izquierda de la M: ahí
  ocurre el entrelace. Generado desde src/lib/brand.ts — no editar a mano.
-->`

const body = (fill) =>
  `  <g fill="${fill}" fill-rule="nonzero">\n` +
  PATHS.map((d) => `    <path d="${d}" />`).join('\n') +
  `\n  </g>`

const mono = (fill, id, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" role="img" aria-labelledby="${id}">
  <title id="${id}">${title}</title>
${header}
${body(fill)}
</svg>
`

fs.writeFileSync(
  'public/brand/vm-monogram.svg',
  mono(NAVY, 'vm-title', 'Monograma VM — Verónica Méndez'),
)
fs.writeFileSync(
  'public/brand/vm-monogram-light.svg',
  mono(CREAM, 'vm-title-light', 'Monograma VM — Verónica Méndez (fondo oscuro)'),
)

// Favicon 64×64: cuadrado azul marino con el monograma en marfil.
const s = 52 / 225
const tx = (64 - 52) / 2
const ty = (64 - 100 * s) / 2
fs.writeFileSync(
  'public/brand/vm-favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="vm-favicon-title">
  <title id="vm-favicon-title">VM — Verónica Méndez</title>
  <rect width="64" height="64" rx="13" fill="${NAVY}" />
  <g transform="translate(${tx} ${ty.toFixed(2)}) scale(${s.toFixed(5)})" fill="${CREAM}" fill-rule="nonzero">
${PATHS.map((d) => `    <path d="${d}" />`).join('\n')}
  </g>
</svg>
`,
)

// Lockup vertical: monograma + nombre + descriptor + frase de marca.
const lockScale = 0.86
const lockW = 225 * lockScale
fs.writeFileSync(
  'public/brand/vm-lockup.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 306" role="img" aria-labelledby="vm-lockup-title">
  <title id="vm-lockup-title">Verónica Méndez — Agente de Seguros Certificada — Seguros con Sentido Humano</title>
  <!--
    Lockup vertical completo. El texto usa una pila serif/sans; dentro de la
    aplicación el mismo lockup se compone con Newsreader y Manrope
    (ver src/components/brand/Lockup.tsx).
  -->
  <g transform="translate(${((420 - lockW) / 2).toFixed(1)} 30) scale(${lockScale})" fill="${NAVY}" fill-rule="nonzero">
${PATHS.map((d) => `    <path d="${d}" />`).join('\n')}
  </g>
  <text x="210" y="180" text-anchor="middle" font-family="Newsreader, 'Libre Baskerville', Georgia, serif" font-size="33" letter-spacing="5" fill="${NAVY}">VERÓNICA</text>
  <text x="210" y="217" text-anchor="middle" font-family="Newsreader, 'Libre Baskerville', Georgia, serif" font-size="33" letter-spacing="5" fill="${NAVY}">MÉNDEZ</text>
  <line x1="116" y1="238" x2="304" y2="238" stroke="${GOLD}" stroke-width="1" />
  <text x="210" y="257" text-anchor="middle" font-family="Manrope, 'Helvetica Neue', Arial, sans-serif" font-size="10.5" letter-spacing="3.2" fill="#3C5578">AGENTE DE SEGUROS CERTIFICADA</text>
  <text x="210" y="288" text-anchor="middle" font-family="Newsreader, 'Libre Baskerville', Georgia, serif" font-style="italic" font-size="19" fill="${NAVY}">Seguros con Sentido Humano</text>
  <path d="M133 297 C 168 304, 252 304, 287 297" fill="none" stroke="${GOLD}" stroke-width="1.2" stroke-linecap="round" />
</svg>
`,
)
console.log('brand assets generados')
