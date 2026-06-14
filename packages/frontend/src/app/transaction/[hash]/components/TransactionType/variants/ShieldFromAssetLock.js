import { AssetLockProof } from '../AssetLockProof'
import {
  ShieldedActions,
  AmountInfoLine,
  HashInfoLine
} from '../ShieldedCommon'

/**
 * Displays details for a Shield From Asset Lock transaction
 * (Core L1 asset lock -> shielded pool).
 *
 * @param {Object} props
 * @param {Object} [props.assetLockProof]
 * @param {Array} [props.actions]
 * @param {number} [props.valueBalance]
 * @param {string} [props.anchor]
 * @param {string} [props.proof]
 * @param {string} [props.bindingsSignature]
 * @param {Object} [props.surplusOutput]
 * @param {string} [props.signature]
 * @param {string} [props.raw]
 * @param {Object} [props.rate]
 * @returns {JSX.Element}
 */
export const ShieldFromAssetLock = ({
  assetLockProof,
  actions = [],
  valueBalance,
  anchor,
  proof,
  bindingsSignature,
  signature,
  raw,
  rate
}) => (
  <>
    <AmountInfoLine title='Value Balance' amount={valueBalance} rate={rate} />
    {assetLockProof && <AssetLockProof assetLockProof={assetLockProof} />}
    <ShieldedActions actions={actions} />
    <HashInfoLine title='Anchor' value={anchor} />
    <HashInfoLine title='Bindings Signature' value={bindingsSignature} />
    <HashInfoLine title='Signature' value={signature} />
    <HashInfoLine title='Proof' value={proof} />
    <HashInfoLine title='Raw Transaction' value={raw} />
  </>
)
