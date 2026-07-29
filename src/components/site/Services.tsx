import { CoilLine } from '@/components/motion/CoilLine'
import { Reveal } from '@/components/motion/Reveal'
import { SectionEyebrow } from '@/components/site/SectionHeading'
import { FeaturedService, ServiceRow } from '@/components/site/ServiceItem'
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
 *
 * Cada ramo se puede abrir para leer qué cubre ese tipo de seguro. De fondo,
 * la línea de la marca baja en diagonal y se enrolla: es lo que sugiere que
 * la lista continúa más abajo.
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
      <CoilLine className={styles.coil} />

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
              <FeaturedService key={service.id} service={service} index={formatIndex(index)} />
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
                <ServiceRow service={service} index={formatIndex(index + featured.length)} />
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
