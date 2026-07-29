import type { Metadata } from 'next'
import Link from 'next/link'

import { Monogram } from '@/components/brand/Monogram'
import { LoginForm } from './LoginForm'
import styles from './login.module.css'

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
}

/*
 * Se genera en cada visita, no de antemano.
 *
 * Es lo que permite que la respuesta lleve su propia firma —el `nonce` de la
 * política de seguridad— y que sólo se ejecute el código firmado con ella. Una
 * página guardada de antemano llevaría siempre la misma, que es como no tener
 * ninguna.
 */
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}>
          <Monogram className={styles.mark} height="2rem" title="Verónica Méndez" />
          <h1 className={styles.title}>Administrador del sitio</h1>
          <p className={styles.subtitle}>
            Entra con tu correo y contraseña para editar el contenido de la página.
          </p>
        </div>

        <LoginForm />

        <Link className={styles.back} href="/">
          Volver al sitio
        </Link>
      </div>
    </main>
  )
}
