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
  SetPriceForDirectPurchase: 10,

  0: 'Burn',
  1: 'Mint',
  2: 'Transfer',
  3: 'Freeze',
  4: 'Unfreeze',
  5: 'DestroyFrozenFunds',
  6: 'Claim',
  7: 'EmergencyAction',
  8: 'ConfigUpdate',
  9: 'DirectPurchase',
  10: 'SetPriceForDirectPurchase'
}

module.exports = TokenTransitionsEnum
