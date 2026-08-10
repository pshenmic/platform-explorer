import {
  ShieldedActions,
  AmountInfoLine,
  OutputAddressLine,
  HashInfoLine
} from '../ShieldedCommon'
import type { DecodedOutputAddress, ShieldedAction, WithRate } from '../../types'

interface UnshieldProps extends WithRate {
  outputAddress?: DecodedOutputAddress
  actions?: ShieldedAction[]
  unshieldingAmount?: number | string | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
}

export const Unshield = ({
  outputAddress,
  actions = [],
  unshieldingAmount,
  anchor,
  proof,
  bindingsSignature,
  rate
}: UnshieldProps) => (
  <>
    <AmountInfoLine title='Unshielding Amount' amount={unshieldingAmount} rate={rate} />
    <OutputAddressLine outputAddress={outputAddress} />
    <ShieldedActions actions={actions} />
    <HashInfoLine title='Anchor' value={anchor} />
    <HashInfoLine title='Bindings Signature' value={bindingsSignature} />
    <HashInfoLine title='Proof' value={proof} />
  </>
)
