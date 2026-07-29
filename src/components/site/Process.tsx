import { DrawnPath } from '@/components/motion/DrawnPath'
import { Reveal } from '@/components/motion/Reveal'
import { SectionEyebrow } from '@/components/site/SectionHeading'
import { processSection } from '@/content/site-content'
import { SECTIONS } from '@/lib/site'
import styles from './Process.module.css'

/**
 * Los tres pasos del acompañamiento.
 *
 * Se apoyan en la misma curva de la marca —trazada al entrar en pantalla— en
 * lugar de un diagrama de flechas corporativo.
 */
export function Process() {
  return (
    <section
      id={SECTIONS.process}
      className={`section ${styles.section}`}
      aria-labelledby="proceso-titulo"
    >
      <div className="container ruled">
        <Reveal>
          <div className={styles.head}>
            <SectionEyebrow index="03" label={processSection.eyebrow} />
            <h2 id="proceso-titulo" className={styles.title}>
              {processSection.title}
            </h2>
          </div>
        </Reveal>

        <div className={styles.track}>
          <DrawnPath
            className={`${styles.line} ${styles.lineHorizontal}`}
            viewBox="0 0 1200 52"
            preserveAspectRatio="none"
            d="M0 46 C 150 4, 250 4, 400 30 C 550 56, 650 56, 800 26 C 950 -4, 1050 -4, 1200 30"
          />
          <DrawnPath
            className={`${styles.line} ${styles.lineVertical}`}
            viewBox="0 0 32 400"
            preserveAspectRatio="none"
            d="M16 0 C 2 90, 30 150, 16 200 C 2 250, 30 310, 16 400"
          />

          <ol className={styles.steps}>
            {processSection.steps.map((step, index) => (
              <Reveal
                as="li"
                key={step.title}
                className={styles.step}
                delay={Math.min(index * 0.12, 0.3)}
              >
                <span className={styles.marker} aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
