import { ShieldedActions, AmountInfoLine, HashInfoLine } from '../ShieldedCommon'
import type { ShieldedAction, WithRate } from '../../types'

interface ShieldedTransferProps extends WithRate {
  actions?: ShieldedAction[]
  valueBalance?: number | string | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
}

export const ShieldedTransfer = ({
  actions = [],
  valueBalance,
  anchor,
  proof,
  bindingsSignature,
  rate
}: ShieldedTransferProps) => (
  <>
    <AmountInfoLine title="Value Balance" amount={valueBalance} rate={rate} />
    <ShieldedActions actions={actions} />
    <HashInfoLine title="Anchor" value={anchor} />
    <HashInfoLine title="Bindings Signature" value={bindingsSignature} />
    <HashInfoLine title="Proof" value={proof} />
  </>
)
