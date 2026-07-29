import { Trajectory } from '@/components/brand/Trajectory'
import { Txt } from '@/components/content/Texts'
import { Reveal } from '@/components/motion/Reveal'
import { CropMarks, SectionEyebrow } from '@/components/site/SectionHeading'
import { SECTIONS } from '@/lib/site'
import type { SiteSettings } from '@/content/site-content'
import styles from './Payments.module.css'

type PaymentsProps = {
  settings: SiteSettings
}

type TermGroupProps = {
  label: string
  terms: string[]
  /** Numeración interna, para el filete que precede al rótulo. */
  order: number
}

/**
 * Un grupo de plazos.
 *
 * Los términos no van encerrados en cápsulas: se leen como una secuencia
 * tipográfica separada por rombos dorados, igual que los datos del reverso de
 * la tarjeta. Así el bloque no parece un formulario, y da lo mismo que haya
 * dos elementos o diez: la fila se acomoda sola.
 */
function TermGroup({ label, terms, order }: TermGroupProps) {
  if (terms.length === 0) return null

  return (
    <div className={styles.termGroup}>
      <h3 className={styles.termLabel}>
        <span className={styles.termNumber} aria-hidden="true">
          {String(order).padStart(2, '0')}
        </span>
        {label}
      </h3>
      <ul className={styles.terms}>
        {terms.map((term) => (
          <li key={term} className={styles.term}>
            {term}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Formas de pago.
 *
 * Va pegada a las aseguradoras a propósito: antes quedaba un vacío tan largo
 * entre una sección y otra que parecía el final de la página.
 */
export function Payments({ settings }: PaymentsProps) {
  if (!settings.promosVisible) return null

  const hasTerms =
    settings.promosInstallments.length > 0 || settings.promosFrequencies.length > 0

  return (
    <section
      id={SECTIONS.payments}
      className={`section ${styles.section}`}
      aria-labelledby="pagos-titulo"
    >
      <div className="container">
        <Reveal>
          <div className={`cropped ${styles.panel}`}>
            <CropMarks />
            <Trajectory className={styles.curve} />

            <div className={styles.intro}>
              <SectionEyebrow index="06" label={<Txt k="pagos.etiqueta" />} />
              <h2 id="pagos-titulo" className={styles.title}>
                <Txt k="pagos.titulo" />
              </h2>
              <p className={styles.description}><Txt k="pagos.descripcion" /></p>
            </div>

            {hasTerms ? (
              <div className={styles.groups}>
                <TermGroup
                  order={1}
                  label={settings.promosInstallmentsLabel}
                  terms={settings.promosInstallments}
                />
                <TermGroup
                  order={2}
                  label={settings.promosFrequenciesLabel}
                  terms={settings.promosFrequencies}
                />
              </div>
            ) : null}

            <p className={styles.note}><Txt k="pagos.nota" /></p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
