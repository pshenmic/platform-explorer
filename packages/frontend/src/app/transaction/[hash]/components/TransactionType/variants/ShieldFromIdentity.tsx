import {
  CreditsLine,
  DetailLine,
  EntityLine,
  ProofDetails
} from '@components/transactions/TransactionDetails'
import type { ShieldedPayload } from 'src/types/ShieldedTransaction'

interface ShieldFromIdentityProps extends ShieldedPayload {
  identityId?: string | null
  identityNonce?: string | number | null
  amount?: string | number | null
}

export function ShieldFromIdentity({
  identityId,
  identityNonce,
  amount,
  ...proof
}: ShieldFromIdentityProps) {
  return (
    <>
      <EntityLine title="Identity" identifier={identityId} entity="identity" />
      {identityNonce != null && <DetailLine title="Identity Nonce">{identityNonce}</DetailLine>}
      <CreditsLine title="Amount" amount={amount} />
      <ProofDetails
        actions={proof.actions}
        anchor={proof.anchor}
        proof={proof.proof}
        bindingsSignature={proof.bindingsSignature}
      />
    </>
  )
}
