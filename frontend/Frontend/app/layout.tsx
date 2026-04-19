import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CrowdShield AI — Gujarat Pilgrimage Corridor Safety System',
  description: 'Real-time crowd safety monitoring and emergency operations dashboard for Gujarat pilgrimage corridors.',
}

export const viewport = {
  themeColor: '#0A0E1A',
}

import { LanguageProvider } from "@/contexts/LanguageContext"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#0A0E1A]">
      <body className={`${inter.variable} font-sans antialiased bg-[#0A0E1A] text-[#E8EEFF] overflow-x-hidden`}>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  )
}
