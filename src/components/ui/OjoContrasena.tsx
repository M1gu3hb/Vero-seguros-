'use client'

import { useState } from 'react'

/**
 * Ver la contraseña mientras se escribe.
 *
 * Una contraseña escrita a ciegas se equivoca, y equivocarse en el campo de
 * acceso no dice en qué: sólo que no entra. Poder mirar lo que se escribió
 * resuelve la mitad de los «no me deja entrar».
 *
 * El botón no envía el formulario (`type="button"`) y anuncia su estado con
 * `aria-pressed`, así que un lector de pantalla dice si la contraseña está a la
 * vista o tapada.
 */
export function useRevelado(): [boolean, () => void] {
  const [visible, setVisible] = useState(false)
  return [visible, () => setVisible((actual) => !actual)]
}

export function OjoContrasena({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="ojoClave"
      onClick={onToggle}
      aria-pressed={visible}
      aria-label={visible ? 'Ocultar la contraseña' : 'Ver la contraseña'}
      title={visible ? 'Ocultar la contraseña' : 'Ver la contraseña'}
      tabIndex={-1}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {/* El ojo, siempre: es lo que hace reconocible el control */}
        <path
          d="M2.4 12S6 5.6 12 5.6 21.6 12 21.6 12 18 18.4 12 18.4 2.4 12 2.4 12Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* La raya sólo aparece cuando la contraseña está a la vista: es la
            señal de «púlsame para volver a taparla». */}
        {visible ? (
          <path
            d="M4.2 19.8 19.8 4.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ) : null}
      </svg>
    </button>
  )
}
