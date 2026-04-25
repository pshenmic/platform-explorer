import { createContext, useContext } from 'react'
import { useSigner } from './useSigner'
import { useDataContractCreate } from './useDataContractCreate'
import { useSchema } from './SchemaProvider'

const DeployContext = createContext(null)

export const useDeploy = () => useContext(DeployContext)

export const DeployProvider = ({ children }) => {
  const { value: schemaString, error: schemaError } = useSchema()
  const signerCtl = useSigner()
  const deploy = useDataContractCreate()

  const handlePrimary = () => {
    if (!signerCtl.isConnected) {
      signerCtl.connect()
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
        handlePrimary
      }}
    >
      {children}
    </DeployContext.Provider>
  )
}
