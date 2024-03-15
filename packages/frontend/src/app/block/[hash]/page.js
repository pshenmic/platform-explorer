import Block from './Block'


export async function generateMetadata({ params }) {
    return {
        title: 'Block #' + params.hash + ' — Dash Platform Explorer',
        description: '',
        keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'block'],
        applicationName: 'Dash Platform Explorer'
    }
}

async function BlockRoute({ params }) {
    return <Block hash={params.hash}/>
}

export default BlockRoute
