import { ShieldedTokenDetails } from '@components/transactions/ShieldedTokenDetails'
import type { ShieldedTokenPayload } from 'src/types/ShieldedTransaction'

export function TokenPurchaseFromShieldedPool(props: ShieldedTokenPayload) {
  return <ShieldedTokenDetails type="TOKEN_PURCHASE_FROM_SHIELDED_POOL" payload={props} />
}
