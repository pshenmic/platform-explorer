'use client'

import { useState } from 'react'
import { buildTokenConfigurationWasm, calculateTokenId } from './buildTokenConfigurationWasm'
import { humanizeDeployError } from './validation'

export const useCreateToken = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const submit = async ({ form, signer }) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!signer?.identityId || !signer?.sdk) {
        throw new Error('No signer connected')
      }

      const tokenConfiguration = await buildTokenConfigurationWasm(form)

      const { sdk } = signer
      // SDK accepts a string id — no need to fetch the identity.
      const identityNonce = await sdk.identities.getIdentityNonce(signer.identityId)
      const nextNonce = identityNonce + BigInt(1)

      const schema = {}

      // create() arg order is (ownerId, nonce, schema, fullValidation, tokens[]) — see pshenmic/dash-platform-sdk#76.
      const dataContract = sdk.dataContracts.create(
        signer.identityId,
        nextNonce,
        schema,
        true,
        [{ position: 0, tokenConfiguration }]
      )

      const stateTransition = sdk.dataContracts.createStateTransition(
        dataContract,
        'create',
        nextNonce
      )

      await signer.signAndBroadcast(stateTransition)

      const dataContractId = dataContract.id.base58()
      const tokenIdWasm = await calculateTokenId(dataContract.id, 0)
      const tokenId = tokenIdWasm.base58()

      setResult({ dataContractId, tokenId })
    } catch (e) {
      console.error('Token deploy failed:', e)
      setError(humanizeDeployError(e))
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
