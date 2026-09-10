import { createContext, useContext, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useSigner, SignerMethod } from './useSigner'
import { useDataContractCreate } from './useDataContractCreate'
import { useSchema } from './SchemaProvider'

export type PrivateKeyFormState = {
  wif: string
  setWif: Dispatch<SetStateAction<string>>
  identityId: string
  setIdentityId: Dispatch<SetStateAction<string>>
}

export type DeployContextValue = {
  signer: ReturnType<typeof useSigner>
  deploy: ReturnType<typeof useDataContractCreate>
  schemaError: string | null
  privateKeyForm: PrivateKeyFormState
  handlePrimary: () => void
}

const DeployContext = createContext<DeployContextValue | null>(null)

export const useDeploy = (): DeployContextValue => {
  const ctx = useContext(DeployContext)
  if (!ctx) throw new Error('useDeploy must be used within DeployProvider')
  return ctx
}

export const DeployProvider = ({ children }: { children: ReactNode }) => {
  const { value: schemaString, error: schemaError } = useSchema()
  const signerCtl = useSigner()
  const deploy = useDataContractCreate()
  const [wif, setWif] = useState('')
  const [identityId, setIdentityId] = useState('')

  const privateKeyForm: PrivateKeyFormState = { wif, setWif, identityId, setIdentityId }

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
