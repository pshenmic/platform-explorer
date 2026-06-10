import { Button } from '@chakra-ui/react'
import { useDeploy } from '../../DeployContext'
import { SignerMethod } from '../../useSigner'

export const DeployButton = () => {
  const { signer, deploy, schemaError, handlePrimary } = useDeploy()

  const isBusy = signer.isConnecting || deploy.isLoading
  const hasResult = deploy.result != null

  let label
  if (!signer.isConnected) {
    label = signer.method === SignerMethod.PRIVATE_KEY
      ? 'Use Private Key'
      : 'Connect Wallet'
  } else if (deploy.isLoading) {
    label = 'Deploying...'
  } else if (hasResult) {
    label = 'Deploy Another'
  } else {
    label = 'Deploy Contract'
  }

  const isDisabled =
    isBusy ||
    (signer.isConnected && !hasResult && schemaError != null)

  return (
    <Button
      variant='blue'
      size='sm'
      minW='160px'
      alignSelf='flex-start'
      onClick={handlePrimary}
      isLoading={isBusy}
      isDisabled={isDisabled}
    >
      {label}
    </Button>
  )
}
