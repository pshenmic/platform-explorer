import {
  CreditsLine,
  DetailLine,
  EntityLine,
  TimestampLine
} from '@components/transactions/TransactionDetails'

interface IdentityKeyLimitsUpdateProps {
  identityId?: string | null
  identityNonce?: string | number | null
  keyId?: number | null
  totalBudget?: string | number | null
  expiresAt?: string | number | null
}

export function IdentityKeyLimitsUpdate({
  identityId,
  identityNonce,
  keyId,
  totalBudget,
  expiresAt
}: IdentityKeyLimitsUpdateProps) {
  return (
    <>
      <EntityLine title="Identity" identifier={identityId} entity="identity" />
      {identityNonce != null && <DetailLine title="Identity Nonce">{identityNonce}</DetailLine>}
      <DetailLine title="Key ID">{keyId}</DetailLine>
      {totalBudget === null ? (
        <DetailLine title="New Total Budget">Unchanged</DetailLine>
      ) : (
        <CreditsLine title="New Total Budget" amount={totalBudget} />
      )}
      {expiresAt === null ? (
        <DetailLine title="New Expiry">Unchanged</DetailLine>
      ) : (
        <TimestampLine title="New Expiry" timestamp={expiresAt} />
      )}
    </>
  )
}
