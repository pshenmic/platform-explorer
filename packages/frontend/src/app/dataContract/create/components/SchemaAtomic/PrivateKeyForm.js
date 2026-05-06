import { useState } from 'react'
import { Flex, FormControl, IconButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useDeploy } from '../../DeployContext'
import { SignerMethod } from '../../useSigner'

const noAutofillProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-form-type': 'other'
}

export const PrivateKeyForm = () => {
  const { signer, privateKeyForm } = useDeploy()
  const [showWif, setShowWif] = useState(false)

  const isInactive =
    signer.method !== SignerMethod.PRIVATE_KEY ||
    signer.isConnecting ||
    signer.isConnected

  return (
    <Flex gap={2} wrap='wrap'>
      <FormControl flex='1' minW='200px' isDisabled={isInactive}>
        <InputGroup size='sm'>
          <Input
            variant='filled'
            type='text'
            name='wif'
            placeholder='WIF, hex, or base64'
            value={privateKeyForm.wif}
            onChange={(e) => privateKeyForm.setWif(e.target.value)}
            fontFamily='mono'
            sx={!showWif ? { WebkitTextSecurity: 'disc', textSecurity: 'disc' } : undefined}
            {...noAutofillProps}
          />
          <InputRightElement>
            <IconButton
              size='xs'
              variant='ghost'
              tabIndex={-1}
              icon={showWif ? <ViewOffIcon/> : <ViewIcon/>}
              aria-label={showWif ? 'Hide private key' : 'Show private key'}
              onClick={() => setShowWif((v) => !v)}
            />
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl flex='1' minW='200px' isDisabled={isInactive}>
        <Input
          size='sm'
          variant='filled'
          placeholder='Identity ID (optional)'
          value={privateKeyForm.identityId}
          onChange={(e) => privateKeyForm.setIdentityId(e.target.value)}
          fontFamily='mono'
          {...noAutofillProps}
        />
      </FormControl>
    </Flex>
  )
}
