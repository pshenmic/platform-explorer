import { Alert, AlertIcon, Link, Text, VStack } from '@chakra-ui/react'
import { useDeploy } from '../../DeployContext'

export const DeployStatus = () => {
  const { isConnected, wallet, deploy } = useDeploy()

  if (!isConnected && wallet.error == null && deploy.error == null && deploy.result == null) {
    return null
  }

  return (
    <VStack align='stretch' spacing={2} mt={3}>
      {isConnected && (
        <Text fontSize='xs' color='gray.500'>
          Signing as: {wallet.currentIdentity}
        </Text>
      )}
      {wallet.error != null && (
        <Alert status='error'>
          <AlertIcon />
          {wallet.error}
        </Alert>
      )}
      {deploy.error != null && (
        <Alert status='error'>
          <AlertIcon />
          {deploy.error}
        </Alert>
      )}
      {deploy.result != null && (
        <Alert status='success'>
          <AlertIcon />
          <Text>
            Contract deployed:{' '}
            <Link href={`/dataContract/${deploy.result.dataContractId}`} color='blue.500'>
              {deploy.result.dataContractId}
            </Link>
          </Text>
        </Alert>
      )}
    </VStack>
  )
}
