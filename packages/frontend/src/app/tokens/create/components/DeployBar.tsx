'use client'

import { useState } from 'react'
import { MethodSelect, PrivateKeyForm } from 'src/components/signing'
import { CardWrapper } from '../../../dataContract/create/components/CardWrapper'
import { useSigner, SignerMethod } from '../../../dataContract/create/useSigner'
import type { Signer } from 'src/hooks/useSigner'
import { useTokenWizard } from '../TokenWizardContext'
import { useCreateToken } from '../useCreateToken'
import type { UseCreateTokenReturn } from '../useCreateToken'
import { validateForm } from '../validation'
import ReviewModal from './ReviewModal'
import '../CreateTokenPage.css'

type SignerCtl = ReturnType<typeof useSigner>

interface DeployStatusProps {
  signer: SignerCtl
  deploy: UseCreateTokenReturn
}

const DeployStatus = ({ signer, deploy }: DeployStatusProps) => {
  if (deploy.error != null) return <p className="DeployBar__Msg DeployBar__Msg--error">{deploy.error}</p>
  if (signer.error != null) return <p className="DeployBar__Msg DeployBar__Msg--error">{signer.error}</p>
  if (deploy.result != null) {
    return (
      <p className="DeployBar__Msg DeployBar__Msg--ok">
        ✓ Token deployed:{' '}
        <a href={`/dataContract/${deploy.result.dataContractId}`}>
          {deploy.result.dataContractId}
        </a>{' '}
        · {deploy.result.tokenId}
      </p>
    )
  }
  if (signer.isConnected) {
    const connected = signer.signer as Signer
    return <p className="DeployBar__Msg">Signing as: {connected.identityId}</p>
  }
  if (signer.method === SignerMethod.PRIVATE_KEY)
    return <p className="DeployBar__Msg">Enter your private key from your Identity</p>
  return <p className="DeployBar__Msg">Connect a wallet to deploy</p>
}

function DeployBar() {
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
    if (deploy.result) {
      deploy.reset()
      return
    }
    if (!isConnected) {
      if (isPK) signerCtl.connect({ wif, identityId: identityIdInput })
      else signerCtl.connect()
      return
    }
    if (errors.length) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setIsReviewOpen(true)
  }

  const handleConfirm = async () => {
    await deploy.submit({ form, signer: signerCtl.signer })
    setIsReviewOpen(false)
  }

  let label: string
  if (deploy.result) label = 'Deploy Another'
  else if (!isConnected) label = isPK ? 'Use Private Key' : 'Connect Wallet'
  else if (deploy.isLoading) label = 'Deploying...'
  else label = 'Deploy Token'

  const isDisabled = isBusy || (!isConnected && isPK && !wif.trim())

  return (
    <CardWrapper title="Deploy">
      <div className="DeployBar">
        <MethodSelect
          value={signerCtl.method}
          onChange={signerCtl.setMethod}
          isDisabled={isBusy || isConnected}
        />
        {isPK && !isConnected && (
          <PrivateKeyForm
            wif={wif}
            setWif={setWif}
            identityId={identityIdInput}
            setIdentityId={setIdentityIdInput}
            isInactive={isBusy}
          />
        )}
        <div className="DeployBar__Status">
          <DeployStatus signer={signerCtl} deploy={deploy} />
        </div>
        {showErrors && errors.length > 0 && !deploy.result && (
          <ul className="DeployBar__Errors">
            {errors.map((msg, i) => (
              <li key={i} className="DeployBar__Msg DeployBar__Msg--error">
                {msg}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="DeployBar__Btn"
          onClick={handlePrimary}
          disabled={isDisabled}
          aria-busy={isBusy}
        >
          {label}
        </button>
      </div>

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
