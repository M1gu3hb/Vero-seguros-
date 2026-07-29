'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { Monogram } from '@/components/brand/Monogram'
import { NAV_LINKS, SECTIONS } from '@/lib/site'
import styles from './Header.module.css'

type HeaderProps = {
  brandName: string
  brandRole: string
  brandTagline: string
  contactEmail: string
  contactHref: string
  contactLabel: string
}

const SECTION_IDS = Object.values(SECTIONS)

export function Header({
  brandName,
  brandRole,
  brandTagline,
  contactEmail,
  contactHref,
  contactLabel,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>(SECTIONS.hero)
  const panelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  /* El encabezado cambia de estado al separarse del inicio de la página. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Marca en la navegación la sección que se está leyendo. */
  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    )
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    toggleRef.current?.focus()
  }, [])

  /* Menú móvil: bloqueo de scroll, cierre con Escape y foco contenido. */
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables || focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      const toggle = toggleRef.current
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === toggle)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        toggle?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  /* Cierra el menú si la ventana pasa a tamaño de escritorio. */
  useEffect(() => {
    const query = window.matchMedia('(min-width: 62rem)')
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return (
    <header className={styles.header} data-scrolled={scrolled} data-open={open}>
      <div className={`container ${styles.inner}`}>
        <a
          href={`#${SECTIONS.hero}`}
          className={styles.brand}
          onClick={() => setOpen(false)}
          aria-label={`${brandName}, ${brandRole}. Ir al inicio`}
        >
          <Monogram height="1.375rem" className={styles.brandMark} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{brandName}</span>
            <span className={styles.brandRole}>{brandRole}</span>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Navegación principal">
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={styles.navLink}
                  data-active={activeSection === link.href.slice(1)}
                  aria-current={activeSection === link.href.slice(1) ? 'true' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a
            className="btn btn--primary"
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contactLabel}
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="visually-hidden">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          <span className={styles.toggleBar} aria-hidden="true" />
          <span className={styles.toggleBar} aria-hidden="true" />
          <span className={styles.toggleBar} aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <div
          id={panelId}
          ref={panelRef}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <nav aria-label="Navegación principal (móvil)">
            <ul className={styles.panelList}>
              {NAV_LINKS.map((link, index) => (
                <li key={link.href} className={styles.panelItem}>
                  <a href={link.href} className={styles.panelLink} onClick={close}>
                    <span className={styles.panelIndex} aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.panelFoot}>
            <p className={styles.panelTagline}>{brandTagline}</p>
            <a className={styles.panelEmail} href={`mailto:${contactEmail}`} onClick={close}>
              {contactEmail}
            </a>
            <a
              className="btn btn--primary"
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              {contactLabel}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
