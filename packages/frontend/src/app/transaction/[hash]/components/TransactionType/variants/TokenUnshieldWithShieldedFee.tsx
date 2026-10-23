import { ShieldedTokenDetails } from '@components/transactions/ShieldedTokenDetails'
import type { ShieldedTokenPayload } from 'src/types/ShieldedTransaction'

export function TokenUnshieldWithShieldedFee(props: ShieldedTokenPayload) {
  return <ShieldedTokenDetails type="TOKEN_UNSHIELD_WITH_SHIELDED_FEE" payload={props} />
}
