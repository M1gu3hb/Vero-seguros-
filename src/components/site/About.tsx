import Image from 'next/image'

import { Monogram } from '@/components/brand/Monogram'
import { Reveal } from '@/components/motion/Reveal'
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
  const paragraphs = settings.aboutBody
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <section
      id={SECTIONS.about}
      className={`section ${styles.section}`}
      aria-labelledby="sobre-titulo"
    >
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.aside} y={24}>
          <figure className={styles.frame}>
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
                <span className={styles.markRule} aria-hidden="true" />
                <p className={styles.markTagline}>{settings.brandTagline}</p>
                <p className={styles.markSince}>Agente desde 2018</p>
              </div>
            )}
          </figure>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Trayectoria</p>
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
