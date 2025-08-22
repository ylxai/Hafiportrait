import type { Metadata } from 'next'
import { Bilbo_Swash_Caps, Fleur_De_Leah, Edu_TAS_Beginner } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

// Configure Google Fonts
const bilboSwashCaps = Bilbo_Swash_Caps({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bilbo-swash-caps'
})

const fleurDeLeah = Fleur_De_Leah({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fleur-de-leah'
})

const eduTasBeginner = Edu_TAS_Beginner({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-edu-tas-beginner'
})
import '@/styles/heart-animations.css'
import '@/styles/color-palette.css'
import '@/styles/hero-enhancements.css'
// Removed Vercel SpeedInsights and Analytics for VPS production
// import { SpeedInsights } from '@vercel/speed-insights/next'
// import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'Hafi Portrait - Photo Sharing untuk Event',
  description: 'Platform berbagi foto untuk event dan acara spesial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${bilboSwashCaps.variable} ${fleurDeLeah.variable} ${eduTasBeginner.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Chrome extension errors
              window.addEventListener('error', function(e) {
                if (e.filename && (e.filename.includes('contentScript.js') || e.filename.includes('injected.js'))) {
                  e.preventDefault();
                  return false;
                }
              });
              
              // Suppress unhandled promise rejections from extensions
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.stack && (e.reason.stack.includes('contentScript') || e.reason.stack.includes('injected'))) {
                  e.preventDefault();
                  return false;
                }
              });
            `
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        {/* Vercel instrumentation removed for VPS */}
      </body>
    </html>
  )
} 