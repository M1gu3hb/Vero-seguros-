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
    /*
     * Logotipo oficial de la marca. Se usa <img> y no next/image porque los
     * archivos incluidos son SVG —que next/image no optimiza— y porque aquí
     * sólo interesa fijar la altura y dejar que el ancho se acomode.
     */
    return (
      <img
        src={insurer.imageUrl}
        alt={insurer.imageAlt ?? insurer.name}
        className={styles.logo}
        /*
         * Sin carga diferida a propósito: dentro de una cinta desplazada con
         * `transform` hay logotipos que nunca entran en la ventana visible y
         * `loading="lazy"` los dejaría sin cargar. Son SVG de unos pocos KB.
         */
        decoding="async"
      />
    )
  }

  return <span className={styles.name}>{insurer.name}</span>
}

/**
 * Aseguradoras con las que trabaja.
 *
 * Se muestran con su logotipo oficial, separadas por reglas finas como en la
 * tarjeta de presentación. Si una marca no tiene logotipo cargado, aparece su
 * nombre en tipografía.
 *
 * La cinta avanza muy despacio, se detiene al pasar el cursor o al recibir
 * foco, y desaparece por completo si el sistema pide movimiento reducido: en
 * ese caso se muestra la lista estática.
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
        <div className={styles.marquee}>
          {/* Lista real y accesible: el lector de pantalla lee ésta una sola vez */}
          <ul className={styles.marqueeTrack}>
            {insurers.map((insurer) => (
              <li key={insurer.id} className={styles.item}>
                <InsurerMark insurer={insurer} />
              </li>
            ))}
          </ul>
          {/* Copia puramente visual para que la cinta no tenga huecos */}
          <ul className={styles.marqueeTrack} aria-hidden="true">
            {insurers.map((insurer) => (
              <li key={`echo-${insurer.id}`} className={styles.item}>
                <InsurerMark insurer={insurer} />
              </li>
            ))}
          </ul>
        </div>

        <div className="container">
          <ul className={styles.staticList}>
            {insurers.map((insurer) => (
              <li key={`static-${insurer.id}`} className={styles.item}>
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
