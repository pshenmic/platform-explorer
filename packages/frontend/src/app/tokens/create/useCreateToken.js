'use client'

import { useState } from 'react'
import { buildTokenConfigurationWasm, calculateTokenId } from './buildTokenConfigurationWasm'

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
      const identity = await sdk.identities.getIdentityByIdentifier(signer.identityId)
      const identityNonce = await sdk.identities.getIdentityNonce(identity.id)
      const nextNonce = identityNonce + BigInt(1)

      // Placeholder document type. Required because pshenmic-dpp's NAPI
      // constructor builds the contract value WITHOUT the tokens field and
      // runs DPP structural validation before attaching tokens via
      // set_tokens. DPP's "documents OR tokens" check therefore sees an
      // empty contract and fails — the check itself is structural and isn't
      // bypassed by fullValidation: false. Drop this once pshenmic-dpp
      // populates tokens in contract_value before from_value.
      const schema = {
        note: {
          type: 'object',
          properties: {
            message: { type: 'string', maxLength: 256, position: 0 }
          },
          additionalProperties: false
        }
      }

      // DataContractsController.create signature:
      //   (ownerId, identityNonce, schema, fullValidation?, tokenConfiguration?, ...)
      // v2 SDK wrapper expects an array of `{ position, tokenConfiguration }`
      // objects where `tokenConfiguration` is a TokenConfigurationWASM wrapper
      // instance (carries `_rawTokenConfiguration` internally).
      const dataContract = sdk.dataContracts.create(
        identity.id,
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
      setError(e?.message ?? 'Failed to deploy token')
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
