import { Monogram } from '@/components/brand/Monogram'
import { Trajectory } from '@/components/brand/Trajectory'
import { Reveal } from '@/components/motion/Reveal'
import { UnderlinedTitle } from '@/components/motion/UnderlinedTitle'
import { SectionEyebrow } from '@/components/site/SectionHeading'
import { humanSection } from '@/content/site-content'
import { SECTIONS } from '@/lib/site'
import styles from './HumanSense.module.css'

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
            <SectionEyebrow index="02" label={humanSection.eyebrow} onNavy />
          </Reveal>
          <UnderlinedTitle
            id="humano-titulo"
            text={humanSection.title}
            className={styles.title}
            maskClassName={styles.titleMask}
            wordClassName={styles.titleWord}
            ruleClassName={styles.titleRule}
          />
        </div>

        <ul className={styles.list}>
          {humanSection.pillars.map((pillar, index) => (
            <Reveal
              as="li"
              key={pillar.title}
              className={styles.item}
              delay={Math.min(index * 0.06, 0.3)}
              y={12}
            >
              <span className={styles.itemIndex} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.itemTitle}>{pillar.title}</h3>
              <p className={styles.itemText}>{pillar.description}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
