import { CoilLine } from '@/components/motion/CoilLine'
import { Reveal } from '@/components/motion/Reveal'
import { SectionEyebrow } from '@/components/site/SectionHeading'
import { ServiceList } from '@/components/site/ServiceList'
import { Txt } from '@/components/content/Texts'
import type { Service } from '@/content/site-content'
import { SECTIONS } from '@/lib/site'
import styles from './Services.module.css'

type ServicesProps = {
  services: Service[]
}

/**
 * Los seguros disponibles.
 *
 * Composición deliberadamente asimétrica: los dos primeros ramos reciben
 * tratamiento destacado y el resto se lee como un índice editorial. Así hay
 * jerarquía y ritmo en lugar de ocho tarjetas idénticas, y el diseño sigue
 * funcionando si Verónica agrega, quita o reordena servicios.
 *
 * Cada ramo se abre para leer qué cubre ese tipo de seguro. Por detrás de
 * todos ellos, la línea de la marca cruza la sección de lado a lado y se
 * enrolla: es lo que sugiere que la lista continúa más abajo.
 */
export function Services({ services }: ServicesProps) {
  if (services.length === 0) return null

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
            <SectionEyebrow index="01" label={<Txt k="seguros.etiqueta" />} />
            <h2 id="servicios-titulo" className={styles.title}>
              <Txt k="seguros.titulo" />
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.headText}><Txt k="seguros.descripcion" /></p>
          </Reveal>
        </div>

        <ServiceList services={services} />
      </div>
    </section>
  )
}
