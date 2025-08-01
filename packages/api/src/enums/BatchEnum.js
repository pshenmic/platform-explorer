const BatchEnum = {
  DocumentCreate: 0,
  DocumentReplace: 1,
  DocumentDelete: 2,
  DocumentTransfer: 3,
  DocumentUpdatePrice: 4,
  DocumentPurchase: 5,
  TokenBurn: 6,
  TokenMint: 7,
  TokenTransfer: 8,
  TokenFreeze: 9,
  TokenUnfreeze: 10,
  TokenDestroyFrozenFunds: 11,
  TokenClaim: 12,
  TokenEmergencyAction: 13,
  TokenConfigUpdate: 14,
  TokenDirectPurchase: 15,
  TokenSetPriceForDirectPurchase: 16,
  0: 'DOCUMENT_CREATE',
  1: 'DOCUMENT_REPLACE',
  2: 'DOCUMENT_DELETE',
  3: 'DOCUMENT_TRANSFER',
  4: 'DOCUMENT_UPDATE_PRICE',
  5: 'DOCUMENT_PURCHASE',
  6: 'TOKEN_BURN',
  7: 'TOKEN_MINT',
  8: 'TOKEN_TRANSFER',
  9: 'TOKEN_FREEZE',
  10: 'TOKEN_UNFREEZE',
  11: 'TOKEN_DESTROY_FROZEN_FUNDS',
  12: 'TOKEN_CLAIM',
  13: 'TOKEN_EMERGENCY_ACTION',
  14: 'TOKEN_CONFIG_UPDATE',
  15: 'TOKEN_DIRECT_PURCHASE',
  16: 'TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE'
}

// pshenmic-dpp remap documents
BatchEnum.create = BatchEnum[0]
BatchEnum.replace = BatchEnum[1]
BatchEnum.delete = BatchEnum[2]
BatchEnum.transfer = BatchEnum[3]
BatchEnum.updatePrice = BatchEnum[4]
BatchEnum.purchase = BatchEnum[5]
// pshenmic-dpp remap tokens
BatchEnum.Burn = BatchEnum[6]
BatchEnum.Mint = BatchEnum[7]
BatchEnum.Transfer = BatchEnum[8]
BatchEnum.Freeze = BatchEnum[9]
BatchEnum.Unfreeze = BatchEnum[10]
BatchEnum.DestroyFrozenFunds = BatchEnum[11]
BatchEnum.Claim = BatchEnum[12]
BatchEnum.EmergencyAction = BatchEnum[13]
BatchEnum.ConfigUpdate = BatchEnum[14]
BatchEnum.DirectPurchase = BatchEnum[15]
BatchEnum.SetPriceForDirectPurchase = BatchEnum[16]

module.exports = BatchEnum
