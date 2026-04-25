import { Stack, FormControl, FormLabel, Input, Text } from '@chakra-ui/react'
import { useDeploy } from '../../DeployContext'

export const PrivateKeyForm = () => {
  const { signer, privateKeyForm } = useDeploy()
  const isBusy = signer.isConnecting || signer.isConnected

  return (
    <Stack spacing={3}>
      <FormControl>
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
          isDisabled={isBusy}
          fontFamily='mono'
        />
        <Text fontSize='xs' color='gray.500' mt={1}>
          Key never leaves your browser. Use a testnet key for testing.
        </Text>
      </FormControl>
      <FormControl>
        <FormLabel fontSize='xs' color='gray.400' mb={1}>
          Identity ID <Text as='span' color='gray.500'>(optional)</Text>
        </FormLabel>
        <Input
          size='sm'
          variant='filled'
          placeholder='Auto-derived from key if left blank'
          value={privateKeyForm.identityId}
          onChange={(e) => privateKeyForm.setIdentityId(e.target.value)}
          isDisabled={isBusy}
          fontFamily='mono'
        />
      </FormControl>
    </Stack>
  )
}
