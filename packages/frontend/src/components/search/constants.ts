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
} as const

export type EntityType = (typeof entityTypes)[keyof typeof entityTypes]

export type SearchCategory =
  | 'transactions'
  | 'dataContracts'
  | 'documents'
  | 'identities'
  | 'blocks'
  | 'validators'
  | 'tokens'
  | 'platformAddresses'

export const categoryMap: Record<SearchCategory, EntityType> = {
  transactions: entityTypes.transaction,
  dataContracts: entityTypes.dataContract,
  documents: entityTypes.document,
  identities: entityTypes.identity,
  blocks: entityTypes.block,
  validators: entityTypes.validator,
  tokens: entityTypes.token,
  platformAddresses: entityTypes.platformAddress
}

export const singularCategoryNames: Record<EntityType, string> = {
  [entityTypes.transaction]: 'Transaction',
  [entityTypes.dataContract]: 'Data Contract',
  [entityTypes.document]: 'Document',
  [entityTypes.identity]: 'Identity',
  [entityTypes.block]: 'Block',
  [entityTypes.validator]: 'Validator',
  [entityTypes.token]: 'Token',
  [entityTypes.platformAddress]: 'Platform Address',
  [entityTypes.loading]: 'Loading'
}

export const pluralCategoryNames: Record<SearchCategory, string> = {
  transactions: 'Transactions',
  dataContracts: 'Data Contracts',
  documents: 'Documents',
  identities: 'Identities',
  blocks: 'Blocks',
  validators: 'Validators',
  tokens: 'Tokens',
  platformAddresses: 'Platform Addresses'
}

export const modifierMap: Partial<Record<EntityType, string>> = {
  [entityTypes.transaction]: 'Transaction',
  [entityTypes.dataContract]: 'DataContract',
  [entityTypes.document]: 'Document',
  [entityTypes.identity]: 'Identity',
  [entityTypes.block]: 'Block',
  [entityTypes.validator]: 'Validator',
  [entityTypes.token]: 'Token',
  [entityTypes.platformAddress]: 'PlatformAddress'
}
