import { HStack, Radio, RadioGroup } from '@chakra-ui/react'
import { SignerMethod } from 'src/hooks/useSigner'

export const MethodSelect = ({ value, onChange, isDisabled }) => (
  <RadioGroup value={value} onChange={onChange} isDisabled={isDisabled}>
    <HStack spacing={6} align='center'>
      <Radio value={SignerMethod.EXTENSION}>Extension</Radio>
      <Radio value={SignerMethod.PRIVATE_KEY}>Private Key</Radio>
    </HStack>
  </RadioGroup>
)
