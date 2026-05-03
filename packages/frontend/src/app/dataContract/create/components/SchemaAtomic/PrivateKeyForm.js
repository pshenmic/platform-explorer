import { FormControl, Input } from '@chakra-ui/react'
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
      <Input
        size='sm'
        variant='filled'
        type='password'
        placeholder='WIF, hex, or base64'
        value={privateKeyForm.wif}
        onChange={(e) => privateKeyForm.setWif(e.target.value)}
        fontFamily='mono'
      />
    </FormControl>
  )
}
