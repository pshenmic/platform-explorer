import Blocks from './Blocks'


export const metadata = {
    title: 'Blocks — Dash Platform Explorer',
    description: '',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'blocks'],
    applicationName: 'Dash Platform Explorer'
}

async function BlocksRoute() {
    return <Blocks/>
}

export default BlocksRoute;
