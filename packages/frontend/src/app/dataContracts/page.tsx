import type { Metadata } from 'next'
import DataContracts from './DataContracts'

export const metadata: Metadata = {
  title: 'Data Contracts — Dash Platform Explorer',
  description: 'Data Contracts on Dash Platform. The Identifier, Date of Creation.',
  keywords: [
    'Dash',
    'platform',
    'explorer',
    'blockchain',
    'data contrancts',
    'Datacontract',
    'Identifier',
    'Date of Creation'
  ],
  applicationName: 'Dash Platform Explorer'
}

function DataContractsRoute() {
  return <DataContracts />
}

export default DataContractsRoute
