import Home from './home/Home'


export const metadata = {
    title: 'Dashboard — Dash Platform Explorer',
    description: '',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain'],
    applicationName: 'Dash Platform Explorer'
}

async function HomeRoute() {
    return <Home/>
}

export default HomeRoute
