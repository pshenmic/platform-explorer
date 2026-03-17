import RootComponent from '../components/layout/RootComponent'
import {
  Montserrat,
  Open_Sans as OpenSans,
  Roboto_Mono as RobotoMono
} from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'] })
const openSans = OpenSans({ subsets: ['latin'] })
const robotoMono = RobotoMono({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false
}

export default function RootLayout({ children }) {
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
