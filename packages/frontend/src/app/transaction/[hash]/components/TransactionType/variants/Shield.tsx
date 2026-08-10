import { InfoLine } from '@components/data'
import {
  ShieldedActions,
  InputsLine,
  InputWitnessesLine,
  FeeStrategyLine,
  AmountInfoLine,
  HashInfoLine
} from '../ShieldedCommon'
import type {
  DecodedFeeStrategy,
  DecodedInputWitness,
  DecodedTxInput,
  ShieldedAction,
  WithRate
} from '../../types'

interface ShieldProps extends WithRate {
  userFeeIncrease?: number | null
  inputs?: DecodedTxInput[]
  inputWitnesses?: DecodedInputWitness[]
  actions?: ShieldedAction[]
  amount?: number | string | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
  feeStrategy?: DecodedFeeStrategy[]
}

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
}: ShieldProps) => (
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
