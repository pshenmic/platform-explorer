import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'

import RootComponent from '../components/layout/RootComponent'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false
}

const queryClient = new QueryClient()

export default function RootLayout ({ children }) {
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: 'dark' }} >
      <body className={'chakra-ui-dark'}>
        <QueryClientProvider client={queryClient}>
          <RootComponent>
            { children }
          </RootComponent>
        </QueryClientProvider>
      </body>
    </html>
  )
}
