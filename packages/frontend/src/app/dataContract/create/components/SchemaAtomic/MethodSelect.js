import { HStack, Radio, RadioGroup } from '@chakra-ui/react'
import { useDeploy } from '../../DeployContext'
import { SignerMethod } from '../../useSigner'

export const MethodSelect = () => {
  const { signer } = useDeploy()

  return (
    <RadioGroup
      value={signer.method}
      onChange={signer.setMethod}
      isDisabled={signer.isConnected || signer.isConnecting}
    >
      <HStack spacing={6} align='center'>
        <Radio value={SignerMethod.EXTENSION}>Extension</Radio>
        <Radio value={SignerMethod.PRIVATE_KEY}>Private Key</Radio>
      </HStack>
    </RadioGroup>
  )
}
