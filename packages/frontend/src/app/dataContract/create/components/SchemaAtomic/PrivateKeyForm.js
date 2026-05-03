import { Flex, FormControl, Input } from '@chakra-ui/react'
import { useDeploy } from '../../DeployContext'
import { SignerMethod } from '../../useSigner'

export const PrivateKeyForm = () => {
  const { signer, privateKeyForm } = useDeploy()

  const isInactive =
    signer.method !== SignerMethod.PRIVATE_KEY ||
    signer.isConnecting ||
    signer.isConnected

  return (
    <Flex gap={2} wrap='wrap'>
      <FormControl flex='1' minW='200px' isDisabled={isInactive}>
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
      <FormControl flex='1' minW='200px' isDisabled={isInactive}>
        <Input
          size='sm'
          variant='filled'
          placeholder='Identity ID (optional)'
          value={privateKeyForm.identityId}
          onChange={(e) => privateKeyForm.setIdentityId(e.target.value)}
          fontFamily='mono'
        />
      </FormControl>
    </Flex>
  )
}
