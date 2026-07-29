import { TRAJECTORY_PATH } from '@/lib/brand'

type TrajectoryProps = {
  className?: string
  /** Repite la curva desplazada, como el hairline dorado de la tarjeta. */
  withEcho?: boolean
  echoColor?: string
}

/**
 * La curva continua de la tarjeta de presentación.
 *
 * Es el elemento gráfico recurrente del sitio: separa secciones, envuelve la
 * composición del hero y aparece como eco fino junto a los bloques. Puramente
 * decorativa.
 */
export function Trajectory({
  className,
  withEcho = false,
  echoColor = 'rgba(191, 157, 91, 0.55)',
}: TrajectoryProps) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {withEcho ? (
        <path
          d={TRAJECTORY_PATH}
          fill="none"
          stroke={echoColor}
          strokeWidth="1"
          transform="translate(0 9)"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      <path
        d={TRAJECTORY_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
