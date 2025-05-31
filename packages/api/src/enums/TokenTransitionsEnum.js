const TokenTransitionsEnum = {
  Burn: 0,
  Mint: 1,
  Transfer: 2,
  Freeze: 3,
  Unfreeze: 4,
  DestroyFrozenFunds: 5,
  Claim: 6,
  EmergencyAction: 7,
  ConfigUpdate: 8,
  DirectPurchase: 9,
  SetPriceForDirectPurchase: 10
}

module.exports = TokenTransitionsEnum
