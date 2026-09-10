import type { ReactNode } from 'react'
import type { Viewport } from 'next'
import RootComponent from '../components/layout/RootComponent'
import { Montserrat, Open_Sans as OpenSans, Roboto_Mono as RobotoMono } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat'
})
const openSans = OpenSans({
  subsets: ['latin'],
  variable: '--font-open-sans'
})
const robotoMono = RobotoMono({
  subsets: ['latin'],
  variable: '--font-roboto-mono'
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      style={{ colorScheme: 'dark' }}
      className={`${montserrat.variable} ${openSans.variable} ${robotoMono.variable}`}
    >
      <body className={openSans.className}>
        <RootComponent>{children}</RootComponent>
      </body>
    </html>
  )
}
