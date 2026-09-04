import { useDeploy } from '../../DeployContext'
import { SignerMethod } from '../../useSigner'
import type { Signer } from '../../useSigner'
import styles from '../../create.module.css'

export const DeployStatus = () => {
  const { schemaError, signer, deploy } = useDeploy()

  if (schemaError != null) {
    return <p className={styles.statusError}>{schemaError}</p>
  }

  if (signer.error != null) {
    return <p className={styles.statusError}>{signer.error}</p>
  }

  if (deploy.error != null) {
    return <p className={styles.statusError}>{deploy.error}</p>
  }

  if (deploy.result != null) {
    return (
      <p className={styles.statusOk}>
        ✓ Contract deployed:{' '}
        <a href={`/dataContract/${deploy.result.dataContractId}`}>
          {deploy.result.dataContractId}
        </a>
      </p>
    )
  }

  if (signer.isConnected) {
    const connected = signer.signer as Signer
    return <p className={styles.status}>Signing as: {connected.identityId}</p>
  }

  if (signer.method === SignerMethod.PRIVATE_KEY) {
    return <p className={styles.status}>Enter your private key from your Identity</p>
  }

  return <p className={styles.status}>Connect a wallet to deploy</p>
}
