'use client'

import { useEffect } from 'react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { PageDataContainer } from '@components/ui/containers'
import CreateTokenPage from './CreateTokenPage'

function CreateTokenRoute () {
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Tokens', path: '/tokens' },
      { label: 'Create Token' }
    ])
  }, [setBreadcrumbs])

  return (
    <PageDataContainer title='CREATE TOKEN'>
      <CreateTokenPage/>
    </PageDataContainer>
  )
}

export default CreateTokenRoute
