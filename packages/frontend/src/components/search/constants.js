export const entityTypes = {
  transaction: 'transaction',
  block: 'block',
  identity: 'identity',
  validator: 'validator',
  dataContract: 'dataContract',
  document: 'document',
  token: 'token',
  platformAddress: 'platformAddress',
  loading: 'loading'
}

export const categoryMap = {
  transactions: entityTypes.transaction,
  dataContracts: entityTypes.dataContract,
  documents: entityTypes.document,
  identities: entityTypes.identity,
  blocks: entityTypes.block,
  validators: entityTypes.validator,
  tokens: entityTypes.token,
  platformAddresses: entityTypes.platformAddress
}

export const singularCategoryNames = {
  [entityTypes.transaction]: 'Transaction',
  [entityTypes.dataContract]: 'Data Contract',
  [entityTypes.document]: 'Document',
  [entityTypes.identity]: 'Identity',
  [entityTypes.block]: 'Block',
  [entityTypes.validator]: 'Validator',
  [entityTypes.token]: 'Token',
  [entityTypes.platformAddress]: 'Platform Address'
}

export const pluralCategoryNames = {
  transactions: 'Transactions',
  dataContracts: 'Data Contracts',
  documents: 'Documents',
  identities: 'Identities',
  blocks: 'Blocks',
  validators: 'Validators',
  tokens: 'Tokens',
  platformAddresses: 'Platform Addresses'
}

export const modifierMap = {
  [entityTypes.transaction]: 'Transaction',
  [entityTypes.dataContract]: 'DataContract',
  [entityTypes.document]: 'Document',
  [entityTypes.identity]: 'Identity',
  [entityTypes.block]: 'Block',
  [entityTypes.validator]: 'Validator',
  [entityTypes.token]: 'Token',
  [entityTypes.platformAddress]: 'PlatformAddress'
}
