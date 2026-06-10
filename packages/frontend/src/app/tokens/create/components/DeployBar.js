'use client'

import { useState } from 'react'
import { Button, Stack, Box, Text, Link } from '@chakra-ui/react'
import { MethodSelect, PrivateKeyForm } from 'src/components/signing'
import { CardWrapper } from '../../../dataContract/create/components/CardWrapper'
import { useSigner, SignerMethod } from '../../../dataContract/create/useSigner'
import { useTokenWizard } from '../TokenWizardContext'
import { useCreateToken } from '../useCreateToken'
import { validateForm } from '../validation'
import ReviewModal from './ReviewModal'

// Mirrors dataContract/create Deploy.js so both creation flows look identical:
// CardWrapper + MethodSelect + PrivateKeyForm + status line + button. Wiring is
// ours (useSigner + useCreateToken); ReviewModal stays as a confirm step before
// the irreversible broadcast.
const DeployStatus = ({ signer, deploy }) => {
  if (deploy.error != null) return <Text color='red.500' fontSize='sm'>{deploy.error}</Text>
  if (signer.error != null) return <Text color='red.500' fontSize='sm'>{signer.error}</Text>
  if (deploy.result != null) {
    return (
      <Text color='green.500' fontSize='sm'>
        ✓ Token deployed:{' '}
        <Link href={`/dataContract/${deploy.result.dataContractId}`} color='green.500' textDecoration='underline'>
          {deploy.result.dataContractId}
        </Link>
        {' '}· {deploy.result.tokenId}
      </Text>
    )
  }
  if (signer.isConnected) return <Text color='gray.500' fontSize='sm'>Signing as: {signer.signer.identityId}</Text>
  if (signer.method === SignerMethod.PRIVATE_KEY) return <Text color='gray.500' fontSize='sm'>Enter your private key from your Identity</Text>
  return <Text color='gray.500' fontSize='sm'>Connect a wallet to deploy</Text>
}

function DeployBar () {
  const { form } = useTokenWizard()
  const signerCtl = useSigner()
  const deploy = useCreateToken()

  const [wif, setWif] = useState('')
  const [identityIdInput, setIdentityIdInput] = useState('')
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const isPK = signerCtl.method === SignerMethod.PRIVATE_KEY
  const isConnected = signerCtl.isConnected
  const isBusy = signerCtl.isConnecting || deploy.isLoading

  const errors = validateForm(form)

  const handlePrimary = () => {
    if (deploy.result) { deploy.reset(); return }
    if (!isConnected) {
      if (isPK) signerCtl.connect({ wif, identityId: identityIdInput })
      else signerCtl.connect()
      return
    }
    // Reveal problems only when the user actually tries to deploy — no nagging
    // on the empty default form.
    if (errors.length) { setShowErrors(true); return }
    setShowErrors(false)
    setIsReviewOpen(true)
  }

  const handleConfirm = async () => {
    await deploy.submit({ form, signer: signerCtl.signer })
    setIsReviewOpen(false)
  }

  let label
  if (deploy.result) label = 'Deploy Another'
  else if (!isConnected) label = isPK ? 'Use Private Key' : 'Connect Wallet'
  else if (deploy.isLoading) label = 'Deploying...'
  else label = 'Deploy Token'

  // Keep the button clickable when connected so a click can surface the
  // validation errors; the actual gate lives in handlePrimary.
  const isDisabled = isBusy || (!isConnected && isPK && !wif.trim())

  return (
    <CardWrapper title='Deploy'>
      <Stack spacing={3}>
        <MethodSelect
          value={signerCtl.method}
          onChange={signerCtl.setMethod}
          isDisabled={isBusy || isConnected}
        />
        {/* Pinned footer stays compact: key inputs appear only when chosen. */}
        {isPK && !isConnected && (
          <PrivateKeyForm
            wif={wif}
            setWif={setWif}
            identityId={identityIdInput}
            setIdentityId={setIdentityIdInput}
            isInactive={isBusy}
          />
        )}
        <Box minH='20px'>
          <DeployStatus signer={signerCtl} deploy={deploy}/>
        </Box>
        {showErrors && errors.length > 0 && !deploy.result && (
          <Stack spacing={1} as='ul' pl={4} sx={{ listStyle: 'disc' }}>
            {errors.map((msg, i) => (
              <Text as='li' key={i} color='red.500' fontSize='sm'>{msg}</Text>
            ))}
          </Stack>
        )}
        <Button
          variant='blue'
          size='sm'
          minW='160px'
          alignSelf='flex-start'
          onClick={handlePrimary}
          isLoading={isBusy}
          isDisabled={isDisabled}
        >
          {label}
        </Button>
      </Stack>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => !deploy.isLoading && setIsReviewOpen(false)}
        onConfirm={handleConfirm}
        isDeploying={deploy.isLoading}
        signerIdentityId={signerCtl.signer?.identityId}
      />
    </CardWrapper>
  )
}

export default DeployBar
