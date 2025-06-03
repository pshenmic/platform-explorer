export const TokenTransitionEnum = {
  0: 'BURN',
  1: 'MINT',
  2: 'TRANSFER',
  3: 'FREEZE',
  4: 'UNFREEZE',
  5: 'DESTROY_FROZEN_FUNDS',
  6: 'CLAIM',
  7: 'EMERGENCY_ACTION',
  8: 'CONFIG_UPDATE',
  9: 'DIRECT_PURCHASE',
  10: 'SET_PRICE_FOR_DIRECT_PURCHASE'
}

export const TokenTransitionInfo = {
  BURN: {
    title: 'Token Burn',
    description: 'Permanently removes tokens from circulation by destroying them.',
    colorScheme: 'red'
  },
  MINT: {
    title: 'Token Mint',
    description: 'Creates new tokens and issues them to a specified identity.',
    colorScheme: 'emerald'
  },
  TRANSFER: {
    title: 'Token Transfer',
    description: 'Transfers tokens from one identity to another.',
    colorScheme: 'blue'
  },
  FREEZE: {
    title: 'Token Freeze',
    description: 'Temporarily freezes tokens, preventing their transfer or use.',
    colorScheme: 'blue'
  },
  UNFREEZE: {
    title: 'Token Unfreeze',
    description: 'Unfreezes previously frozen tokens, allowing their use again.',
    colorScheme: 'emerald'
  },
  DESTROY_FROZEN_FUNDS: {
    title: 'Destroy Frozen Funds',
    description: 'Permanently destroys frozen tokens.',
    colorScheme: 'orange'
  },
  CLAIM: {
    title: 'Token Claim',
    description: 'Claims tokens that have been allocated or made available.',
    colorScheme: 'green'
  },
  EMERGENCY_ACTION: {
    title: 'Emergency Action',
    description: 'Emergency administrative action on tokens.',
    colorScheme: 'red'
  },
  CONFIG_UPDATE: {
    title: 'Config Update',
    description: 'Updates token configuration or parameters.',
    colorScheme: 'gray'
  },
  DIRECT_PURCHASE: {
    title: 'Direct Purchase',
    description: 'Direct purchase of tokens using credits.',
    colorScheme: 'green'
  },
  SET_PRICE_FOR_DIRECT_PURCHASE: {
    title: 'Set Purchase Price',
    description: 'Sets or updates the direct purchase price for tokens.',
    colorScheme: 'blue'
  }
}
