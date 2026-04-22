import { useState } from 'react'

export const useDataContractCreate = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const submit = async ({ schemaString, currentIdentity }) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!window.dashPlatformExtension || !window.dashPlatformSDK) {
        throw new Error('Dash Platform Extension is required')
      }
      if (!currentIdentity) {
        throw new Error('No identity selected in the extension')
      }

      let schema
      try {
        schema = JSON.parse(schemaString)
      } catch {
        throw new Error('Schema must be valid JSON')
      }

      const sdk = window.dashPlatformSDK

      const identity = await sdk.identities.getIdentityByIdentifier(currentIdentity)
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

      await window.dashPlatformExtension.signer.signAndBroadcast(stateTransition)

      setResult({ dataContractId: dataContract.id.base58() })
    } catch (e) {
      setError(e.message ?? 'Failed to deploy contract')
    } finally {
      setIsLoading(false)
    }
  }

  return { submit, isLoading, error, result }
}
