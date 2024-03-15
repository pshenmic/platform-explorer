import Blocks from './Blocks'


export const metadata = {
    title: 'Blocks — Dash Platform Explorer',
    description: 'Blocks that are included in the Dash Platform blockchain. The Timestamp, Hash, Transactions count.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'blocks'],
    applicationName: 'Dash Platform Explorer'
}

async function BlocksRoute() {
    return <Blocks/>
}

export default BlocksRoute;
