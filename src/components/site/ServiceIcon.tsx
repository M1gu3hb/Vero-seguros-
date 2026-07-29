type ServiceIconProps = {
  name: string
  className?: string
}

/**
 * Iconografía propia.
 *
 * Trazo fino sobre una retícula de 32, sin relleno. Todos los símbolos
 * comparten el mismo gesto —un arco que cubre algo— para que el conjunto se
 * lea como una familia y no como iconos sueltos de banco de imágenes.
 */
const PATHS: Record<string, React.ReactNode> = {
  vida: (
    <>
      <path d="M4 17c0-6.6 5.4-12 12-12s12 5.4 12 12" />
      <path d="M9 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      <circle cx="16" cy="25" r="2.6" />
    </>
  ),
  salud: (
    <>
      <path d="M4 15c0-6.1 5.4-11 12-11s12 4.9 12 11" />
      <path d="M16 14v12" />
      <path d="M10 20h12" />
    </>
  ),
  auto: (
    <>
      <path d="M3 21v-4.2l3-5.6C6.4 10.5 7.1 10 8 10h16c.9 0 1.6.5 2 1.2l3 5.6V21" />
      <path d="M3 21h26" />
      <path d="M6 16.8h20" />
      <circle cx="9" cy="23.5" r="2.6" />
      <circle cx="23" cy="23.5" r="2.6" />
    </>
  ),
  camion: (
    <>
      <path d="M2 8h16v14H2z" />
      <path d="M18 13h6l6 5v4h-12z" />
      <path d="M2 22h28" />
      <circle cx="8" cy="24" r="2.4" />
      <circle cx="24" cy="24" r="2.4" />
    </>
  ),
  responsabilidad: (
    <>
      <circle cx="12" cy="16" r="8" />
      <circle cx="22" cy="16" r="8" />
      <path d="M17 9.6a8 8 0 0 0 0 12.8" />
    </>
  ),
  hogar: (
    <>
      <path d="M3 15 16 4l13 11" />
      <path d="M6.5 17.5V28h19V17.5" />
      <path d="M13 28v-7h6v7" />
    </>
  ),
  funerarios: (
    <>
      <path d="M8 28V16a8 8 0 0 1 16 0v12" />
      <path d="M4 28h24" />
      <path d="M16 12v8" />
    </>
  ),
  membresia: (
    <>
      <rect x="3" y="7" width="26" height="18" rx="2.5" />
      <path d="M3 13h26" />
      <path d="M8 19h8" />
      <path d="M20 19h4" />
    </>
  ),
  proteccion: (
    <>
      <path d="M4 19c0-6.6 5.4-12 12-12s12 5.4 12 12" />
      <circle cx="16" cy="24" r="2.6" />
    </>
  ),
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  const glyph = PATHS[name] ?? PATHS.proteccion

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  )
}
