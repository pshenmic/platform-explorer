import { useState } from 'react'
import type { Signer } from 'src/hooks/useSigner'

export type DataContractCreateResult = {
  dataContractId: string
}

export type UseDataContractCreateReturn = {
  submit: (params: { schemaString: string; signer: Signer | null | undefined }) => Promise<void>
  reset: () => void
  isLoading: boolean
  error: string | null
  result: DataContractCreateResult | null
}

export const useDataContractCreate = (): UseDataContractCreateReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DataContractCreateResult | null>(null)

  const submit = async ({
    schemaString,
    signer
  }: {
    schemaString: string
    signer: Signer | null | undefined
  }) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!signer?.identityId || !signer?.sdk) {
        throw new Error('No signer connected')
      }

      let schema: object
      try {
        schema = JSON.parse(schemaString) as object
      } catch {
        throw new Error('Schema must be valid JSON')
      }

      const { sdk } = signer

      const identity = await sdk.identities.getIdentityByIdentifier(signer.identityId)
      const identityNonce = await sdk.identities.getIdentityNonce(identity.id)
      const nextNonce = identityNonce + BigInt(1)

      const dataContract = sdk.dataContracts.create(identity.id, nextNonce, schema)

      const stateTransition = sdk.dataContracts.createStateTransition(
        dataContract,
        'create',
        nextNonce
      )

      await signer.signAndBroadcast(stateTransition)

      setResult({ dataContractId: dataContract.id.base58() })
    } catch (e) {
      console.error('Data contract deploy failed:', e)
      const err = e as { message?: string; toString?: () => string }
      const message = err?.message ?? err?.toString?.() ?? 'Failed to deploy contract'
      setError(typeof message === 'string' ? message : 'Failed to deploy contract')
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setResult(null)
  }

  return { submit, reset, isLoading, error, result }
}
