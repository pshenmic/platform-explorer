// Template presets — each defines hardcoded rule-sets and default form values
// that get merged with user input. For v1 only "Simple Utility" is fully wired;
// the other two are visible-but-disabled stubs.

export const TEMPLATES = [
  {
    id: 'simple-utility',
    label: 'Simple Utility',
    description: 'Loyalty / utility tokens. Mintable + burnable + transferable. No max supply.',
    disabled: false,
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
      startAsPaused: false
    }
  },
  {
    id: 'fixed-supply',
    label: 'Fixed Supply',
    description: 'Collectibles / scarce assets. maxSupply = baseSupply. Mint disabled.',
    disabled: true,
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
      startAsPaused: false
    }
  },
  {
    id: 'mintable',
    label: 'Mintable',
    description: 'Rewards / staking. Owner can mint up to maxSupply.',
    disabled: true,
    defaults: {
      decimals: 8,
      hasMaxSupply: true,
      allowMint: true,
      allowBurn: true,
      allowTransfer: true,
      allowDirectPurchase: false,
      allowFreeze: true,
      allowDestroyFrozen: true,
      allowEmergency: true,
      startAsPaused: false
    }
  }
]

export const DEFAULT_TEMPLATE_ID = 'simple-utility'

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
