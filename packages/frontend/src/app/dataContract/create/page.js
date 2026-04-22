'use client'

import { PageDataContainer } from '@components/ui/containers'
import { Schema } from './components'
import { SchemaProvider } from './SchemaProvider'
import { DeployProvider } from './DeployContext'

function DataContractCreate () {
  return (
    <SchemaProvider>
      <DeployProvider>
        <PageDataContainer title='DATA CONTRACT CREATION'>
          <Schema />
        </PageDataContainer>
      </DeployProvider>
    </SchemaProvider>
  )
}

export default DataContractCreate
