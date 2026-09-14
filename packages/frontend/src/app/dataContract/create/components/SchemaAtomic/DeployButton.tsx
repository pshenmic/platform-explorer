import { useDeploy } from '../../DeployContext'
import { SignerMethod } from '../../useSigner'
import styles from '../../create.module.css'

export const DeployButton = () => {
  const { signer, deploy, schemaError, handlePrimary } = useDeploy()

  const isBusy = signer.isConnecting || deploy.isLoading
  const hasResult = deploy.result != null

  let label: string
  if (!signer.isConnected) {
    label = signer.method === SignerMethod.PRIVATE_KEY ? 'Use Private Key' : 'Connect Wallet'
  } else if (deploy.isLoading) {
    label = 'Deploying...'
  } else if (hasResult) {
    label = 'Deploy Another'
  } else {
    label = 'Deploy Contract'
  }

  const isDisabled = isBusy || (signer.isConnected && !hasResult && schemaError != null)

  return (
    <button
      type="button"
      className={`${styles.btn} ${styles.btnPrimary}`}
      onClick={handlePrimary}
      disabled={isDisabled}
      aria-busy={isBusy}
    >
      {label}
    </button>
  )
}
