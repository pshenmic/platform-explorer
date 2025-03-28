import RootComponent from '../components/layout/RootComponent'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false
}

export default function RootLayout ({ children }) {
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: 'dark' }} >
      <body className={'chakra-ui-dark'}>
        <RootComponent>
          { children }
        </RootComponent>
      </body>
    </html>
  )
}
