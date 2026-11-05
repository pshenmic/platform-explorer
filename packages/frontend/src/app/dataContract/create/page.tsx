'use client'

import { useEffect } from 'react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { PageDataContainer } from '@components/ui/containers'
import { Schema, Deploy } from './components'
import { SchemaProvider } from './SchemaProvider'
import { DeployProvider } from './DeployContext'
import styles from './create.module.css'

function DataContractCreate() {
  const { setBreadcrumbs } = useBreadcrumbs()
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Data Contracts', path: '/dataContracts' },
      { label: 'Data Contract Creation' }
    ])
  }, [setBreadcrumbs])

  return (
    <SchemaProvider>
      <DeployProvider>
        <PageDataContainer title="Data contract creation">
          <div className={styles.stack}>
            <Schema />
            <Deploy />
          </div>
        </PageDataContainer>
      </DeployProvider>
    </SchemaProvider>
  )
}

export default DataContractCreate
