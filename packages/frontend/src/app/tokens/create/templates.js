// Preset = a partial set of form defaults that seeds the wizard. Picking a card
// only sets the fields a template declares; user-entered identity fields (name,
// supply, description, identities) are preserved. Every field stays editable
// afterwards — a preset is a starting point, not a lock.

export const TEMPLATES = [
  {
    id: 'utility',
    label: 'Utility',
    icon: 'coin',
    description: 'General-purpose token. Mintable, burnable, transferable. No max supply.',
    defaults: {
      decimals: 8,
      hasMaxSupply: false,
      allowMint: true,
      allowBurn: true,
      allowTransfer: true,
      allowDirectPurchase: false,
      allowFreeze: true,
      allowDestroyFrozen: true,
      allowEmergency: true,
      startAsPaused: false,
      perpetualEnabled: false
    }
  },
  {
    id: 'fixed',
    label: 'Fixed',
    icon: 'lock',
    description: 'Scarce / collectible. Max supply equals base supply, minting disabled.',
    defaults: {
      decimals: 8,
      hasMaxSupply: true,
      allowMint: false,
      allowBurn: true,
      allowTransfer: true,
      allowDirectPurchase: false,
      allowFreeze: true,
      allowDestroyFrozen: true,
      allowEmergency: true,
      startAsPaused: false,
      perpetualEnabled: false
    }
  },
  {
    id: 'reward',
    label: 'Reward',
    icon: 'repeat',
    description: 'Recurring emission to the owner every epoch (~9 days). Staking / rewards.',
    defaults: {
      decimals: 8,
      hasMaxSupply: false,
      allowMint: true,
      allowBurn: true,
      allowTransfer: true,
      allowDirectPurchase: false,
      allowFreeze: true,
      allowDestroyFrozen: true,
      allowEmergency: true,
      startAsPaused: false,
      perpetualEnabled: true,
      perpetualType: 'epoch',
      perpetualIntervalValue: '1',
      perpetualAmount: '1000',
      perpetualRecipient: 'owner'
    }
  },
  {
    id: 'airdrop',
    label: 'Airdrop',
    icon: 'parachute',
    description: 'Pre-programmed scheduled distributions to specific identities. Airdrops / vesting.',
    defaults: {
      decimals: 8,
      hasMaxSupply: false,
      allowMint: true,
      allowBurn: true,
      allowTransfer: true,
      allowDirectPurchase: false,
      allowFreeze: true,
      allowDestroyFrozen: true,
      allowEmergency: true,
      startAsPaused: false,
      perpetualEnabled: false
    }
  },
  {
    id: 'stable',
    label: 'Stable',
    icon: 'dollar',
    description: 'Compliance-ready currency. Freeze, burn-frozen, emergency pause, full history. 6 decimals.',
    defaults: {
      decimals: 6,
      hasMaxSupply: false,
      allowMint: true,
      allowBurn: true,
      allowTransfer: true,
      allowDirectPurchase: false,
      allowFreeze: true,
      allowDestroyFrozen: true,
      allowEmergency: true,
      startAsPaused: false,
      perpetualEnabled: false,
      keepsHistory: {
        transfer: true,
        freezing: true,
        minting: true,
        burning: true,
        directPricing: true,
        directPurchase: true
      }
    }
  }
]

export const DEFAULT_TEMPLATE_ID = 'utility'

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
