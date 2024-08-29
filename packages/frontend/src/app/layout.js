import RootComponent from '../components/layout/RootComponent'

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
