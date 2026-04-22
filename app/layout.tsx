import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:5000'),
  title: 'Maintenance EIS System - Predictive Maintenance Platform',
  description: 'Professional predictive maintenance platform for scanners and printers. Prevent failures, streamline repairs, and manage inventory efficiently.',
  generator: 'v0.app',
  openGraph: {
    title: 'Maintenance EIS System - Predictive Maintenance Platform',
    description: 'Professional predictive maintenance platform for scanners and printers.',
    images: ['/brand/eis-logo.jpg'],
  },
  twitter: {
    card: 'summary',
    title: 'Maintenance EIS System - Predictive Maintenance Platform',
    description: 'Professional predictive maintenance platform for scanners and printers.',
    images: ['/brand/eis-logo.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
