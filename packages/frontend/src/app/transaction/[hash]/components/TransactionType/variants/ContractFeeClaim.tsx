import { DetailLine, EntityLine } from '@components/transactions/TransactionDetails'

interface ContractFeeClaimProps {
  dataContractId?: string | null
  ownerId?: string | null
  identityContractNonce?: string | number | null
  pot?: string | null
}

export function ContractFeeClaim({
  dataContractId,
  ownerId,
  identityContractNonce,
  pot
}: ContractFeeClaimProps) {
  return (
    <>
      <EntityLine title="Data Contract" identifier={dataContractId} entity="dataContract" />
      <EntityLine title="Actor" identifier={ownerId} entity="identity" />
      <DetailLine title="Identity Contract Nonce">{identityContractNonce}</DetailLine>
      <DetailLine title="Fee Pot">{pot}</DetailLine>
    </>
  )
}
