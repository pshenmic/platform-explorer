import { InfoLine } from '@components/data'
import {
  ShieldedActions,
  InputsLine,
  InputWitnessesLine,
  FeeStrategyLine,
  AmountInfoLine,
  HashInfoLine
} from '../ShieldedCommon'

/**
 * Displays details for a Shield transaction (transparent -> shielded pool).
 *
 * @param {Object} props
 * @param {number} [props.userFeeIncrease]
 * @param {Array} [props.inputs]
 * @param {Array} [props.inputWitnesses]
 * @param {Array} [props.actions]
 * @param {number} [props.amount]
 * @param {string} [props.anchor]
 * @param {string} [props.proof]
 * @param {string} [props.bindingsSignature]
 * @param {Array} [props.feeStrategy]
 * @param {Object} [props.rate]
 * @returns {JSX.Element}
 */
export const Shield = ({
  userFeeIncrease,
  inputs = [],
  inputWitnesses = [],
  actions = [],
  amount,
  anchor,
  proof,
  bindingsSignature,
  feeStrategy = [],
  rate
}) => (
  <>
    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
      title='User Fee Increase'
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />

    <AmountInfoLine title='Amount' amount={amount} rate={rate} />
    <InputsLine inputs={inputs} />
    <InputWitnessesLine inputWitnesses={inputWitnesses} />
    <ShieldedActions actions={actions} />
    <HashInfoLine title='Anchor' value={anchor} />
    <HashInfoLine title='Bindings Signature' value={bindingsSignature} />
    <FeeStrategyLine feeStrategy={feeStrategy} />
    <HashInfoLine title='Proof' value={proof} />
  </>
)
