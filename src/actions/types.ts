/** Resultado uniforme de todas las Server Actions del administrador. */
export type ActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  /** Errores por campo, para mostrarlos junto a cada control. */
  errors?: Record<string, string[]>
  /** Cambia en cada respuesta para que la interfaz sepa que hay una nueva. */
  at?: number
}

export const idleState: ActionState = { status: 'idle' }

export function successState(message: string): ActionState {
  return { status: 'success', message, at: Date.now() }
}

export function errorState(message: string, errors?: Record<string, string[]>): ActionState {
  return { status: 'error', message, errors, at: Date.now() }
}
