import { InfoLine } from '@components/data'
import {
  ShieldedActions,
  AmountInfoLine,
  OutputAddressLine,
  HashInfoLine
} from '../ShieldedCommon'
import type { DecodedOutputAddress, ShieldedAction, WithRate } from '../../types'

interface ShieldedWithdrawalProps extends WithRate {
  actions?: ShieldedAction[]
  unshieldingAmount?: number | string | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
  coreFeePerByte?: number | null
  pooling?: string | number | null
  outputAddress?: DecodedOutputAddress
  outputScript?: string | null
}

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
}: ShieldedWithdrawalProps) => (
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
