import { useState } from 'react'

export const useDataContractCreate = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const submit = async ({ schemaString, signer }) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!window.dashPlatformSDK) {
        throw new Error('Dash Platform SDK is not available')
      }
      if (!signer?.identityId) {
        throw new Error('No signer connected')
      }

      let schema
      try {
        schema = JSON.parse(schemaString)
      } catch {
        throw new Error('Schema must be valid JSON')
      }

      const sdk = window.dashPlatformSDK

      const identity = await sdk.identities.getIdentityByIdentifier(signer.identityId)
      const identityNonce = await sdk.identities.getIdentityNonce(identity.id)
      const nextNonce = identityNonce + BigInt(1)

      const dataContract = sdk.dataContracts.create(
        identity.id,
        nextNonce,
        schema
      )

      const stateTransition = sdk.dataContracts.createStateTransition(
        dataContract,
        'create',
        nextNonce
      )

      await signer.signAndBroadcast(stateTransition)

      setResult({ dataContractId: dataContract.id.base58() })
    } catch (e) {
      setError(e.message ?? 'Failed to deploy contract')
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
