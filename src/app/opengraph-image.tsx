import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

import { MONOGRAM_PATHS, MONOGRAM_VIEWBOX } from '@/lib/brand'
import { defaultSettings } from '@/content/site-content'

export const alt = 'Verónica Méndez — Agente de Seguros Certificada · Seguros con Sentido Humano'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const NAVY = '#13315C'
const CREAM = '#F8EFE6'
const GOLD = '#BF9D5B'

/** El monograma como imagen incrustada: el renderizador de OG no dibuja SVG en línea. */
const monogramDataUri = (() => {
  const paths = MONOGRAM_PATHS.map((d) => `<path d="${d}"/>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MONOGRAM_VIEWBOX}" fill="${CREAM}" fill-rule="nonzero">${paths}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
})()

export default async function OpengraphImage() {
  const serif = await readFile(path.join(process.cwd(), 'src/app/_og/Newsreader-Regular.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: NAVY,
          padding: '76px 88px',
          fontFamily: 'Newsreader',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={monogramDataUri} width={252} height={112} alt="" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 68,
              color: CREAM,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            {defaultSettings.brandName}
          </div>
          <div style={{ display: 'flex', width: 320, height: 1, background: GOLD, marginTop: 34 }} />
          <div
            style={{
              fontSize: 27,
              color: '#B8C6D8',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginTop: 26,
            }}
          >
            {defaultSettings.brandRole}
          </div>
          <div style={{ fontSize: 47, color: CREAM, marginTop: 30 }}>
            {defaultSettings.brandTagline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Newsreader', data: serif, style: 'normal', weight: 400 }],
    },
  )
}
