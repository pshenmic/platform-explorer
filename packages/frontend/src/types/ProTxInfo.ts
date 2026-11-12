// Mirrors packages/api/src/models/ProTxInfo.js
export interface ProTxState extends Record<string, unknown> {
  registeredHeight?: number | null
  PoSeBanHeight?: number | null
  PoSeRevivedHeight?: number | null
  PoSePenalty?: number | null
  ownerAddress?: string | null
  votingAddress?: string | null
  payoutAddress?: string | null
  pubKeyOperator?: string | null
  platformNodeID?: string | null
}

export interface ProTxInfo {
  type: string | null
  collateralHash: string | null
  collateralIndex: number | null
  collateralAddress: string | null
  operatorReward: number | null
  confirmations: number | null
  state: ProTxState | null
}
