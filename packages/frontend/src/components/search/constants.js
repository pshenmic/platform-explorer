export const entityTypes = {
  transaction: 'transaction',
  block: 'block',
  identity: 'identity',
  validator: 'validator',
  dataContract: 'dataContract',
  document: 'document',
  loading: 'loading'
}

export const categoryMap = {
  transactions: entityTypes.transaction,
  dataContracts: entityTypes.dataContract,
  documents: entityTypes.document,
  identities: entityTypes.identity,
  blocks: entityTypes.block,
  validators: entityTypes.validator
}

export const singularCategoryNames = {
  [entityTypes.transaction]: 'Transaction',
  [entityTypes.dataContract]: 'Data Contract',
  [entityTypes.document]: 'Document',
  [entityTypes.identity]: 'Identity',
  [entityTypes.block]: 'Block',
  [entityTypes.validator]: 'Validator'
}

export const pluralCategoryNames = {
  transactions: 'Transactions',
  dataContracts: 'Data Contracts',
  documents: 'Documents',
  identities: 'Identities',
  blocks: 'Blocks',
  validators: 'Validators'
}

export const modifierMap = {
  [entityTypes.transaction]: 'Transaction',
  [entityTypes.dataContract]: 'DataContract',
  [entityTypes.document]: 'Document',
  [entityTypes.identity]: 'Identity',
  [entityTypes.block]: 'Block',
  [entityTypes.validator]: 'Validator'
}
