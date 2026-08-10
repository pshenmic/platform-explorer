'use client'

import { Stack } from '@chakra-ui/react'
import { PageDataContainer } from '@components/ui/containers'
import { Schema, Deploy } from './components'
import { SchemaProvider } from './SchemaProvider'
import { DeployProvider } from './DeployContext'

function DataContractCreate () {
  return (
    <SchemaProvider>
      <DeployProvider>
        <PageDataContainer title='DATA CONTRACT CREATION'>
          <Stack spacing={4}>
            <Schema />
            <Deploy />
          </Stack>
        </PageDataContainer>
      </DeployProvider>
    </SchemaProvider>
  )
}

export default DataContractCreate
