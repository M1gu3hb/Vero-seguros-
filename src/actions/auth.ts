'use server'

import { redirect } from 'next/navigation'

import { passwordChangeSchema } from '@/lib/schemas'
import { createClient, getAdminUser } from '@/lib/supabase/server'
import { type ActionState, errorState, successState } from './types'

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
