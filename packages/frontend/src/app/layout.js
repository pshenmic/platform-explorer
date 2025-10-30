import RootComponent from '../components/layout/RootComponent'
import { Providers } from './Providers'

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
    >
      <body className={'chakra-ui-dark'}>
        <Providers>
          <RootComponent>{children}</RootComponent>
        </Providers>
      </body>
    </html>
  )
}
