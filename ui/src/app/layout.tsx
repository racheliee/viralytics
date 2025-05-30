import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import '@viralytics/styles/globals.css'
import React from 'react'
import { ThemeProviders } from '@viralytics/components/Theme/ThemeProviders'
import { cookies } from 'next/headers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Viralytics',
  description: 'Instagram analytics and insights',
  icons: {
    icon: '/assets/favicon/favicon.ico'
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value
  const initialTheme = themeCookie === 'dark' ? 'dark' : 'light'
  const initialCookiePresent = themeCookie !== undefined

  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <ThemeProviders
            initialTheme={initialTheme}
            initialThemeCookiePresent={initialCookiePresent}
          >
            {children}
          </ThemeProviders>
        </div>
      </body>
    </html>
  )
}
