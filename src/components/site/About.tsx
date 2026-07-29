import Image from 'next/image'

import { Monogram } from '@/components/brand/Monogram'
import { Reveal } from '@/components/motion/Reveal'
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

  return (
    <section
      id={SECTIONS.about}
      className={`section ${styles.section}`}
      aria-labelledby="sobre-titulo"
    >
      <div className={`container ruled ${styles.grid}`}>
        <Reveal className={styles.aside} y={24}>
          <figure className={`cropped ${styles.frame}`}>
            <CropMarks />
            {settings.aboutImageUrl ? (
              <div className={styles.photoWrap}>
                <Image
                  src={settings.aboutImageUrl}
                  alt={settings.aboutImageAlt ?? `${settings.brandName}, ${settings.brandRole}`}
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
        </Reveal>

        <div>
          <Reveal>
            <SectionEyebrow index="04" label="Trayectoria" />
            <h2 id="sobre-titulo" className={styles.title}>
              {settings.aboutTitle}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className={styles.intro}>{settings.aboutIntro}</p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className={styles.body}>
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <blockquote className={styles.quote}>
              <p className={styles.quoteText}>«{settings.aboutQuote}»</p>
              <footer className={styles.quoteAttribution}>
                {settings.brandName} — {settings.brandRole}
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
