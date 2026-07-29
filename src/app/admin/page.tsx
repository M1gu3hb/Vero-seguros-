import { redirect } from 'next/navigation'

import { signOut } from '@/actions/auth'
import { Monogram } from '@/components/brand/Monogram'
import { AdminTabs } from '@/components/admin/AdminTabs'
import { getAdminContent } from '@/lib/data'
import { createClient, getAdminUser } from '@/lib/supabase/server'
import styles from './admin.module.css'

/* El panel siempre refleja el estado real de la base de datos. */
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { user, isAdmin } = await getAdminUser()

  if (!user) redirect('/admin/login')

  if (!isAdmin) {
    return (
      <main className="container" style={{ paddingBlock: '5rem' }}>
        <h1>Sin permisos</h1>
        <p className={styles.panelHint}>
          La cuenta <strong>{user.email}</strong> no está autorizada para editar el sitio. Pide que
          se agregue tu usuario a la lista de administradores y vuelve a entrar.
        </p>
        <form action={signOut} style={{ marginBlockStart: '1.5rem' }}>
          <button type="submit" className="btn btn--primary">
            Cerrar sesión
          </button>
        </form>
      </main>
    )
  }

  const supabase = await createClient()
  const content = await getAdminContent(supabase)

  return (
    <>
      <header className={styles.topbar}>
        <div className={`container ${styles.topbarInner}`}>
          <div className={styles.topbarBrand}>
            <Monogram className={styles.topbarMark} height="1.15rem" />
            <span className={styles.topbarTitle}>Administrador</span>
          </div>

          <div className={styles.topbarActions}>
            <span className={styles.topbarUser}>{user.email}</span>
            <a className={styles.topbarLink} href="/" target="_blank" rel="noopener noreferrer">
              Ver el sitio
            </a>
            <form action={signOut}>
              <button type="submit" className={styles.signOut}>
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main>
        <AdminTabs content={content} email={user.email ?? ''} />
      </main>
    </>
  )
}
