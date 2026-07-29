'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { loginSchema, passwordChangeSchema } from '@/lib/schemas'
import { anotarFallo, intentoPermitido, olvidar } from '@/lib/throttle'
import { createClient, getAdminUser } from '@/lib/supabase/server'
import { type ActionState, errorState, successState } from './types'

/**
 * Desde dónde llega el intento.
 *
 * Detrás de un proxy la dirección real viaja en `x-forwarded-for`, y el primer
 * elemento es el cliente. Si no llega ninguna, todos los intentos comparten
 * cubo: es más estricto de la cuenta, pero nunca menos.
 */
async function origen(): Promise<string> {
  const cabeceras = await headers()
  const reenviada = cabeceras.get('x-forwarded-for')?.split(',')[0]?.trim()
  return reenviada || cabeceras.get('x-real-ip') || 'desconocido'
}

/**
 * Entrada al administrador.
 *
 * La contraseña se comprueba **en el servidor**, contra Supabase, y la sesión
 * se devuelve en cookies que el navegador no puede leer. Aquí no se compara
 * nada: si Supabase dice que no, no se entra.
 *
 * El mensaje de error es siempre el mismo, dé el fallo en el correo o en la
 * contraseña. Distinguirlos le diría a quien prueba cuáles de los correos que
 * tiene existen de verdad.
 */
export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const clave = await origen()

  const { permitido, segundos } = intentoPermitido(clave)
  if (!permitido) {
    return errorState(`Demasiados intentos. Espera ${segundos} segundos y vuelve a probar.`)
  }

  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  })

  if (!parsed.success) {
    anotarFallo(clave)
    return errorState(parsed.error.issues[0]?.message ?? 'Revisa los datos.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    anotarFallo(clave)
    return errorState('Correo o contraseña incorrectos.')
  }

  olvidar(clave)
  redirect('/admin')
}

/** Cierra la sesión de la administradora y vuelve al inicio de sesión. */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

/**
 * Cambio de contraseña de la administradora.
 *
 * Necesario porque el proyecto no tiene envío de correo configurado: sin esto
 * no habría forma de sustituir la contraseña inicial desde la aplicación.
 */
export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, isAdmin } = await getAdminUser()
  if (!user || !isAdmin) return errorState('Tu sesión ya no es válida. Vuelve a entrar.')

  const parsed = passwordChangeSchema.safeParse({
    password: String(formData.get('password') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  })

  if (!parsed.success) {
    const errors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      errors[key] = [...(errors[key] ?? []), issue.message]
    }
    return errorState('Revisa los campos marcados.', errors)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return errorState('No se pudo cambiar la contraseña. Inténtalo de nuevo.')
  }

  return successState('Contraseña actualizada.')
}
