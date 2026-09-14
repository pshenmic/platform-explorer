import type { Metadata } from 'next'
import Block from './Block'

interface BlockRouteProps {
  params: Promise<{ hash: string }>
}

export async function generateMetadata(props: BlockRouteProps): Promise<Metadata> {
  const params = await props.params
  return {
    title: 'Block #' + params.hash + ' — Dash Platform Explorer',
    description:
      'Dash Platform Block Hash ' +
      params.hash +
      '. The Timestamp, Transactions count, Block Version.',
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'block',
      'Timestamp',
      'Transactions',
      'Block'
    ],
    applicationName: 'Dash Platform Explorer'
  }
}

async function BlockRoute(props: BlockRouteProps) {
  const params = await props.params
  return <Block hash={params.hash} />
}

export default BlockRoute
