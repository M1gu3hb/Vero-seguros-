import type { Service, SiteSettings } from '@/content/site-content'
import { SITE_URL } from '@/lib/site'

type StructuredDataProps = {
  settings: SiteSettings
  services: Service[]
}

/**
 * Datos estructurados.
 *
 * Sólo se declara lo que Verónica confirmó: nombre, cargo, correo, cobertura
 * nacional y los ramos que ofrece. Sin dirección física, precios,
 * valoraciones, teléfono público ni redes sociales.
 */
export function StructuredData({ settings, services }: StructuredDataProps) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#veronica`,
        name: settings.brandName,
        jobTitle: settings.brandRole,
        email: `mailto:${settings.contactEmail}`,
        url: SITE_URL,
        knowsLanguage: 'es-MX',
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#servicio`,
        name: `${settings.brandName} — ${settings.brandTagline}`,
        description: settings.heroDescription,
        url: SITE_URL,
        email: `mailto:${settings.contactEmail}`,
        slogan: settings.brandTagline,
        areaServed: { '@type': 'Country', name: 'México' },
        provider: { '@id': `${SITE_URL}/#veronica` },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Seguros',
          itemListElement: services.map((service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.name,
              description: service.description,
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#sitio`,
        url: SITE_URL,
        name: `${settings.brandName} | ${settings.brandTagline}`,
        inLanguage: 'es-MX',
        publisher: { '@id': `${SITE_URL}/#veronica` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      // El contenido es JSON generado por nosotros; se escapa `<` para evitar
      // que un texto del CMS pueda cerrar la etiqueta.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
