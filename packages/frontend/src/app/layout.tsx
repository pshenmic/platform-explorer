import type { CSSProperties, ReactNode } from 'react'
import type { Viewport } from 'next'
import RootComponent from '../components/layout/RootComponent'
import { Montserrat, Open_Sans as OpenSans, Roboto_Mono as RobotoMono } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'] })
const openSans = OpenSans({ subsets: ['latin'] })
const robotoMono = RobotoMono({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false
}

interface RootLayoutProps {
  children: ReactNode
}

// Font instances are created without `variable:`, but the layout historically
// referenced `.variable` CSS class names (undefined → empty). Keep that behavior.
type FontVars = { variable?: string }

export default function RootLayout({ children }: RootLayoutProps) {
  const montserratVar = (montserrat as FontVars).variable ?? ''
  const robotoMonoVar = (robotoMono as FontVars).variable ?? ''
  const openSansVar = (openSans as FontVars).variable ?? ''

  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      style={
        {
          colorScheme: 'dark',
          ['--pe-font-heading' as string]: montserrat.style.fontFamily,
          ['--pe-font-body' as string]: openSans.style.fontFamily,
          ['--pe-font-mono' as string]: robotoMono.style.fontFamily
        } as CSSProperties
      }
      className={`${montserratVar} ${robotoMonoVar} ${openSansVar}`}
    >
      <body className={openSans.className}>
        <RootComponent>{children}</RootComponent>
      </body>
    </html>
  )
}
