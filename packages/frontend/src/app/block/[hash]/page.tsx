import type { Metadata } from 'next'
import Block from './Block'

interface BlockRouteProps {
  params: { hash: string }
}

export async function generateMetadata ({ params }: BlockRouteProps): Promise<Metadata> {
  return {
    title: 'Block #' + params.hash + ' — Dash Platform Explorer',
    description: 'Dash Platform Block Hash ' + params.hash + '. The Timestamp, Transactions count, Block Version.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'block', 'Timestamp', 'Transactions', 'Block'],
    applicationName: 'Dash Platform Explorer'
  }
}

async function BlockRoute ({ params }: BlockRouteProps) {
  return <Block hash={params.hash}/>
}

export default BlockRoute
