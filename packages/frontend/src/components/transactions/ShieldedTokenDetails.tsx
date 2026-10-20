'use client'

import { skipToken, useQuery } from '@tanstack/react-query'
import { getToken } from '../../util/Api'
import type { ShieldedTokenPayload } from '../../types/ShieldedTransaction'
import { formatTransactionAmount } from '../../util/transactionAmounts'
import { CreditsLine, DetailLine, EntityLine, ProofDetails } from './TransactionDetails'

export const SHIELDED_TOKEN_BATCH_TYPES = [
  'TOKEN_SHIELD',
  'TOKEN_UNSHIELD',
  'TOKEN_SHIELDED_TRANSFER',
  'TOKEN_MINT_TO_POOL',
  'TOKEN_BURN_FROM_POOL',
  'TOKEN_CLAIM_TO_POOL',
  'TOKEN_DIRECT_PURCHASE_TO_POOL'
] as const

export function ShieldedTokenDetails({
  type,
  payload
}: {
  type: string
  payload: ShieldedTokenPayload
}) {
  const tokenId = payload.tokenId
  const { data: token } = useQuery({
    queryKey: ['token', tokenId],
    queryFn: tokenId ? () => getToken(tokenId) : skipToken,
    staleTime: 60_000,
    retry: false
  })

  const decimals = token?.decimals
  const knownDecimals =
    decimals != null && Number.isInteger(decimals) && decimals >= 0 && decimals <= 18
  const amount = type === 'TOKEN_BURN_FROM_POOL' ? payload.burnAmount : payload.amount
  const formatted = formatTransactionAmount(amount, knownDecimals ? decimals : 0)
  const privateAmount =
    type === 'TOKEN_SHIELDED_TRANSFER' || type === 'TOKEN_SHIELDED_TRANSFER_WITH_SHIELDED_FEE'

  return (
    <>
      <EntityLine title="Token" identifier={tokenId} entity="token" />
      <EntityLine title="Data Contract" identifier={payload.dataContractId} entity="dataContract" />
      <DetailLine title="Token Contract Position">{payload.tokenContractPosition}</DetailLine>
      <DetailLine title={type === 'TOKEN_BURN_FROM_POOL' ? 'Burn Amount' : 'Token Amount'}>
        {formatted != null
          ? `${formatted} ${knownDecimals ? 'tokens' : 'base units'}`
          : privateAmount
            ? 'Private'
            : 'Unavailable'}
      </DetailLine>
      {(payload.recipient ?? payload.recipientId) != null && (
        <EntityLine
          title="Recipient"
          identifier={payload.recipient ?? payload.recipientId}
          entity="identity"
        />
      )}
      {payload.identityContractNonce != null && (
        <DetailLine title="Identity Contract Nonce">{payload.identityContractNonce}</DetailLine>
      )}
      {payload.totalAgreedPrice != null && (
        <CreditsLine title="Total Agreed Price" amount={payload.totalAgreedPrice} />
      )}
      {payload.creditAmount != null && (
        <CreditsLine title="Credit Amount" amount={payload.creditAmount} />
      )}
      {payload.publicNote != null && (
        <DetailLine title="Public Note">{payload.publicNote}</DetailLine>
      )}
      {payload.distributionType != null && (
        <DetailLine title="Distribution Type">{payload.distributionType}</DetailLine>
      )}
      {payload.claimUpTo != null && (
        <DetailLine title="Claim Up To">{payload.claimUpTo}</DetailLine>
      )}
      <ProofDetails
        actions={payload.actions}
        anchor={payload.anchor}
        proof={payload.proof}
        bindingsSignature={payload.bindingsSignature}
      />
      <ProofDetails
        title="Token proof data"
        actions={payload.tokenActions}
        anchor={payload.tokenAnchor}
        proof={payload.tokenProof}
        bindingsSignature={payload.tokenBindingSignature}
      />
      <ProofDetails
        title="Fee proof data"
        actions={payload.feeActions}
        anchor={payload.feeAnchor}
        proof={payload.feeProof}
        bindingsSignature={payload.feeBindingSignature}
      />
    </>
  )
}
