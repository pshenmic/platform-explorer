import {
  ShieldedActions,
  AmountInfoLine,
  OutputAddressLine,
  HashInfoLine
} from '../ShieldedCommon'

/**
 * Displays details for an Unshield transaction (shielded pool -> transparent).
 *
 * @param {Object} props
 * @param {Object} [props.outputAddress] - Object with nested platformAddress.
 * @param {Array} [props.actions]
 * @param {number} [props.unshieldingAmount]
 * @param {string} [props.anchor]
 * @param {string} [props.proof]
 * @param {string} [props.bindingsSignature]
 * @param {string} [props.raw]
 * @param {Object} [props.rate]
 * @returns {JSX.Element}
 */
export const Unshield = ({
  outputAddress,
  actions = [],
  unshieldingAmount,
  anchor,
  proof,
  bindingsSignature,
  raw,
  rate
}) => (
  <>
    <AmountInfoLine title='Unshielding Amount' amount={unshieldingAmount} rate={rate} />
    <OutputAddressLine outputAddress={outputAddress} />
    <ShieldedActions actions={actions} />
    <HashInfoLine title='Anchor' value={anchor} />
    <HashInfoLine title='Bindings Signature' value={bindingsSignature} />
    <HashInfoLine title='Proof' value={proof} />
    <HashInfoLine title='Raw Transaction' value={raw} />
  </>
)
