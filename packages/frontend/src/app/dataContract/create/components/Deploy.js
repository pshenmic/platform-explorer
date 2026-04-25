import { Box, Flex, Stack } from '@chakra-ui/react'
import { CardWrapper } from './CardWrapper'
import { MethodSelect, DeployButton, DeployStatus } from './SchemaAtomic'

export const Deploy = () => (
  <CardWrapper title='Deploy'>
    <Stack spacing={4}>
      <MethodSelect />
      <Flex gap={4} align='center' wrap='wrap' minH='24px'>
        <Box flex='1' minW='200px'>
          <DeployStatus />
        </Box>
        <DeployButton />
      </Flex>
    </Stack>
  </CardWrapper>
)
