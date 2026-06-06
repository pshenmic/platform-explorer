import { useState } from 'react'
import { Flex, FormControl, IconButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

const noAutofillProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-form-type': 'other'
}

export const PrivateKeyForm = ({ wif, setWif, identityId, setIdentityId, isInactive, identityIdPlaceholder = 'Identity ID (optional)' }) => {
  const [showWif, setShowWif] = useState(false)

  return (
    <Flex gap={2} wrap='wrap'>
      <FormControl flex='1' minW='200px' isDisabled={isInactive}>
        <InputGroup size='sm'>
          <Input
            variant='filled'
            type='text'
            name='wif'
            placeholder='WIF, hex, or base64'
            value={wif}
            onChange={(e) => setWif(e.target.value)}
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
          placeholder={identityIdPlaceholder}
          value={identityId}
          onChange={(e) => setIdentityId(e.target.value)}
          fontFamily='mono'
          {...noAutofillProps}
        />
      </FormControl>
    </Flex>
  )
}
