import Blocks from './Blocks'

export const metadata = {
  title: 'Blocks — Dash Platform Explorer',
  description: 'Blocks that are included in the Dash Platform blockchain. The Timestamp, Hash, Transactions count.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'blocks', 'Timestamp', 'Hash', 'Transactions'],
  applicationName: 'Dash Platform Explorer'
}

async function BlocksRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return <Blocks defaultPage={page} defaultPageSize={pageSize}/>
}

export default BlocksRoute
