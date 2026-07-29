'use client'

import { useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { AccountPanel } from '@/components/admin/AccountPanel'
import { InsurersPanel } from '@/components/admin/InsurersPanel'
import { ServicesPanel } from '@/components/admin/ServicesPanel'
import {
  AboutPanel,
  HeroPanel,
  IdentityPanel,
  PromosPanel,
} from '@/components/admin/SettingsPanels'
import type { SiteContent } from '@/content/site-content'

const SECTIONS = [
  { id: 'identidad', label: 'Identidad y contacto' },
  { id: 'inicio', label: 'Inicio' },
  { id: 'seguros', label: 'Seguros' },
  { id: 'sobre', label: 'Sobre Verónica' },
  { id: 'aseguradoras', label: 'Aseguradoras' },
  { id: 'pagos', label: 'Promociones y pagos' },
  { id: 'cuenta', label: 'Tu cuenta' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export function AdminTabs({ content, email }: { content: SiteContent; email: string }) {
  const [active, setActive] = useState<SectionId>('identidad')

  return (
    <div className={`container ${styles.layout}`}>
      <nav className={styles.nav} aria-label="Secciones del administrador">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={styles.navButton}
            aria-current={active === section.id ? 'true' : undefined}
            onClick={() => setActive(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div>
        {active === 'identidad' ? <IdentityPanel settings={content.settings} /> : null}
        {active === 'inicio' ? <HeroPanel settings={content.settings} /> : null}
        {active === 'seguros' ? <ServicesPanel services={content.services} /> : null}
        {active === 'sobre' ? <AboutPanel settings={content.settings} /> : null}
        {active === 'aseguradoras' ? <InsurersPanel insurers={content.insurers} /> : null}
        {active === 'pagos' ? <PromosPanel settings={content.settings} /> : null}
        {active === 'cuenta' ? <AccountPanel email={email} /> : null}
      </div>
    </div>
  )
}
