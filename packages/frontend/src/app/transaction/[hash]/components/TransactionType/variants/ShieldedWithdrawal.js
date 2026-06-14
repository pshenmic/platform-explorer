import { InfoLine } from '@components/data'
import {
  ShieldedActions,
  AmountInfoLine,
  OutputAddressLine,
  HashInfoLine
} from '../ShieldedCommon'

/**
 * Displays details for a Shielded Withdrawal transaction
 * (shielded pool -> Core L1 Dash address).
 *
 * @param {Object} props
 * @param {Array} [props.actions]
 * @param {number} [props.unshieldingAmount]
 * @param {string} [props.anchor]
 * @param {string} [props.proof]
 * @param {string} [props.bindingsSignature]
 * @param {number} [props.coreFeePerByte]
 * @param {string} [props.pooling]
 * @param {string} [props.outputAddress] - Plain address string.
 * @param {string} [props.outputScript]
 * @param {Object} [props.rate]
 * @returns {JSX.Element}
 */
export const ShieldedWithdrawal = ({
  actions = [],
  unshieldingAmount,
  anchor,
  proof,
  bindingsSignature,
  coreFeePerByte,
  pooling,
  outputAddress,
  outputScript,
  rate
}) => (
  <>
    <AmountInfoLine title='Unshielding Amount' amount={unshieldingAmount} rate={rate} />

    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
      title='Core Fee Per Byte'
      value={coreFeePerByte}
      error={coreFeePerByte === undefined}
    />

    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
      title='Pooling'
      value={pooling}
      error={pooling === undefined}
    />

    <OutputAddressLine outputAddress={outputAddress} />
    <HashInfoLine title='Output Script' value={outputScript} />
    <ShieldedActions actions={actions} />
    <HashInfoLine title='Anchor' value={anchor} />
    <HashInfoLine title='Bindings Signature' value={bindingsSignature} />
    <HashInfoLine title='Proof' value={proof} />
  </>
)
