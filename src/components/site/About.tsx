import Image from 'next/image'

import { Monogram } from '@/components/brand/Monogram'
import { Reveal } from '@/components/motion/Reveal'
import { Tilt } from '@/components/motion/Tilt'
import { Txt } from '@/components/content/Texts'
import { Biografia } from '@/components/site/Biografia'
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
 * La biografía se escribe sola al llegar a ella y la frase que la resume
 * pasa —en pantallas anchas— justo debajo de la fotografía, que era donde
 * quedaba el hueco. En el HTML la cita sigue después del texto, así que en un
 * teléfono se lee en el orden natural: foto, historia y, al final, la frase.
 *
 * Si todavía no hay una fotografía real, la columna visual se resuelve con
 * una composición tipográfica basada en el monograma: nunca con una persona
 * inventada.
 */
export function About({ settings }: AboutProps) {
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
                  <p className={styles.markTagline}>
                    <Txt k="identidad.frase" />
                  </p>
                  <p className={styles.markSince}>
                    <Txt k="sobre.desde" />
                  </p>
                </div>
              )}
            </figure>
          </Tilt>
        </Reveal>

        <div className={styles.content}>
          <Reveal>
            <SectionEyebrow index="04" label={<Txt k="sobre.etiqueta" />} />
            <h2 id="sobre-titulo" className={styles.title}>
              <Txt k="sobre.titulo" />
            </h2>
          </Reveal>

          <Biografia introClassName={styles.intro} bodyClassName={styles.body} />
        </div>

        <div className={styles.quoteSlot}>
          <PullQuote />
        </div>
      </div>
    </section>
  )
}
