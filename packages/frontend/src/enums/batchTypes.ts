export const BatchActions = {
  // Documents
  DOCUMENT_CREATE: {
    title: 'Document Create',
    description:
      'Creates a new document on the Dash Platform. This action stores the document within the data contract, adhering to the defined schema.',
    colorScheme: 'green'
  },
  DOCUMENT_REPLACE: {
    title: 'Document Replace',
    description:
      'Replaces an existing document with a new version. The document is overwritten while maintaining its unique identifier.',
    colorScheme: 'orange'
  },
  DOCUMENT_DELETE: {
    title: 'Document Delete',
    description:
      'Deletes an existing document from the Dash Platform. This action removes the document but keeps a traceable record of its deletion.',
    colorScheme: 'red'
  },
  DOCUMENT_TRANSFER: {
    title: 'Document Transfer',
    description:
      'Transfers ownership or access rights of a document to another identity. This action facilitates secure exchange of document control.',
    colorScheme: 'orange'
  },
  DOCUMENT_UPDATE_PRICE: {
    title: 'Document Update Price',
    description:
      'Sets or updates the price of a document. Turns the document into NFT that could be transferred or sold to other Identity in the system.',
    colorScheme: 'blue'
  },
  DOCUMENT_PURCHASE: {
    title: 'Document Purchase',
    description:
      'Purchases a document from the Identity in the Dash Platform. Seller receive credits on the balance of his Identity and ownership is transferred to the buyer.',
    colorScheme: 'green'
  },
  // Tokens
  TOKEN_BURN: {
    title: 'Token Burn',
    description: 'Permanently removes tokens from circulation by destroying them.',
    colorScheme: 'red'
  },
  TOKEN_MINT: {
    title: 'Token Mint',
    description: 'Creates new tokens and issues them to a specified identity.',
    colorScheme: 'emerald'
  },
  TOKEN_TRANSFER: {
    title: 'Token Transfer',
    description: 'Transfers tokens from one identity to another.',
    colorScheme: 'orange'
  },
  TOKEN_FREEZE: {
    title: 'Token Freeze',
    description: 'Temporarily freezes tokens, preventing their transfer or use.',
    colorScheme: 'blue'
  },
  TOKEN_UNFREEZE: {
    title: 'Token Unfreeze',
    description: 'Unfreezes previously frozen tokens, allowing their use again.',
    colorScheme: 'orange'
  },
  TOKEN_DESTROY_FROZEN_FUNDS: {
    title: 'Destroy Frozen Funds',
    description: 'Permanently destroys frozen tokens.',
    colorScheme: 'orange'
  },
  TOKEN_CLAIM: {
    title: 'Token Claim',
    description: 'Claims tokens that have been allocated or made available.',
    colorScheme: 'green'
  },
  TOKEN_EMERGENCY_ACTION: {
    title: 'Emergency Action',
    description: 'Emergency administrative action on tokens.',
    colorScheme: 'red'
  },
  TOKEN_CONFIG_UPDATE: {
    title: 'Config Update',
    description: 'Updates token configuration or parameters.',
    colorScheme: 'gray'
  },
  TOKEN_DIRECT_PURCHASE: {
    title: 'Direct Purchase',
    description: 'Direct purchase of tokens using credits.',
    colorScheme: 'green'
  },
  TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE: {
    title: 'Set Purchase Price',
    description: 'Sets or updates the direct purchase price for tokens.',
    colorScheme: 'blue'
  },
  DOCUMENT_INDEX_ONLY_DELETE: {
    title: 'Index-Only Document Delete',
    description: 'Removes an index-only document entry.',
    colorScheme: 'red'
  },
  TOKEN_SHIELD: {
    title: 'Token Shield',
    description: 'Moves tokens into the shielded pool.',
    colorScheme: 'green'
  },
  TOKEN_MINT_TO_POOL: {
    title: 'Token Mint To Pool',
    description: 'Mints tokens into the shielded pool.',
    colorScheme: 'green'
  },
  TOKEN_BURN_FROM_POOL: {
    title: 'Token Burn From Pool',
    description: 'Burns tokens from the shielded pool.',
    colorScheme: 'red'
  },
  TOKEN_CLAIM_TO_POOL: {
    title: 'Token Claim To Pool',
    description: 'Claims a token distribution into the shielded pool.',
    colorScheme: 'green'
  },
  TOKEN_DIRECT_PURCHASE_TO_POOL: {
    title: 'Token Direct Purchase To Pool',
    description: 'Purchases tokens with delivery to the shielded pool.',
    colorScheme: 'green'
  },
  TOKEN_UNSHIELD: {
    title: 'Token Unshield',
    description: 'Moves tokens out of the shielded pool to an identity.',
    colorScheme: 'green'
  },
  TOKEN_SHIELDED_TRANSFER: {
    title: 'Token Shielded Transfer',
    description: 'Transfers tokens privately within the shielded pool.',
    colorScheme: 'green'
  }
}
