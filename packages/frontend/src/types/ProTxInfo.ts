// Mirrors packages/api/src/models/ProTxInfo.js
// `state` is the raw Dash Core protx state object (large nested shape from
// `protx info`). Keep as opaque record until a consumer actually needs it.

export type ProTxState = Record<string, unknown>

export interface ProTxInfo {
  type: string | null
  collateralHash: string | null
  collateralIndex: number | null
  collateralAddress: string | null
  operatorReward: number | null
  confirmations: number | null
  state: ProTxState | null
}
