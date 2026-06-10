export const TransactionTypesInfo = {
  DATA_CONTRACT_CREATE: {
    title: 'Data Contract Create',
    description: 'Creates a new data contract. This contract defines the schema for storing data on the platform.',
    colorScheme: 'blue'
  },
  IDENTITY_CREATE: {
    title: 'Identity Create',
    description: 'Creates a new decentralized identity (DID) to manage digital assets and make actions.',
    colorScheme: 'blue'
  },
  BATCH: {
    title: 'Batch',
    description: 'Creates a new document or token transitions. It is used to make create, modify, delete other document or token actions on the platform.',
    colorScheme: 'gray'
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
  },
  IDENTITY_CREDIT_TRANSFER_TO_ADDRESS: {
    title: 'Identity Credit Transfer To Addresses',
    description: 'Transfer credits from identity to Platform addresses',
    colorScheme: 'dimGray'
  },
  IDENTITY_CREATE_FROM_ADDRESSES: {
    title: 'Identity Create From Addresses',
    description: 'Create identity funded by Platform addresses',
    colorScheme: 'dimGray'
  },
  IDENTITY_TOP_UP_FROM_ADDRESSES: {
    title: 'Identity Top Up From Addresses',
    description: 'Top up identity using Platform address balances',
    colorScheme: 'dimGray'
  },
  ADDRESS_FUNDS_TRANSFER: {
    title: 'Address Funds Transfer',
    description: 'Transfer credits between Platform addresses',
    colorScheme: 'dimGray'
  },
  ADDRESS_FUNDING_FROM_ASSET_LOCK: {
    title: 'Address Funding From Asset Lock',
    description: 'Top up Platform address from asset lock',
    colorScheme: 'dimGray'
  },
  ADDRESS_CREDIT_WITHDRAWAL: {
    title: 'Address Credit Withdrawal',
    description: 'Withdraw credits from Platform addresses to Core (L1) Dash addresses',
    colorScheme: 'dimGray'
  }
}
