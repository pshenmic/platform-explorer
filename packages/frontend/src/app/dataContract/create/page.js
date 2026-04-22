'use client'

import { PageDataContainer } from '@components/ui/containers'
import { Schema, DeployBlock } from './components'
import { SchemaProvider } from './SchemaProvider'

function DataContractCreate () {
  return (
    <SchemaProvider>
      <PageDataContainer title='DATA CONTRACT'>
        <Schema />
      </PageDataContainer>
      <PageDataContainer title='DEPLOY' isChevronHidden>
        <DeployBlock />
      </PageDataContainer>
    </SchemaProvider>
  )
}

export default DataContractCreate
