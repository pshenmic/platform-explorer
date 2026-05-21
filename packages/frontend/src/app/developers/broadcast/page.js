'use client'

import { Suspense, useEffect } from 'react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { PageDataContainer } from '@components/ui/containers'
import BroadcastForm from './BroadcastForm'

function BroadcastPage () {
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Broadcast Transaction' }
    ])
  }, [setBreadcrumbs])

  return (
    <PageDataContainer title={'BROADCAST TRANSACTION'}>
      <Suspense fallback={null}>
        <BroadcastForm/>
      </Suspense>
    </PageDataContainer>
  )
}

export default BroadcastPage
