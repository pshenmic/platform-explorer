import {
  CreditsLine,
  DetailLine,
  EntityLine,
  ProofDetails
} from '@components/transactions/TransactionDetails'
import type { ShieldedPayload } from 'src/types/ShieldedTransaction'

interface IdentityTopUpFromShieldedPoolProps extends ShieldedPayload {
  identityId?: string | null
  identityNonce?: string | number | null
  topUpAmount?: string | number | null
}

export function IdentityTopUpFromShieldedPool({
  identityId,
  identityNonce,
  topUpAmount,
  ...proof
}: IdentityTopUpFromShieldedPoolProps) {
  return (
    <>
      <EntityLine title="Identity" identifier={identityId} entity="identity" />
      {identityNonce != null && <DetailLine title="Identity Nonce">{identityNonce}</DetailLine>}
      <CreditsLine title="Amount" amount={topUpAmount} />
      <ProofDetails
        actions={proof.actions}
        anchor={proof.anchor}
        proof={proof.proof}
        bindingsSignature={proof.bindingsSignature}
      />
    </>
  )
}
