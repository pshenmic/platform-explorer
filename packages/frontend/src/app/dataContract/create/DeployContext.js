import { createContext, useContext, useState } from 'react'
import { useSigner, SignerMethod } from './useSigner'
import { useDataContractCreate } from './useDataContractCreate'
import { useSchema } from './SchemaProvider'

const DeployContext = createContext(null)

export const useDeploy = () => useContext(DeployContext)

export const DeployProvider = ({ children }) => {
  const { value: schemaString, error: schemaError } = useSchema()
  const signerCtl = useSigner()
  const deploy = useDataContractCreate()
  const [wif, setWif] = useState('')
  const [identityId, setIdentityId] = useState('')

  const privateKeyForm = { wif, setWif, identityId, setIdentityId }

  const handlePrimary = () => {
    if (!signerCtl.isConnected) {
      if (signerCtl.method === SignerMethod.PRIVATE_KEY) {
        signerCtl.connect({ wif, identityId })
      } else {
        signerCtl.connect()
      }
      return
    }
    if (deploy.result != null) {
      deploy.reset()
      return
    }
    deploy.submit({ schemaString, signer: signerCtl.signer })
  }

  return (
    <DeployContext.Provider
      value={{
        signer: signerCtl,
        deploy,
        schemaError,
        privateKeyForm,
        handlePrimary
      }}
    >
      {children}
    </DeployContext.Provider>
  )
}
