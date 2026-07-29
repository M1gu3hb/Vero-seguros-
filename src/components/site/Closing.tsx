import { Monogram } from '@/components/brand/Monogram'
import { Trajectory } from '@/components/brand/Trajectory'
import { Reveal } from '@/components/motion/Reveal'
import { MailLink } from '@/components/site/MailLink'
import { SectionEyebrow } from '@/components/site/SectionHeading'
import { closingSection, type SiteSettings } from '@/content/site-content'
import { SECTIONS } from '@/lib/site'
import styles from './Closing.module.css'

type ClosingProps = {
  settings: SiteSettings
  whatsappUrl: string | null
  mailtoUrl: string
  webmailUrl: string
}

/** Cierre y contacto. Sin formulario y sin captura de datos personales. */
export function Closing({ settings, whatsappUrl, mailtoUrl, webmailUrl }: ClosingProps) {
  return (
    <section
      id={SECTIONS.contact}
      className={`section ${styles.section}`}
      aria-labelledby="contacto-titulo"
    >
      <Trajectory className={styles.curve} />
      <div className={styles.watermark} aria-hidden="true">
        <Monogram fluid />
      </div>

      <div className={`container ruled ruled--on-navy ${styles.inner}`}>
        <Reveal>
          <SectionEyebrow index="07" label={closingSection.eyebrow} onNavy />
          <h2 id="contacto-titulo" className={styles.title}>
            {closingSection.title}
          </h2>
          <p className={styles.description}>{closingSection.description}</p>
        </Reveal>

        <Reveal delay={0.1} className={styles.actions}>
          <div className={styles.buttons}>
            {whatsappUrl ? (
              <a
                className="btn btn--on-navy"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Platiquemos por WhatsApp
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            ) : null}
            <MailLink
              className="btn btn--ghost-on-navy"
              href={mailtoUrl}
              webmailHref={webmailUrl}
            >
              Quiero recibir orientación
            </MailLink>
          </div>

          <dl className={styles.contactList}>
            <div className={styles.contactRow}>
              <dt className={styles.contactLabel}>Correo</dt>
              <dd>
                <a className={styles.contactValue} href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>
              </dd>
            </div>
            <div className={styles.contactRow}>
              <dt className={styles.contactLabel}>Cobertura</dt>
              <dd className={styles.contactValue}>{settings.coverageText}</dd>
            </div>
          </dl>

          <p className={styles.signature}>
            <Monogram className={styles.signatureMark} height="1.5rem" />
            <span className={styles.signatureText}>{settings.brandTagline}</span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
