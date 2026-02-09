'use client'

import { PageDataContainer } from '@components/ui/containers'
import {
  Schema,
  DocumentFields,
  TypesList,
  DocTypeField
} from './components'

function DataContractCreate () {
  return (
      <>
         <PageDataContainer title='DATA CONTRACT'>
            <Schema />
         </PageDataContainer>
         <PageDataContainer title='DOCUMENT' isChevronHidden>
            <TypesList />
            <DocTypeField />
            <DocumentFields />
         </PageDataContainer>
      </>
  )
}

export default DataContractCreate
