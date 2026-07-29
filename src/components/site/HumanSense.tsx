import { Monogram } from '@/components/brand/Monogram'
import { Trajectory } from '@/components/brand/Trajectory'
import { Reveal } from '@/components/motion/Reveal'
import { UnderlinedTitle } from '@/components/motion/UnderlinedTitle'
import { SectionEyebrow } from '@/components/site/SectionHeading'
import { Txt } from '@/components/content/Texts'
import { SECTIONS } from '@/lib/site'
import styles from './HumanSense.module.css'

/* Cinco puntos: es lo que sostiene el ritmo de la lista contra el título.
   Los textos se editan; la cantidad, no. */
const PILARES = [1, 2, 3, 4, 5] as const

/** El diferenciador de Verónica, contado con hechos y sin adjetivos de folleto. */
export function HumanSense() {
  return (
    <section
      id={SECTIONS.human}
      className={`section ${styles.section}`}
      aria-labelledby="humano-titulo"
    >
      <Trajectory className={styles.curve} />
      <div className={styles.watermark} aria-hidden="true">
        <Monogram fluid />
      </div>

      <div className={`container ruled ruled--on-navy ${styles.grid}`}>
        <div>
          <Reveal>
            <SectionEyebrow index="02" label={<Txt k="humano.etiqueta" />} onNavy />
          </Reveal>
          <UnderlinedTitle
            id="humano-titulo"
            textKey="humano.titulo"
            className={styles.title}
            maskClassName={styles.titleMask}
            wordClassName={styles.titleWord}
            ruleClassName={styles.titleRule}
          />
        </div>

        <ul className={styles.list}>
          {PILARES.map((pilar, index) => (
            <Reveal
              as="li"
              key={pilar}
              className={styles.item}
              delay={Math.min(index * 0.06, 0.3)}
              y={12}
            >
              <span className={styles.itemIndex} aria-hidden="true">
                {String(pilar).padStart(2, '0')}
              </span>
              <h3 className={styles.itemTitle}>
                <Txt k={`humano.pilar${pilar}.titulo`} />
              </h3>
              <p className={styles.itemText}>
                <Txt k={`humano.pilar${pilar}.texto`} />
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
