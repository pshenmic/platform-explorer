import { Button, Flex } from '@chakra-ui/react'
import { CloseIcon } from '@components/ui/icons'
import { useSchema } from '../../SchemaProvider'
import { useDeploy } from '../../DeployContext'

export const FormControls = () => {
  const { value, error: schemaError, handleChange, handleReset } = useSchema()
  const { isConnected, handlePrimary, wallet, deploy } = useDeploy()

  const handleFormat = () => {
    try {
      handleChange(JSON.stringify(JSON.parse(value), null, 2))
    } catch {
      // JSON invalid — error shown separately, nothing to format
    }
  }

  const isBusy = wallet.isConnecting || deploy.isLoading

  return (
    <Flex gap={2} align='center' wrap='wrap'>
      <Button variant='blue' size='sm' onClick={handleFormat} isDisabled={schemaError != null}>
        Format
      </Button>
      <Button leftIcon={<CloseIcon />} variant='red' size='sm' onClick={handleReset}>
        Reset
      </Button>
      <Button
        variant='brand'
        size='sm'
        onClick={handlePrimary}
        isLoading={isBusy}
        isDisabled={isConnected && schemaError != null}
      >
        {isConnected ? 'Deploy Contract' : 'Connect Wallet'}
      </Button>
    </Flex>
  )
}
