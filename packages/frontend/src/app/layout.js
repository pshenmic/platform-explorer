import RootComponent from '../components/layout/RootComponent'
import {
  Montserrat,
  Open_Sans as OpenSans,
  Roboto_Mono as RobotoMono
} from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const openSans = OpenSans({ subsets: ['latin'], variable: '--font-open-sans' })
const robotoMono = RobotoMono({ subsets: ['latin'], variable: '--font-roboto-mono' })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false
}

export default function RootLayout ({ children }) {
  return (
    <html
      lang='en'
      data-theme='dark'
      style={{ colorScheme: 'dark' }}
      className={`${montserrat.variable} ${robotoMono.variable} ${openSans.variable}`}
      >
      <body className={'chakra-ui-dark'}>
        <RootComponent>{children}</RootComponent>
      </body>
    </html>
  )
}
