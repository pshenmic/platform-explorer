export const ENTITY_TYPES = {
  TRANSACTION: 'transaction',
  BLOCK: 'block',
  IDENTITY: 'identity',
  VALIDATOR: 'validator',
  DATA_CONTRACT: 'dataContract',
  DOCUMENT: 'document',
  LOADING: 'loading'
}

export const CATEGORY_MAP = {
  transactions: ENTITY_TYPES.TRANSACTION,
  dataContracts: ENTITY_TYPES.DATA_CONTRACT,
  documents: ENTITY_TYPES.DOCUMENT,
  identities: ENTITY_TYPES.IDENTITY,
  blocks: ENTITY_TYPES.BLOCK,
  validators: ENTITY_TYPES.VALIDATOR
}
