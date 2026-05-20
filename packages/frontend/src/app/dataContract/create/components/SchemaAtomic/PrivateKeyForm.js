import { PrivateKeyForm as SharedPrivateKeyForm } from 'src/components/signing'
import { useDeploy } from '../../DeployContext'
import { SignerMethod } from '../../useSigner'

export const PrivateKeyForm = () => {
  const { signer, privateKeyForm } = useDeploy()

  const isInactive =
    signer.method !== SignerMethod.PRIVATE_KEY ||
    signer.isConnecting ||
    signer.isConnected

  return (
    <SharedPrivateKeyForm
      wif={privateKeyForm.wif}
      setWif={privateKeyForm.setWif}
      identityId={privateKeyForm.identityId}
      setIdentityId={privateKeyForm.setIdentityId}
      isInactive={isInactive}
    />
  )
}
