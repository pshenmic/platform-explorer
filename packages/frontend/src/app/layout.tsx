import type { ReactNode } from 'react'
import type { Viewport } from 'next'
import RootComponent from '../components/layout/RootComponent'
import {
  Montserrat,
  Open_Sans as OpenSans,
  Roboto_Mono as RobotoMono
} from 'next/font/google'

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

export default function RootLayout ({ children }: RootLayoutProps) {
  const montserratVar = (montserrat as FontVars).variable ?? ''
  const robotoMonoVar = (robotoMono as FontVars).variable ?? ''
  const openSansVar = (openSans as FontVars).variable ?? ''

  return (
    <html
      lang='en'
      data-theme='dark'
      style={{ colorScheme: 'dark' }}
      className={`${montserratVar} ${robotoMonoVar} ${openSansVar}`}
    >
      <body className={'chakra-ui-dark'}>
        <RootComponent>{children}</RootComponent>
      </body>
    </html>
  )
}
