import DataContracts from './DataContracts'


export const metadata = {
    title: 'Data Contracts — Dash Platform Explorer',
    description: 'Data Contracts on Dash Platform. The Identifier, Date of Creation.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contrancts'],
    applicationName: 'Dash Platform Explorer'
}

function DataContractsRoute() {
    return <DataContracts/>
}

export default DataContractsRoute;
