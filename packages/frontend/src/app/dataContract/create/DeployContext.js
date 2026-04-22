import { createContext, useContext } from 'react'
import { useWalletConnect } from '../../../hooks/useWallet'
import { useDataContractCreate } from './useDataContractCreate'
import { useSchema } from './SchemaProvider'

const DeployContext = createContext(null)

export const useDeploy = () => useContext(DeployContext)

export const DeployProvider = ({ children }) => {
  const { value: schemaString, error: schemaError } = useSchema()
  const wallet = useWalletConnect()
  const deploy = useDataContractCreate()

  const isConnected = wallet.walletInfo != null

  const handlePrimary = () => {
    if (!isConnected) {
      wallet.connectWallet()
    } else {
      deploy.submit({
        schemaString,
        currentIdentity: wallet.currentIdentity
      })
    }
  }

  return (
    <DeployContext.Provider
      value={{
        wallet,
        deploy,
        isConnected,
        schemaError,
        handlePrimary
      }}
    >
      {children}
    </DeployContext.Provider>
  )
}
