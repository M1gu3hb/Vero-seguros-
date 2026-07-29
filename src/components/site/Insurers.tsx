/* eslint-disable @next/next/no-img-element */
import { Reveal } from '@/components/motion/Reveal'
import { SectionEyebrow } from '@/components/site/SectionHeading'
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
/** Ancho mínimo aproximado de cada celda, en píxeles (ver el módulo CSS). */
const CELL_WIDTH = 208
/** Ancho de pantalla más amplio que se contempla. */
const WIDEST_VIEWPORT = 1920

export function Insurers({ insurers }: InsurersProps) {
  if (insurers.length === 0) return null

  /*
   * La cinta avanza desplazando cada copia un 100 % de su propio ancho. Para
   * que no aparezca un hueco al final hacen falta suficientes copias como para
   * cubrir la pantalla incluso después de ese desplazamiento. Con muchas
   * aseguradoras basta con dos; con tres o cuatro hacen falta más.
   */
  const trackWidth = Math.max(1, insurers.length * CELL_WIDTH)
  const trackCount = Math.max(2, Math.ceil(WIDEST_VIEWPORT / trackWidth) + 1)

  return (
    <section
      id={SECTIONS.insurers}
      className={`section ${styles.section}`}
      aria-labelledby="aseguradoras-titulo"
    >
      <div className="container ruled">
        <div className={styles.head}>
          <Reveal>
            <SectionEyebrow index="05" label={insurersSection.eyebrow} />
            <h2 id="aseguradoras-titulo" className={styles.title}>
              {insurersSection.title}
            </h2>
          </Reveal>
        </div>
      </div>

      <Reveal y={12}>
        <div className={styles.marquee}>
          {Array.from({ length: trackCount }, (_, track) => (
            /*
             * Sólo la primera copia se anuncia: las demás son puramente
             * visuales y quedan ocultas para los lectores de pantalla.
             */
            <ul
              key={`track-${track}`}
              className={styles.marqueeTrack}
              aria-hidden={track > 0 || undefined}
            >
              {insurers.map((insurer) => (
                <li key={`${track}-${insurer.id}`} className={styles.item}>
                  <InsurerMark insurer={insurer} />
                </li>
              ))}
            </ul>
          ))}
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
