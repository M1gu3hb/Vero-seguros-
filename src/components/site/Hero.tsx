import Image from 'next/image'

import { Monogram } from '@/components/brand/Monogram'
import { CropMarks } from '@/components/site/SectionHeading'
import { Trajectory } from '@/components/brand/Trajectory'
import { ParallaxMark } from '@/components/motion/ParallaxMark'
import { Reveal } from '@/components/motion/Reveal'
import { MailLink } from '@/components/site/MailLink'
import { SWASH_PATH } from '@/lib/brand'
import { SECTIONS } from '@/lib/site'
import type { SiteSettings } from '@/content/site-content'
import styles from './Hero.module.css'

type HeroProps = {
  settings: SiteSettings
  whatsappUrl: string | null
  mailtoUrl: string
  webmailUrl: string
}

export function Hero({ settings, whatsappUrl, mailtoUrl, webmailUrl }: HeroProps) {
  const hasPhoto = Boolean(settings.heroImageUrl)

  return (
    <section id={SECTIONS.hero} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.backdrop} aria-hidden="true">
        <ParallaxMark className={styles.watermark} />
        <Trajectory className={styles.curve} withEcho />
      </div>

      <div className={`container ruled ${styles.grid}`}>
        <div>
          <Reveal y={12}>
            <p className="eyebrow">{settings.heroEyebrow}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 id="hero-title" className={styles.title}>
              {settings.heroTitle}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className={styles.description}>{settings.heroDescription}</p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className={styles.ctas}>
              {whatsappUrl ? (
                <a
                  className="btn btn--primary"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {settings.heroPrimaryCta}
                  <span className="btn__arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              ) : null}
              <MailLink className="btn btn--secondary" href={mailtoUrl} webmailHref={webmailUrl}>
                {settings.heroSecondaryCta}
              </MailLink>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <p className={styles.coverage}>
              <span className={styles.coverageDot} aria-hidden="true" />
              {settings.coverageText}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.18} y={24}>
          <div className={`cropped ${styles.plate}`}>
            <CropMarks />
            {hasPhoto && settings.heroImageUrl ? (
              <div className={styles.photoFrame}>
                <Image
                  src={settings.heroImageUrl}
                  alt={settings.heroImageAlt ?? `${settings.brandName}, ${settings.brandRole}`}
                  fill
                  className={styles.photo}
                  sizes="(min-width: 64rem) 26rem, 90vw"
                  priority
                />
              </div>
            ) : (
              <Monogram className={styles.plateMark} height="3rem" />
            )}

            <p className={styles.plateName}>{settings.brandName}</p>
            <span className={styles.plateRules} aria-hidden="true">
              <span />
              <span />
            </span>
            <p className={styles.plateRole}>{settings.brandRole}</p>

            <p className={styles.plateTagline}>{settings.brandTagline}</p>

            <svg
              className={styles.plateSwash}
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d={SWASH_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </Reveal>
      </div>

      <span className={styles.scrollHint} aria-hidden="true">
        Desliza
        <span className={styles.scrollHintLine} />
      </span>
    </section>
  )
}
