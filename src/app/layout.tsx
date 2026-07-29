import type { Metadata, Viewport } from 'next'
import { Manrope, Newsreader } from 'next/font/google'

import { SITE_URL } from '@/lib/site'
import './globals.css'

/* Serif editorial para titulares y para la frase de marca (en cursiva, como
   en la tarjeta). Sans humanista para interfaz y textos largos. Dos familias,
   ninguna más. */
const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
})

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
})

const description =
  'Verónica Méndez, Agente de Seguros Certificada. Asesoría personalizada en seguros de vida, gastos médicos mayores, auto, camión, responsabilidad civil, hogar, gastos funerarios y membresías de salud. Atención a nivel nacional desde 2018.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Verónica Méndez | Seguros con Sentido Humano',
    template: '%s | Verónica Méndez',
  },
  description,
  applicationName: 'Verónica Méndez — Seguros con Sentido Humano',
  authors: [{ name: 'Verónica Méndez' }],
  creator: 'Verónica Méndez',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: '/',
    siteName: 'Verónica Méndez — Seguros con Sentido Humano',
    title: 'Verónica Méndez | Seguros con Sentido Humano',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verónica Méndez | Seguros con Sentido Humano',
    description,
  },
  icons: {
    icon: [{ url: '/brand/vm-favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/vm-favicon.svg' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#13315C',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${newsreader.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  )
}
