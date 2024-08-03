module.exports = class ProTxInfo {
  type
  collateralHash
  collateralIndex
  collateralAddress
  operatorReward
  confirmations
  state

  constructor (
    type, collateralHash,
    collateralIndex,
    collateralAddress,
    operatorReward, confirmations,
    state
  ) {
    this.type = type ?? null
    this.collateralHash = collateralHash ?? null
    this.collateralIndex = collateralIndex ?? null
    this.collateralAddress = collateralAddress ?? null
    this.operatorReward = operatorReward ?? null
    this.confirmations = confirmations ?? null
    this.state = state ?? null
  }

  static fromObject ({
    type, collateralHash,
    collateralIndex,
    collateralAddress,
    operatorReward, confirmations,
    state
  }) {
    return new ProTxInfo(
      type, collateralHash,
      collateralIndex,
      collateralAddress,
      operatorReward,
      confirmations, state)
  }
}
