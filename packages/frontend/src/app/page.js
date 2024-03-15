import Home from './home/Home'


export const metadata = {
    title: 'Dashboard — Dash Platform Explorer',
    description: 'Dashboard of Dash Platform. The Last Transactions, Blocks, Transactions, Data contracts, Documents, Transfers, Average block time.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain'],
    applicationName: 'Dash Platform Explorer'
}

async function HomeRoute() {
    return <Home/>
}

export default HomeRoute
