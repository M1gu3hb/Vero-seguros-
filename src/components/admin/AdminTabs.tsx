'use client'

import { useState } from 'react'

import styles from '@/app/admin/admin.module.css'
import { AccountPanel } from '@/components/admin/AccountPanel'
import { InsurersPanel } from '@/components/admin/InsurersPanel'
import { SectionPanel } from '@/components/admin/SectionPanel'
import { ServicesPanel } from '@/components/admin/ServicesPanel'
import {
  AboutImagePanel,
  ContactPanel,
  HeroImagePanel,
  PaymentTermsPanel,
} from '@/components/admin/SettingsPanels'
import { About } from '@/components/site/About'
import { Closing } from '@/components/site/Closing'
import { Footer } from '@/components/site/Footer'
import { Hero } from '@/components/site/Hero'
import { HumanSense } from '@/components/site/HumanSense'
import { Insurers } from '@/components/site/Insurers'
import { Payments } from '@/components/site/Payments'
import { Process } from '@/components/site/Process'
import { Services } from '@/components/site/Services'
import { buildTexts, settingsWithDraft } from '@/content/texts'
import type { SiteContent } from '@/content/site-content'

const SECTIONS = [
  { id: 'identidad', label: 'Identidad y contacto' },
  { id: 'inicio', label: 'Inicio' },
  { id: 'seguros', label: 'Seguros' },
  { id: 'humano', label: 'Sentido humano' },
  { id: 'proceso', label: 'Cómo trabajamos' },
  { id: 'sobre', label: 'Sobre Verónica' },
  { id: 'aseguradoras', label: 'Aseguradoras' },
  { id: 'pagos', label: 'Formas de pago' },
  { id: 'cierre', label: 'Cierre y pie' },
  { id: 'cuenta', label: 'Tu cuenta' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export function AdminTabs({ content, email }: { content: SiteContent; email: string }) {
  const [active, setActive] = useState<SectionId>('identidad')
  const { settings, services, insurers } = content
  const texts = buildTexts(settings, content.texts)

  /*
   * Cada vista previa pinta la sección de verdad con el borrador aplicado. Los
   * enlaces se dejan vacíos a propósito: es una vista, no una página navegable.
   */
  const conBorrador = (draft: Record<string, string>) => settingsWithDraft(settings, draft)

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

      <div className={styles.panels}>
        {active === 'identidad' ? (
          <>
            <ContactPanel settings={settings} />
            <SectionPanel
              group="identidad"
              title="Identidad"
              hint="Tu nombre, tu cargo y la frase de marca. Aparecen en el encabezado, en la tarjeta de presentación, en el cierre y en el pie."
              texts={texts}
              preview={(draft) => <Footer settings={conBorrador(draft)} year={new Date().getFullYear()} />}
            />
          </>
        ) : null}

        {active === 'inicio' ? (
          <>
            <SectionPanel
              group="inicio"
              title="Inicio"
              hint="Lo primero que se ve al entrar."
              texts={texts}
              preview={(draft) => (
                <Hero
                  settings={conBorrador(draft)}
                  whatsappUrl="#"
                  mailtoUrl="#"
                  webmailUrl="#"
                />
              )}
            />
            <HeroImagePanel settings={settings} />
          </>
        ) : null}

        {active === 'seguros' ? (
          <>
            <ServicesPanel services={services} />
            <SectionPanel
              group="seguros"
              title="Textos de la sección"
              hint="El encabezado de «Seguros» y los avisos que abren y cierran cada ramo."
              texts={texts}
              preview={() => <Services services={services} />}
            />
          </>
        ) : null}

        {active === 'humano' ? (
          <SectionPanel
            group="humano"
            title="Sentido humano"
            hint="Los cinco puntos que distinguen tu forma de acompañar. Se pueden reescribir, pero no quitar: el diseño de la sección se apoya en que sean cinco."
            texts={texts}
            preview={() => <HumanSense />}
          />
        ) : null}

        {active === 'proceso' ? (
          <SectionPanel
            group="proceso"
            title="Cómo trabajamos"
            hint="Los tres pasos del acompañamiento. Igual que arriba: se reescriben, pero siguen siendo tres."
            texts={texts}
            preview={() => <Process />}
          />
        ) : null}

        {active === 'sobre' ? (
          <>
            <SectionPanel
              group="sobre"
              title="Sobre Verónica"
              hint="Tu historia. Separa los párrafos dejando una línea en blanco entre uno y otro."
              texts={texts}
              preview={(draft) => <About settings={conBorrador(draft)} />}
            />
            <AboutImagePanel settings={settings} />
          </>
        ) : null}

        {active === 'aseguradoras' ? (
          <>
            <InsurersPanel insurers={insurers} />
            <SectionPanel
              group="aseguradoras"
              title="Textos de la sección"
              hint="El encabezado de la cinta de aseguradoras y su nota de disponibilidad."
              texts={texts}
              preview={() => <Insurers insurers={insurers} />}
            />
          </>
        ) : null}

        {active === 'pagos' ? (
          <>
            <SectionPanel
              group="pagos"
              title="Formas de pago"
              hint="El encabezado, la descripción y los rótulos de las dos listas."
              texts={texts}
              preview={(draft) => <Payments settings={conBorrador(draft)} />}
            />
            <PaymentTermsPanel settings={settings} />
          </>
        ) : null}

        {active === 'cierre' ? (
          <SectionPanel
            group="cierre"
            title="Cierre y pie"
            hint="La última llamada de la página y la letra pequeña del pie."
            texts={texts}
            preview={(draft) => (
              <>
                <Closing
                  settings={conBorrador(draft)}
                  whatsappUrl="#"
                  mailtoUrl="#"
                  webmailUrl="#"
                />
                <Footer settings={conBorrador(draft)} year={new Date().getFullYear()} />
              </>
            )}
          />
        ) : null}

        {active === 'cuenta' ? <AccountPanel email={email} /> : null}
      </div>
    </div>
  )
}
