import { AssetLockProof } from '../AssetLockProof'
import { ShieldedActions, AmountInfoLine, HashInfoLine } from '../ShieldedCommon'
import type { AssetLockProofData, ShieldedAction, WithRate } from '../../types'

interface ShieldFromAssetLockProps extends WithRate {
  assetLockProof?: AssetLockProofData | null
  actions?: ShieldedAction[]
  valueBalance?: number | string | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
  signature?: string | null
}

export const ShieldFromAssetLock = ({
  assetLockProof,
  actions = [],
  valueBalance,
  anchor,
  proof,
  bindingsSignature,
  signature,
  rate
}: ShieldFromAssetLockProps) => (
  <>
    <AmountInfoLine title="Value Balance" amount={valueBalance} rate={rate} />
    {assetLockProof && <AssetLockProof assetLockProof={assetLockProof} />}
    <ShieldedActions actions={actions} />
    <HashInfoLine title="Anchor" value={anchor} />
    <HashInfoLine title="Bindings Signature" value={bindingsSignature} />
    <HashInfoLine title="Signature" value={signature} />
    <HashInfoLine title="Proof" value={proof} />
  </>
)
