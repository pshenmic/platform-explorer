import { Box, Flex, Stack } from '@chakra-ui/react'
import { CardWrapper } from './CardWrapper'
import { MethodSelect, DeployButton, DeployStatus, PrivateKeyForm } from './SchemaAtomic'
import { useDeploy } from '../DeployContext'
import { SignerMethod } from '../useSigner'

export const Deploy = () => {
  const { signer } = useDeploy()
  const showPrivateKeyForm =
    signer.method === SignerMethod.PRIVATE_KEY && !signer.isConnected

  return (
    <CardWrapper title='Deploy'>
      <Stack spacing={4}>
        <MethodSelect />
        {showPrivateKeyForm && <PrivateKeyForm />}
        <Flex gap={4} align='center' wrap='wrap' minH='24px'>
          <Box flex='1' minW='200px'>
            <DeployStatus />
          </Box>
          <DeployButton />
        </Flex>
      </Stack>
    </CardWrapper>
  )
}
