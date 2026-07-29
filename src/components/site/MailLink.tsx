'use client'

import type { ReactNode } from 'react'

type MailLinkProps = {
  /** Enlace `mailto:` real. Es el `href`, así que funciona sin JavaScript. */
  href: string
  /** Ventana de redacción en el navegador, por si nada abre el `mailto:`. */
  webmailHref: string
  className?: string
  children: ReactNode
}

/** Margen para decidir que nadie atendió el enlace, en milisegundos. */
const GRACE = 1200

/**
 * Enlace de correo que siempre hace algo.
 *
 * En un teléfono, y en cualquier computadora con programa de correo, `mailto:`
 * abre la aplicación y aquí no pasa nada más. Pero en un navegador de
 * escritorio sin ningún gestor asociado —que es lo más común hoy— pulsar un
 * `mailto:` no produce ninguna reacción visible, y el botón parece roto.
 *
 * La comprobación es indirecta a propósito: si algo atendió el enlace, la
 * pestaña pierde el foco o queda oculta. Sólo cuando sigue visible y enfocada
 * al cabo de un momento se lleva a la redacción en el navegador, con la
 * dirección de Verónica ya puesta.
 *
 * El respaldo cambia la pestaña actual en lugar de abrir una nueva: una
 * ventana emergente lanzada desde un temporizador ya no cuenta como iniciada
 * por la persona y los navegadores la bloquean, con lo que el botón volvería
 * a no hacer nada. Quien haya pulsado «escríbeme por correo» espera acabar
 * escribiendo un correo, y siempre puede volver con el botón de atrás.
 */
export function MailLink({ href, webmailHref, className, children }: MailLinkProps) {
  function handleClick() {
    if (typeof window === 'undefined') return

    let handled = false
    const markHandled = () => {
      handled = true
    }

    document.addEventListener('visibilitychange', markHandled, { once: true })
    window.addEventListener('blur', markHandled, { once: true })
    window.addEventListener('pagehide', markHandled, { once: true })

    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', markHandled)
      window.removeEventListener('blur', markHandled)
      window.removeEventListener('pagehide', markHandled)

      if (handled || document.hidden || !document.hasFocus()) return
      window.location.href = webmailHref
    }, GRACE)
  }

  return (
    <a className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  )
}
