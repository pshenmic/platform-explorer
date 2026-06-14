import { Flex, Heading } from '@chakra-ui/react'
import { FormControls } from './FormControls'

export const SchemaHeader = () => (
  <Flex width='100%' justify='space-between' align='center' px={2} py={2}>
    <Heading as='h2' size='xs' fontWeight='bold' m={0}>
      Contract Scheme
    </Heading>
    <FormControls />
  </Flex>
)
