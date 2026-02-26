import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'TTD software - Your Trusted eCommerce Destination',
    template: '%s | TTD software',
  },
  description: 'Shop electronics, fashion, home essentials and more with fast delivery across India. Best prices, secure payments, and easy returns.',
  keywords: ['ecommerce', 'online shopping', 'india', 'electronics', 'fashion', 'home', 'upi', 'cod'],
  authors: [{ name: 'TTD software' }],
  creator: 'TTD software',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ttdsoftware.com',
    siteName: 'TTD software',
    title: 'TTD software - Your Trusted eCommerce Destination',
    description: 'Shop electronics, fashion, home essentials and more with fast delivery across India.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TTD software - Your Trusted eCommerce Destination',
    description: 'Shop electronics, fashion, home essentials and more with fast delivery across India.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
