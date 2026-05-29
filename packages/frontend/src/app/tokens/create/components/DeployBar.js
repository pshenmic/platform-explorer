'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Button, HStack, Radio, RadioGroup, Flex, FormControl, Input, InputGroup, InputRightElement, IconButton, useToast
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useSigner, SignerMethod } from '../../../dataContract/create/useSigner'
import { useTokenWizard } from '../TokenWizardContext'
import { useCreateToken } from '../useCreateToken'
import ReviewModal from './ReviewModal'
import './DeployBar.scss'

const METHOD_HINTS = {
  [SignerMethod.EXTENSION]: 'Extension will sign and broadcast in one popup step.',
  [SignerMethod.PRIVATE_KEY]: 'Private Key signs locally. Identity ID auto-detected if owned by the key.'
}

const noAutofillProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-form-type': 'other'
}

function DeployBar () {
  const { form } = useTokenWizard()
  const signerCtl = useSigner()
  const deploy = useCreateToken()
  const toast = useToast()

  const [wif, setWif] = useState('')
  const [showWif, setShowWif] = useState(false)
  const [identityIdInput, setIdentityIdInput] = useState('')
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  // Async signer / deploy errors surface as toasts so the sticky footer never
  // grows or shifts when they appear (inline alerts here broke the layout).
  useEffect(() => {
    if (signerCtl.error) {
      toast({
        title: 'Signer error',
        description: signerCtl.error,
        status: 'error',
        duration: 6000,
        isClosable: true,
        position: 'top-right'
      })
    }
  }, [signerCtl.error, toast])

  useEffect(() => {
    if (deploy.error) {
      toast({
        title: 'Deploy failed',
        description: deploy.error,
        status: 'error',
        duration: 6000,
        isClosable: true,
        position: 'top-right'
      })
    }
  }, [deploy.error, toast])

  const isPK = signerCtl.method === SignerMethod.PRIVATE_KEY
  const isConnected = signerCtl.isConnected
  const isBusy = signerCtl.isConnecting || deploy.isLoading

  const formIsValid = form.name.trim().length >= 3 &&
    (form.pluralForm || '').trim().length >= 3 &&
    Number(form.decimals) >= 0 &&
    form.baseSupply

  const handlePrimary = () => {
    if (deploy.result) {
      deploy.reset()
      return
    }
    if (!isConnected) {
      if (isPK) signerCtl.connect({ wif, identityId: identityIdInput })
      else signerCtl.connect()
      return
    }
    setIsReviewOpen(true)
  }

  const handleConfirm = async () => {
    await deploy.submit({ form, signer: signerCtl.signer })
    setIsReviewOpen(false)
  }

  let primaryLabel
  if (deploy.result) primaryLabel = 'Create Another'
  else if (!isConnected) primaryLabel = isPK ? 'Use Private Key' : 'Connect Wallet'
  else primaryLabel = 'Deploy Token'

  const primaryDisabled = isBusy ||
    (!isConnected && isPK && !wif.trim()) ||
    (isConnected && !deploy.result && !formIsValid)

  return (
    <div className='DeployBar'>
      <HStack className='DeployBar__Header' align='baseline' spacing={3}>
        <div className='DeployBar__Title'>Deploy</div>
        {METHOD_HINTS[signerCtl.method] && (
          <div className='DeployBar__Hint'>{METHOD_HINTS[signerCtl.method]}</div>
        )}
      </HStack>

      <HStack className='DeployBar__MethodRow' spacing={4} align='center'>
        <HStack className='DeployBar__Method' spacing={3} align='center' flexShrink={0}>
          <RadioGroup
            value={signerCtl.method}
            onChange={signerCtl.setMethod}
            isDisabled={isBusy || isConnected}
          >
            <HStack spacing={6} align='center'>
              <Radio value={SignerMethod.EXTENSION}>Extension</Radio>
              <Radio value={SignerMethod.PRIVATE_KEY}>Private Key</Radio>
            </HStack>
          </RadioGroup>
        </HStack>

        <Flex className='DeployBar__SignerForm' flex='1' gap={2} wrap='wrap'>
          {isPK && !isConnected && (
            <>
              <FormControl flex='1' minW='200px' isDisabled={isBusy}>
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
              <FormControl flex='1' minW='200px' isDisabled={isBusy}>
                <Input
                  size='sm'
                  variant='filled'
                  placeholder='Identity ID (optional)'
                  value={identityIdInput}
                  onChange={(e) => setIdentityIdInput(e.target.value)}
                  fontFamily='mono'
                  {...noAutofillProps}
                />
              </FormControl>
            </>
          )}
        </Flex>
      </HStack>

      {deploy.result && (
        <div className='DeployBar__SuccessRow'>
          Token created! Contract:{' '}
          <Link href={`/dataContract/${deploy.result.dataContractId}`}>
            {deploy.result.dataContractId}
          </Link>
          {' '}— Token ID: {deploy.result.tokenId}
        </div>
      )}

      <div className='DeployBar__Actions'>
        <Button
          variant='blue'
          size='sm'
          minW='200px'
          onClick={handlePrimary}
          isLoading={isBusy}
          loadingText={signerCtl.isConnecting ? 'Connecting…' : 'Deploying…'}
          isDisabled={primaryDisabled}
        >
          {primaryLabel}
        </Button>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => !deploy.isLoading && setIsReviewOpen(false)}
        onConfirm={handleConfirm}
        isDeploying={deploy.isLoading}
        signerIdentityId={signerCtl.signer?.identityId}
      />
    </div>
  )
}

export default DeployBar
