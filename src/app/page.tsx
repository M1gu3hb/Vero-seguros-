import { ReadingProgress } from '@/components/motion/ReadingProgress'
import { About } from '@/components/site/About'
import { Closing } from '@/components/site/Closing'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { Hero } from '@/components/site/Hero'
import { HumanSense } from '@/components/site/HumanSense'
import { Insurers } from '@/components/site/Insurers'
import { Payments } from '@/components/site/Payments'
import { Process } from '@/components/site/Process'
import { Services } from '@/components/site/Services'
import { StructuredData } from '@/components/site/StructuredData'
import {
  DEFAULT_MAIL_SUBJECT,
  buildMailtoUrl,
  buildWebmailUrl,
  buildWhatsAppUrl,
} from '@/lib/contact'
import { getPublicContent } from '@/lib/data'

export const revalidate = 300

export default async function HomePage() {
  const { settings, services, insurers } = await getPublicContent()

  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessage)
  /* El mismo texto que ya lleva el botón de WhatsApp, para que quien escriba
     por correo no se enfrente a una hoja en blanco. Se edita desde el CMS. */
  const mailtoUrl = buildMailtoUrl(
    settings.contactEmail,
    DEFAULT_MAIL_SUBJECT,
    settings.whatsappMessage,
  )
  const webmailUrl = buildWebmailUrl(
    settings.contactEmail,
    DEFAULT_MAIL_SUBJECT,
    settings.whatsappMessage,
  )

  return (
    <>
      <StructuredData settings={settings} services={services} />

      <ReadingProgress />

      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>

      <Header
        brandName={settings.brandName}
        brandRole={settings.brandRole}
        brandTagline={settings.brandTagline}
        contactEmail={settings.contactEmail}
        contactHref={whatsappUrl ?? mailtoUrl}
        contactLabel="Ponte en contacto"
      />

      <main id="contenido">
        <Hero
          settings={settings}
          whatsappUrl={whatsappUrl}
          mailtoUrl={mailtoUrl}
          webmailUrl={webmailUrl}
        />
        <Services services={services} />
        <HumanSense />
        <Process />
        <About settings={settings} />
        <Insurers insurers={insurers} />
        <Payments settings={settings} />
        <Closing
          settings={settings}
          whatsappUrl={whatsappUrl}
          mailtoUrl={mailtoUrl}
          webmailUrl={webmailUrl}
        />
      </main>

      <Footer settings={settings} year={new Date().getFullYear()} />
    </>
  )
}
