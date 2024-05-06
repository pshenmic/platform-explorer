import Home from './home/Home'

export const metadata = {
  title: 'Dashboard — Dash Platform Explorer',
  description: 'Dashboard of Dash Platform. The Last Transactions, Blocks, Data contracts, Documents, Transfers, Average block time.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Transactions', 'Blocks', ' Data contracts', 'Documents', 'Transfers', 'platform dash money'],
  applicationName: 'Dash Platform Explorer'
}

async function HomeRoute () {
  return <Home/>
}

export default HomeRoute
