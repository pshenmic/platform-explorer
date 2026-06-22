import { Suspense } from 'react'
import DataContracts from './DataContracts'

export const metadata = {
  title: 'Data Contracts — Dash Platform Explorer',
  description: 'Data Contracts on Dash Platform. The Identifier, Date of Creation.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contrancts', 'Datacontract', 'Identifier', 'Date of Creation'],
  applicationName: 'Dash Platform Explorer'
}

function DataContractsRoute () {
  return (
    <Suspense fallback={null}>
      <DataContracts/>
    </Suspense>
  )
}

export default DataContractsRoute
