import type { Metadata } from 'next'
import PlatformAddress from './PlatformAddress'

interface PlatformAddressRouteProps {
  params: Promise<{ hash: string }>
}

export async function generateMetadata(props: PlatformAddressRouteProps): Promise<Metadata> {
  const params = await props.params
  return {
    title: 'Platform Address ' + params.hash + ' — Dash Platform Explorer',
    description:
      'Platform Address ' +
      params.hash +
      ' on Dash Platform. Balance, nonce, incoming and outgoing transactions.',
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'Platform Address',
      'Balance',
      'Nonce',
      'Transactions'
    ],
    applicationName: 'Dash Platform Explorer'
  }
}

function PlatformAddressRoute() {
  return <PlatformAddress />
}

export default PlatformAddressRoute
