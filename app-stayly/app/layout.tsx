import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Stayly Console',
  description: 'Operational console for Stayly homestay & hotel network'
}

/**
 * RootLayout renders the shared HTML skeleton and providers for every surface.
 */
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='light' style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
