const DocumentActionEnum = require('./DocumentActionEnum')

const BatchEnum = {
  DOCUMENT_CREATE: 0,
  DOCUMENT_REPLACE: 1,
  DOCUMENT_DELETE: 2,
  DOCUMENT_TRANSFER: 3,
  DOCUMENT_UPDATE_PRICE: 4,
  DOCUMENT_PURCHASE: 5,
  TOKEN_BURN: 6,
  TOKEN_MINT: 7,
  TOKEN_TRANSFER: 8,
  TOKEN_FREEZE: 9,
  TOKEN_UNFREEZE: 10,
  TOKEN_DESTROY_FROZEN_FUNDS: 11,
  TOKEN_CLAIM: 12,
  TOKEN_EMERGENCY_ACTION: 13,
  TOKEN_CONFIG_UPDATE: 14,
  TOKEN_DIRECT_PURCHASE: 15,
  TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE: 16,
  DOCUMENT_INDEX_ONLY_DELETE: 17,
  TOKEN_SHIELD: 18,
  TOKEN_MINT_TO_POOL: 19,
  TOKEN_BURN_FROM_POOL: 20,
  TOKEN_CLAIM_TO_POOL: 21,
  TOKEN_DIRECT_PURCHASE_TO_POOL: 22,
  TOKEN_UNSHIELD: 23,
  TOKEN_SHIELDED_TRANSFER: 24,
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
  16: 'TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE',
  17: 'DOCUMENT_INDEX_ONLY_DELETE',
  18: 'TOKEN_SHIELD',
  19: 'TOKEN_MINT_TO_POOL',
  20: 'TOKEN_BURN_FROM_POOL',
  21: 'TOKEN_CLAIM_TO_POOL',
  22: 'TOKEN_DIRECT_PURCHASE_TO_POOL',
  23: 'TOKEN_UNSHIELD',
  24: 'TOKEN_SHIELDED_TRANSFER'
}

// pshenmic-dpp remap documents
BatchEnum.create = BatchEnum[0]
BatchEnum.replace = BatchEnum[1]
BatchEnum.delete = BatchEnum[2]
BatchEnum.transfer = BatchEnum[3]
BatchEnum.updatePrice = BatchEnum[4]
BatchEnum.purchase = BatchEnum[5]
BatchEnum.IndexOnlyDelete = BatchEnum[17]
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
BatchEnum.Shield = BatchEnum[18]
BatchEnum.MintToPool = BatchEnum[19]
BatchEnum.BurnFromPool = BatchEnum[20]
BatchEnum.ClaimToPool = BatchEnum[21]
BatchEnum.DirectPurchaseToPool = BatchEnum[22]
BatchEnum.Unshield = BatchEnum[23]
BatchEnum.ShieldedTransfer = BatchEnum[24]

// documents keep the dpp action number, index only delete is 7 there, which is TOKEN_MINT here
BatchEnum.fromDocumentAction = (actionTypeNumber) => actionTypeNumber === DocumentActionEnum.IndexOnlyDelete
  ? BatchEnum.IndexOnlyDelete
  : BatchEnum[actionTypeNumber]

module.exports = BatchEnum
