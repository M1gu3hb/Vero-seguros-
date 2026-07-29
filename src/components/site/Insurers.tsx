/* eslint-disable @next/next/no-img-element */
import { Reveal } from '@/components/motion/Reveal'
import { insurersSection, type Insurer } from '@/content/site-content'
import { SECTIONS } from '@/lib/site'
import styles from './Insurers.module.css'

type InsurersProps = {
  insurers: Insurer[]
}

function InsurerMark({ insurer }: { insurer: Insurer }) {
  if (insurer.imageUrl) {
    /* Logotipo opcional cargado desde el CMS. Se usa <img> porque las marcas
       tienen proporciones muy distintas y aquí sólo interesa la altura. */
    return (
      <img
        src={insurer.imageUrl}
        alt={insurer.imageAlt ?? insurer.name}
        className={styles.logo}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return <span className={styles.name}>{insurer.name}</span>
}

/**
 * Aseguradoras con las que trabaja.
 *
 * Se presentan por su nombre, en tipografía, sin logotipos descargados sin
 * autorización. La cinta avanza muy despacio, se detiene al pasar el cursor o
 * al recibir foco, y desaparece por completo si el sistema pide movimiento
 * reducido (en su lugar se muestra la lista estática).
 */
export function Insurers({ insurers }: InsurersProps) {
  if (insurers.length === 0) return null

  return (
    <section
      id={SECTIONS.insurers}
      className={`section ${styles.section}`}
      aria-labelledby="aseguradoras-titulo"
    >
      <div className="container">
        <div className={styles.head}>
          <Reveal>
            <p className="eyebrow">{insurersSection.eyebrow}</p>
            <h2 id="aseguradoras-titulo" className={styles.title}>
              {insurersSection.title}
            </h2>
          </Reveal>
        </div>
      </div>

      <Reveal y={12}>
        {/* Lista real y accesible: el lector de pantalla lee ésta una sola vez */}
        <div className={styles.marquee}>
          <ul className={styles.marqueeTrack}>
            {insurers.map((insurer) => (
              <li key={insurer.id}>
                <InsurerMark insurer={insurer} />
              </li>
            ))}
          </ul>
          {/* Copia puramente visual para que la cinta no tenga huecos */}
          <ul className={styles.marqueeTrack} aria-hidden="true">
            {insurers.map((insurer) => (
              <li key={`echo-${insurer.id}`}>
                <InsurerMark insurer={insurer} />
              </li>
            ))}
          </ul>
        </div>

        <div className="container">
          <ul className={styles.staticList}>
            {insurers.map((insurer) => (
              <li key={`static-${insurer.id}`}>
                <InsurerMark insurer={insurer} />
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <div className="container">
        <Reveal delay={0.1}>
          <p className={styles.note}>{insurersSection.note}</p>
        </Reveal>
      </div>
    </section>
  )
}
