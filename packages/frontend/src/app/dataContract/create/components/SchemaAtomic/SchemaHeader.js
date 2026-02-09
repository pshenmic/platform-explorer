import { Flex, Heading } from '@chakra-ui/react'

export const SchemaHeader = () => {
  return (
        <Flex width='100%' justify='space-between' px={2}>
          <Heading
            as={'h2'}
            size={'xs'}
            fontWeight={'bold'}
            my={3}
            mx={0}
          >
            Contract Scheme
          </Heading>
          <p>Size: 0 Bytes</p>
        </Flex>
  )
}
