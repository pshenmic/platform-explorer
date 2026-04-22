import { Box, Flex, Link, Text } from '@chakra-ui/react'
import { CardWrapper } from './CardWrapper'
import { SchemaHeader, SchemaField, DeployStatus } from './SchemaAtomic'
import { useSchema } from '../SchemaProvider'

import styles from './Schema.module.scss'

const DOCS_URL = 'https://docs.dash.org/projects/platform/en/stable/docs/explanations/platform-protocol-data-contract.html'

const formatBytes = (value) => {
  try {
    return new Blob([value ?? '']).size
  } catch {
    return 0
  }
}

export const Schema = () => {
  const { value, error } = useSchema()
  const byteSize = formatBytes(value)

  return (
    <CardWrapper title='Contract' className={styles.schema}>
      <SchemaHeader />
      <SchemaField className={styles.code} />
      <Flex mt={2} gap={4} align='flex-start' minH='24px'>
        <Box flex='1'>
          {error != null && (
            <Text color='red.500' fontSize='sm'>
              {error}
            </Text>
          )}
        </Box>
        <Flex direction='column' align='flex-end' gap={1}>
          <Text fontSize='sm' color='gray.500' whiteSpace='nowrap'>
            Size: {byteSize} Bytes
          </Text>
          <Link href={DOCS_URL} isExternal fontSize='sm' whiteSpace='nowrap'>
            Read Data Contract documentation →
          </Link>
        </Flex>
      </Flex>
      <DeployStatus />
    </CardWrapper>
  )
}
