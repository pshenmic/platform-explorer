import { Box, Stack } from '@chakra-ui/react'
import { CardWrapper } from './CardWrapper'
import { MethodSelect, DeployButton, DeployStatus, PrivateKeyForm } from './SchemaAtomic'

export const Deploy = () => (
  <CardWrapper title='Deploy'>
    <Stack spacing={3}>
      <MethodSelect />
      <PrivateKeyForm />
      <Box minH='20px'>
        <DeployStatus />
      </Box>
      <DeployButton />
    </Stack>
  </CardWrapper>
)
