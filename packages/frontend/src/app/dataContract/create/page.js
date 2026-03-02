'use client'

import { PageDataContainer } from '@components/ui/containers'
import { Schema, CardsGrid, TypesList, DocTypeField } from './components'
import { SchemaProvider } from './SchemaProvider'

function DataContractCreate () {
  return (
    <SchemaProvider>
      <PageDataContainer title="DATA CONTRACT">
        <Schema />
      </PageDataContainer>
      <PageDataContainer title="DOCUMENT" isChevronHidden>
        <TypesList />
        <DocTypeField />
        <CardsGrid />
      </PageDataContainer>
    </SchemaProvider>
  )
}

export default DataContractCreate
