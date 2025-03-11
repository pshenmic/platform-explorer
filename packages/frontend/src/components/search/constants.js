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

export const SINGULAR_CATEGORY_NAMES = {
  [ENTITY_TYPES.TRANSACTION]: 'Transaction',
  [ENTITY_TYPES.DATA_CONTRACT]: 'Data Contract',
  [ENTITY_TYPES.DOCUMENT]: 'Document',
  [ENTITY_TYPES.IDENTITY]: 'Identity',
  [ENTITY_TYPES.BLOCK]: 'Block',
  [ENTITY_TYPES.VALIDATOR]: 'Validator'
}

export const PLURAL_CATEGORY_NAMES = {
  transactions: 'Transactions',
  dataContracts: 'Data Contracts',
  documents: 'Documents',
  identities: 'Identities',
  blocks: 'Blocks',
  validators: 'Validators'
}

export const MODIFIER_MAP = {
  [ENTITY_TYPES.TRANSACTION]: 'Transaction',
  [ENTITY_TYPES.DATA_CONTRACT]: 'DataContract',
  [ENTITY_TYPES.DOCUMENT]: 'Document',
  [ENTITY_TYPES.IDENTITY]: 'Identity',
  [ENTITY_TYPES.BLOCK]: 'Block',
  [ENTITY_TYPES.VALIDATOR]: 'Validator'
}
