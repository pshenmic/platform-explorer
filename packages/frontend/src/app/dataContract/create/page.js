'use client'

import { PageDataContainer } from '@components/ui/containers'
import {
  Schema,
  CardsGrid,
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
            <CardsGrid />
         </PageDataContainer>
      </>
  )
}

export default DataContractCreate
