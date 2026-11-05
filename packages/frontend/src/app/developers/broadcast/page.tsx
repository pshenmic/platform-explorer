'use client'

import { useEffect } from 'react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { PageDataContainer } from '@components/ui/containers'
import BroadcastForm from './BroadcastForm'

function BroadcastPage() {
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([{ label: 'Home', path: '/' }, { label: 'Broadcast Transaction' }])
  }, [setBreadcrumbs])

  return (
    <PageDataContainer title={'Broadcast transaction'}>
      <BroadcastForm />
    </PageDataContainer>
  )
}

export default BroadcastPage
