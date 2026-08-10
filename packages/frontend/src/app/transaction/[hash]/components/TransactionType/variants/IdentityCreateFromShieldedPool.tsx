import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { AssetLockProof } from '../AssetLockProof'
import {
  ShieldedActions,
  AmountInfoLine,
  HashInfoLine
} from '../ShieldedCommon'
import type { AssetLockProofData, ShieldedAction, WithRate } from '../../types'

interface IdentityCreateFromShieldedPoolProps extends WithRate {
  identityId?: string | null
  assetLockProof?: AssetLockProofData | null
  actions?: ShieldedAction[]
  amount?: number | string | null
  valueBalance?: number | string | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
  signature?: string | null
}

export const IdentityCreateFromShieldedPool = ({
  identityId,
  assetLockProof,
  actions = [],
  amount,
  valueBalance,
  anchor,
  proof,
  bindingsSignature,
  signature,
  rate
}: IdentityCreateFromShieldedPoolProps) => (
  <>
    {identityId && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Identity'
        value={
          <ValueCard link={`/identity/${identityId}`}>
            <Identifier avatar copyButton ellipsis styles={['highlight-both']}>
              {identityId}
            </Identifier>
          </ValueCard>
        }
      />
    )}

    <AmountInfoLine title='Amount' amount={amount} rate={rate} />
    <AmountInfoLine title='Value Balance' amount={valueBalance} rate={rate} />
    {assetLockProof && <AssetLockProof assetLockProof={assetLockProof} />}
    <ShieldedActions actions={actions} />
    <HashInfoLine title='Anchor' value={anchor} />
    <HashInfoLine title='Bindings Signature' value={bindingsSignature} />
    <HashInfoLine title='Signature' value={signature} />
    <HashInfoLine title='Proof' value={proof} />
  </>
)
