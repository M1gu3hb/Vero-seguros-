import { Trajectory } from '@/components/brand/Trajectory'
import { Reveal } from '@/components/motion/Reveal'
import { SECTIONS } from '@/lib/site'
import type { SiteSettings } from '@/content/site-content'
import styles from './Payments.module.css'

type PaymentsProps = {
  settings: SiteSettings
}

/* Modalidades tal como las describió Verónica. No se presentan como
   permanentes ni garantizadas: la nota de condiciones lo aclara. */
const INTEREST_FREE = ['3 meses', '6 meses', '12 meses']
const FREQUENCIES = ['Mensual', 'Trimestral', 'Semestral', 'Anual']

export function Payments({ settings }: PaymentsProps) {
  if (!settings.promosVisible) return null

  return (
    <section
      id={SECTIONS.payments}
      className={`section ${styles.section}`}
      aria-labelledby="pagos-titulo"
    >
      <div className="container">
        <Reveal>
          <div className={styles.panel}>
            <Trajectory className={styles.curve} />

            <div>
              <p className="eyebrow">Formas de pago</p>
              <h2 id="pagos-titulo" className={styles.title}>
                {settings.promosTitle}
              </h2>
              <p className={styles.description}>{settings.promosDescription}</p>
            </div>

            <div className={styles.terms}>
              <div className={styles.termGroup}>
                <h3 className={styles.termLabel}>Meses sin intereses en algunas aseguradoras</h3>
                <ul className={styles.chips}>
                  {INTEREST_FREE.map((term) => (
                    <li key={term} className={styles.chip}>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.termGroup}>
                <h3 className={styles.termLabel}>Modalidades de pago</h3>
                <ul className={styles.chips}>
                  {FREQUENCIES.map((term) => (
                    <li key={term} className={styles.chip}>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className={styles.note}>{settings.promosNote}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
