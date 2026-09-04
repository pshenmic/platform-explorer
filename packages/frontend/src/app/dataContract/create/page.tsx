'use client'

import { PageDataContainer } from '@components/ui/containers'
import { Schema, Deploy } from './components'
import { SchemaProvider } from './SchemaProvider'
import { DeployProvider } from './DeployContext'
import styles from './create.module.css'

function DataContractCreate() {
  return (
    <SchemaProvider>
      <DeployProvider>
        <PageDataContainer title="DATA CONTRACT CREATION">
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
