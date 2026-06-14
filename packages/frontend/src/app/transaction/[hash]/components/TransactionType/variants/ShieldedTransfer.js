import { ShieldedActions, AmountInfoLine, HashInfoLine } from '../ShieldedCommon'

/**
 * Displays details for a Shielded Transfer transaction (private -> private).
 *
 * @param {Object} props
 * @param {Array} [props.actions]
 * @param {number} [props.valueBalance]
 * @param {string} [props.anchor]
 * @param {string} [props.proof]
 * @param {string} [props.bindingsSignature]
 * @param {string} [props.raw]
 * @param {Object} [props.rate]
 * @returns {JSX.Element}
 */
export const ShieldedTransfer = ({
  actions = [],
  valueBalance,
  anchor,
  proof,
  bindingsSignature,
  raw,
  rate
}) => (
  <>
    <AmountInfoLine title='Value Balance' amount={valueBalance} rate={rate} />
    <ShieldedActions actions={actions} />
    <HashInfoLine title='Anchor' value={anchor} />
    <HashInfoLine title='Bindings Signature' value={bindingsSignature} />
    <HashInfoLine title='Proof' value={proof} />
    <HashInfoLine title='Raw Transaction' value={raw} />
  </>
)
