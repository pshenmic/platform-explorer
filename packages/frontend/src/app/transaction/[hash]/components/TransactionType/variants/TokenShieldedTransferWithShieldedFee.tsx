import { ShieldedTokenDetails } from '@components/transactions/ShieldedTokenDetails'
import type { ShieldedTokenPayload } from 'src/types/ShieldedTransaction'

export function TokenShieldedTransferWithShieldedFee(props: ShieldedTokenPayload) {
  return <ShieldedTokenDetails type="TOKEN_SHIELDED_TRANSFER_WITH_SHIELDED_FEE" payload={props} />
}
