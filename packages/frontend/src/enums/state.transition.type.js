export const StateTransitionEnum = {
  DATA_CONTRACT_CREATE: 0,
  BATCH: 1,
  IDENTITY_CREATE: 2,
  IDENTITY_TOP_UP: 3,
  DATA_CONTRACT_UPDATE: 4,
  IDENTITY_UPDATE: 5,
  IDENTITY_CREDIT_WITHDRAWAL: 6,
  IDENTITY_CREDIT_TRANSFER: 7,
  MASTERNODE_VOTE: 8
}

export const TransactionTypesInfo = {
  DATA_CONTRACT_CREATE: {
    title: 'Data Contract Create',
    description: 'Creates a new data contract. This contract defines the schema for storing data on the platform.',
    colorScheme: 'blue'
  },
  BATCH: {
    title: 'Batch',
    description: 'Creates a new document or token transitions. It is used to make create, modify, delete other document or token actions on the platform.',
    colorScheme: 'gray'
  },
  IDENTITY_CREATE: {
    title: 'Identity Create',
    description: 'Creates a new decentralized identity (DID) to manage digital assets and make actions.',
    colorScheme: 'blue'
  },
  IDENTITY_TOP_UP: {
    title: 'Identity Top Up',
    description: 'Adds credits to an existing decentralized identity (DID) balance.',
    colorScheme: 'emerald'
  },
  DATA_CONTRACT_UPDATE: {
    title: 'Data Contract Update',
    description: 'Updates an existing data contract. Increments the version and updates the schema of the data contract',
    colorScheme: 'yellow'
  },
  IDENTITY_UPDATE: {
    title: 'Identity Update',
    description: 'Updates an identity by adding and removing associated public keys.',
    colorScheme: 'yellow'
  },
  IDENTITY_CREDIT_WITHDRAWAL: {
    title: 'Credit Withdrawal',
    description: 'Withdraws credits from the platform, converting them into Dash.',
    colorScheme: 'red'
  },
  IDENTITY_CREDIT_TRANSFER: {
    title: 'Credit Transfer',
    description: 'Transfers credits between identities or other network participants.',
    colorScheme: 'orange'
  },
  MASTERNODE_VOTE: {
    title: 'Masternode Vote',
    description: 'Vote for a contested resource on the Dash Platform',
    colorScheme: 'orange'
  }
}
