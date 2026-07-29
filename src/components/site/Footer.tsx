import { Monogram } from '@/components/brand/Monogram'
import { Txt } from '@/components/content/Texts'
import type { SiteSettings } from '@/content/site-content'
import { NAV_LINKS } from '@/lib/site'
import styles from './Footer.module.css'

type FooterProps = {
  settings: SiteSettings
  year: number
}

export function Footer({ settings, year }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.colophon} aria-hidden="true">
          <span className={styles.colophonRule} />
          <Monogram className={styles.colophonMark} height="1.1rem" />
          <span className={styles.colophonRule} />
        </div>

        <div className={styles.top}>
          <div className={styles.brand}>
            <Monogram className={styles.mark} height="1.4rem" />
            <p className={styles.name}>
              <Txt k="identidad.nombre" />
            </p>
            <p className={styles.role}>
              <Txt k="identidad.cargo" />
            </p>
            <p className={styles.tagline}>
              <Txt k="identidad.frase" />
            </p>
          </div>

          <div className={styles.links}>
            <h2 className={styles.linkLabel}>
              <Txt k="pie.contacto" />
            </h2>
            <a className={styles.link} href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
            <p>
              <Txt k="identidad.cobertura" />
            </p>
          </div>

          <nav className={styles.links} aria-label="Navegación del pie de página">
            <h2 className={styles.linkLabel}>
              <Txt k="pie.secciones" />
            </h2>
            <div className={styles.nav}>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className={styles.navLink}>
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.note}>
            <Txt k="pie.nota" />
          </p>
          <p className={styles.copyright}>
            © {year} {settings.brandName}
          </p>
        </div>
      </div>
    </footer>
  )
}
