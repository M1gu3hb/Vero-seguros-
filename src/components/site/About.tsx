import Image from 'next/image'

import { Monogram } from '@/components/brand/Monogram'
import { Reveal } from '@/components/motion/Reveal'
import { Tilt } from '@/components/motion/Tilt'
import { Typed } from '@/components/motion/Typed'
import { PullQuote } from '@/components/site/PullQuote'
import { CropMarks, SectionEyebrow } from '@/components/site/SectionHeading'
import { SECTIONS } from '@/lib/site'
import type { SiteSettings } from '@/content/site-content'
import styles from './About.module.css'

type AboutProps = {
  settings: SiteSettings
}

/**
 * Sobre Verónica.
 *
 * La biografía se escribe sola al llegar a ella, párrafo por párrafo, y la
 * frase que la resume pasa —en pantallas anchas— justo debajo de la
 * fotografía, que era donde quedaba el hueco. En el HTML la cita sigue
 * después del texto, así que en un teléfono se lee en el orden natural: foto,
 * historia y, al final, la frase.
 *
 * Si todavía no hay una fotografía real, la columna visual se resuelve con
 * una composición tipográfica basada en el monograma: nunca con una persona
 * inventada.
 */
export function About({ settings }: AboutProps) {
  /*
   * Se acepta cualquier convención de salto de línea: el navegador envía los
   * `textarea` con CRLF, así que un texto guardado antes de normalizarlo en el
   * servidor puede traer `\r\n\r\n` en vez de `\n\n`.
   */
  const paragraphs = settings.aboutBody
    .split(/(?:\r\n?|\n)\s*(?:\r\n?|\n)/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const photoAlt = settings.aboutImageAlt ?? `${settings.brandName}, ${settings.brandRole}`

  return (
    <section
      id={SECTIONS.about}
      className={`section ${styles.section}`}
      aria-labelledby="sobre-titulo"
    >
      <div className={`container ruled ${styles.grid}`}>
        <Reveal className={styles.aside} y={24}>
          <Tilt className={styles.tilt}>
            <figure className={`cropped ${styles.frame}`}>
              <CropMarks />
              {settings.aboutImageUrl ? (
                <div className={styles.photoWrap}>
                  <Image
                    src={settings.aboutImageUrl}
                    alt={photoAlt}
                    fill
                    className={styles.photo}
                    sizes="(min-width: 64rem) 26rem, 90vw"
                  />
                </div>
              ) : (
                <div className={styles.mark}>
                  <Monogram className={styles.markGlyph} height="3.5rem" />
                  <span className={styles.markRules} aria-hidden="true">
                    <span />
                    <span />
                  </span>
                  <p className={styles.markTagline}>{settings.brandTagline}</p>
                  <p className={styles.markSince}>Agente desde 2018</p>
                </div>
              )}
            </figure>
          </Tilt>
        </Reveal>

        <div className={styles.content}>
          <Reveal>
            <SectionEyebrow index="04" label="Trayectoria" />
            <h2 id="sobre-titulo" className={styles.title}>
              {settings.aboutTitle}
            </h2>
          </Reveal>

          {/*
            La introducción y la biografía se escriben de corrido, como un solo
            texto: empieza en la primera palabra y no para hasta la última.
          */}
          <Typed
            speed={48}
            bodyFrom={1}
            bodyClassName={styles.body}
            blocks={[
              { text: settings.aboutIntro, className: styles.intro },
              ...paragraphs.map((paragraph) => ({ text: paragraph })),
            ]}
          />
        </div>

        <div className={styles.quoteSlot}>
          <PullQuote
            text={settings.aboutQuote}
            attribution={`${settings.brandName} — ${settings.brandRole}`}
          />
        </div>
      </div>
    </section>
  )
}
