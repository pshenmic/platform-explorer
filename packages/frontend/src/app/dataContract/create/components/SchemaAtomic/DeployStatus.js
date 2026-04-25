import { Link, Text } from '@chakra-ui/react'
import { useDeploy } from '../../DeployContext'

export const DeployStatus = () => {
  const { schemaError, signer, deploy } = useDeploy()

  if (schemaError != null) {
    return <Text color='red.500' fontSize='sm'>{schemaError}</Text>
  }

  if (signer.error != null) {
    return <Text color='red.500' fontSize='sm'>{signer.error}</Text>
  }

  if (deploy.error != null) {
    return <Text color='red.500' fontSize='sm'>{deploy.error}</Text>
  }

  if (deploy.result != null) {
    return (
      <Text color='green.500' fontSize='sm'>
        ✓ Contract deployed:{' '}
        <Link
          href={`/dataContract/${deploy.result.dataContractId}`}
          color='green.500'
          textDecoration='underline'
        >
          {deploy.result.dataContractId}
        </Link>
      </Text>
    )
  }

  if (signer.isConnected) {
    return (
      <Text color='gray.500' fontSize='sm'>
        Signing as: {signer.signer.identityId}
      </Text>
    )
  }

  return <Text color='gray.500' fontSize='sm'>Connect a wallet to deploy</Text>
}
