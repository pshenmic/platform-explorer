import { Alert, AlertIcon, Button, Flex, Link, Select, Text } from '@chakra-ui/react'
import { useSchema } from '../SchemaProvider'
import { useWalletConnect } from '../../../../hooks/useWallet'
import { useDataContractCreate } from '../useDataContractCreate'

export const DeployBlock = () => {
  const { value: schemaString, error: schemaError } = useSchema()
  const {
    connectWallet,
    walletInfo,
    currentIdentity,
    isConnecting,
    error: walletError
  } = useWalletConnect()
  const {
    submit,
    isLoading: isDeploying,
    error: deployError,
    result
  } = useDataContractCreate()

  if (!walletInfo) {
    return (
      <Flex direction='column' gap={4} p={4}>
        <Text fontSize='sm'>
          Connect your Dash Platform Extension to deploy the contract.
        </Text>
        <Button
          variant='blue'
          onClick={connectWallet}
          isLoading={isConnecting}
        >
          Connect Wallet
        </Button>
        {walletError != null && (
          <Alert status='error'>
            <AlertIcon />
            {walletError}
          </Alert>
        )}
      </Flex>
    )
  }

  const handleDeploy = () => submit({ schemaString, currentIdentity })

  return (
    <Flex direction='column' gap={4} p={4}>
      <Flex direction='column' gap={2}>
        <Text fontSize='sm' fontWeight='bold'>Method</Text>
        <Select defaultValue='extension'>
          <option value='extension'>Extension signer</option>
          <option value='privateKey' disabled>Private key (coming soon)</option>
        </Select>
      </Flex>

      <Text fontSize='xs' color='gray.500'>
        Signing as: {currentIdentity}
      </Text>

      <Button
        variant='blue'
        onClick={handleDeploy}
        isLoading={isDeploying}
        isDisabled={schemaError != null}
      >
        Deploy Contract
      </Button>

      {schemaError != null && (
        <Alert status='warning'>
          <AlertIcon />
          Fix JSON errors in the schema before deploying
        </Alert>
      )}
      {deployError != null && (
        <Alert status='error'>
          <AlertIcon />
          {deployError}
        </Alert>
      )}
      {result != null && (
        <Alert status='success'>
          <AlertIcon />
          <Text>
            Contract deployed:{' '}
            <Link href={`/dataContract/${result.dataContractId}`} color='blue.500'>
              {result.dataContractId}
            </Link>
          </Text>
        </Alert>
      )}
    </Flex>
  )
}
