import { Reveal } from '@/components/motion/Reveal'
import { ServiceIcon } from '@/components/site/ServiceIcon'
import { SectionEyebrow } from '@/components/site/SectionHeading'
import { servicesSection, type Service } from '@/content/site-content'
import { SECTIONS } from '@/lib/site'
import styles from './Services.module.css'

type ServicesProps = {
  services: Service[]
}

const formatIndex = (index: number) => String(index + 1).padStart(2, '0')

/**
 * Los seguros disponibles.
 *
 * Composición deliberadamente asimétrica: los dos primeros ramos reciben
 * tratamiento destacado y el resto se lee como un índice editorial. Así hay
 * jerarquía y ritmo en lugar de ocho tarjetas idénticas, y el diseño sigue
 * funcionando si Verónica agrega, quita o reordena servicios.
 */
export function Services({ services }: ServicesProps) {
  if (services.length === 0) return null

  const featured = services.slice(0, 2)
  const rest = services.slice(2)

  return (
    <section
      id={SECTIONS.services}
      className={`section ${styles.section}`}
      aria-labelledby="servicios-titulo"
    >
      <div className="container ruled">
        <div className={styles.head}>
          <Reveal>
            <SectionEyebrow index="01" label={servicesSection.eyebrow} />
            <h2 id="servicios-titulo" className={styles.title}>
              {servicesSection.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.headText}>{servicesSection.description}</p>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <ul className={styles.features}>
            {featured.map((service, index) => (
              <li key={service.id} className={styles.feature}>
                <svg
                  className={styles.featureArc}
                  viewBox="0 0 400 56"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M0 54 C 90 6, 310 6, 400 54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <span className={styles.ghostIndex} aria-hidden="true">
                  {formatIndex(index)}
                </span>

                <div className={styles.featureTop}>
                  <span className={styles.medallion}>
                    <ServiceIcon name={service.icon} className={styles.icon} />
                  </span>
                  <span className={styles.index} aria-hidden="true">
                    {formatIndex(index)}
                  </span>
                </div>
                <h3 className={styles.featureName}>{service.name}</h3>
                <p className={styles.featureText}>{service.description}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        {rest.length > 0 ? (
          <ul className={styles.list}>
            {rest.map((service, index) => (
              <Reveal
                as="li"
                key={service.id}
                className={styles.row}
                delay={Math.min(index * 0.04, 0.24)}
                y={10}
              >
                <div className={styles.rowInner}>
                  <span className={`${styles.index} ${styles.rowIndex}`} aria-hidden="true">
                    {formatIndex(index + featured.length)}
                  </span>
                  <ServiceIcon name={service.icon} className={styles.rowIcon} />
                  <h3 className={styles.rowName}>{service.name}</h3>
                  <p className={styles.rowText}>{service.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
