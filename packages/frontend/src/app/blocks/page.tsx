import type { Metadata } from 'next'
import Blocks from './Blocks'

export const metadata: Metadata = {
  title: 'Blocks — Dash Platform Explorer',
  description:
    'Blocks that are included in the Dash Platform blockchain. The Timestamp, Hash, Transactions count.',
  keywords: [
    'Dash',
    'platform',
    'explorer',
    'blockchain',
    'blocks',
    'Timestamp',
    'Hash',
    'Transactions'
  ],
  applicationName: 'Dash Platform Explorer'
}

interface BlocksRouteProps {
  searchParams: Promise<{
    page?: string
    'page-size'?: string
  }>
}

async function BlocksRoute(props: BlocksRouteProps) {
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return <Blocks defaultPage={page} defaultPageSize={pageSize} />
}

export default BlocksRoute
