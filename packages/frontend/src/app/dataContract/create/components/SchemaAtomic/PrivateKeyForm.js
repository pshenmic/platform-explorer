import { FormControl, FormLabel, Input, Text } from '@chakra-ui/react'
import { useDeploy } from '../../DeployContext'
import { SignerMethod } from '../../useSigner'

export const PrivateKeyForm = () => {
  const { signer, privateKeyForm } = useDeploy()
  const isInactive =
    signer.method !== SignerMethod.PRIVATE_KEY ||
    signer.isConnecting ||
    signer.isConnected

  return (
    <FormControl isDisabled={isInactive}>
      <FormLabel fontSize='xs' color='gray.400' mb={1}>
        Private Key (WIF)
      </FormLabel>
      <Input
        size='sm'
        variant='filled'
        type='password'
        placeholder='WIF private key'
        value={privateKeyForm.wif}
        onChange={(e) => privateKeyForm.setWif(e.target.value)}
        fontFamily='mono'
      />
      <Text fontSize='xs' color='gray.500' mt={1}>
        Key never leaves your browser. Use a testnet key for testing.
      </Text>
    </FormControl>
  )
}
