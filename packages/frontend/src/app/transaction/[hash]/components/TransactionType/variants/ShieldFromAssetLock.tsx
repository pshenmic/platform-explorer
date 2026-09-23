import { AssetLockProof } from '../AssetLockProof'
import { InfoLine, NotActive } from '@components/data'
import { ShieldedActions, AmountInfoLine, HashInfoLine, OutputAddressLine } from '../ShieldedCommon'
import type {
  AssetLockProofData,
  DecodedStateTransition,
  ShieldedAction,
  WithRate
} from '../../types'

interface ShieldFromAssetLockProps extends WithRate {
  assetLockProof?: AssetLockProofData | null
  actions?: ShieldedAction[]
  valueBalance?: number | string | null
  surplusOutput?: DecodedStateTransition['surplusOutput']
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
  signature?: string | null
}

export const ShieldFromAssetLock = ({
  assetLockProof,
  actions = [],
  valueBalance,
  surplusOutput,
  anchor,
  proof,
  bindingsSignature,
  signature,
  rate
}: ShieldFromAssetLockProps) => (
  <>
    <AmountInfoLine title="Value Balance" amount={valueBalance} rate={rate} />
    {surplusOutput?.platformAddress?.bech32m ? (
      <OutputAddressLine title="Surplus Output" outputAddress={surplusOutput} />
    ) : (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title="Surplus Output"
        value={<NotActive>{surplusOutput === null ? 'Not specified' : 'Unavailable'}</NotActive>}
      />
    )}
    {assetLockProof && <AssetLockProof assetLockProof={assetLockProof} />}
    <ShieldedActions actions={actions} />
    <HashInfoLine title="Anchor" value={anchor} />
    <HashInfoLine title="Bindings Signature" value={bindingsSignature} />
    <HashInfoLine title="Signature" value={signature} />
    <HashInfoLine title="Proof" value={proof} />
  </>
)
