import type { Metadata } from 'next'

import styles from './admin.module.css'

export const metadata: Metadata = {
  title: 'Administrador',
  // El panel nunca debe aparecer en buscadores.
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>{children}</div>
}
