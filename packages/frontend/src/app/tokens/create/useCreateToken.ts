'use client'

import { useState } from 'react'
import type { Signer } from 'src/hooks/useSigner'
import { buildTokenConfigurationWasm, calculateTokenId } from './buildTokenConfigurationWasm'
import type { TokenForm } from './TokenWizardContext'
import { humanizeDeployError } from './validation'

export type CreateTokenResult = {
  dataContractId: string
  tokenId: string
}

export type UseCreateTokenReturn = {
  submit: (params: { form: TokenForm, signer: Signer | null | undefined }) => Promise<void>
  reset: () => void
  isLoading: boolean
  error: string | null
  result: CreateTokenResult | null
}

export const useCreateToken = (): UseCreateTokenReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateTokenResult | null>(null)

  const submit = async ({ form, signer }: { form: TokenForm, signer: Signer | null | undefined }) => {
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
      // Cast tokens array: WASM config is built from pshenmic-dpp/wasm (weak types).
      const dataContract = sdk.dataContracts.create(
        signer.identityId,
        nextNonce,
        schema,
        true,
        [{ position: 0, tokenConfiguration }] as Parameters<typeof sdk.dataContracts.create>[4]
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
