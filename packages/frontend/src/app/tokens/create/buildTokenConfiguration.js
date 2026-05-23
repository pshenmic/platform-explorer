// Pure helper: form state → plain JSON object that mirrors TokenConfigurationWASM
// structure for live preview. Building the actual WASM instance happens at deploy
// time (separate step). Keeps the preview fast and decoupled from WASM init.

const ownerOnlyRule = {
  authorizedToMakeChange: 'ContractOwner',
  authorizedToChangeChangeAuthorizedRules: 'ContractOwner'
}

const noOneRule = {
  authorizedToMakeChange: 'NoOne',
  authorizedToChangeChangeAuthorizedRules: 'NoOne'
}

export const buildTokenConfiguration = (form) => {
  const baseSupply = form.baseSupply ? String(form.baseSupply) : '0'
  const maxSupply = form.hasMaxSupply && form.maxSupply ? String(form.maxSupply) : null

  return {
    conventions: {
      decimals: Number(form.decimals) || 0,
      localizations: {
        en: {
          shouldCapitalize: true,
          singularForm: form.name || '',
          pluralForm: form.name ? `${form.name}s` : ''
        }
      }
    },
    conventionsChangeRules: ownerOnlyRule,
    baseSupply,
    maxSupply,
    keepsHistory: {
      keepsTransferHistory: true,
      keepsFreezingHistory: true,
      keepsMintingHistory: true,
      keepsBurningHistory: true,
      keepsDirectPricingHistory: true,
      keepsDirectPurchaseHistory: true
    },
    startAsPaused: false,
    allowTransferToFrozenBalance: false,
    maxSupplyChangeRules: form.hasMaxSupply ? ownerOnlyRule : noOneRule,
    distributionRules: {
      perpetualDistribution: null,
      preProgrammedDistribution: null,
      newTokensDestinationIdentity: null,
      mintingAllowChoosingDestination: form.allowMint,
      changeDirectPurchasePricingRules: form.allowDirectPurchase ? ownerOnlyRule : noOneRule
    },
    marketplaceRules: {
      tradeMode: 'NotTradeable',
      tradeModeChangeRules: ownerOnlyRule
    },
    manualMintingRules: form.allowMint ? ownerOnlyRule : noOneRule,
    manualBurningRules: form.allowBurn ? ownerOnlyRule : noOneRule,
    freezeRules: ownerOnlyRule,
    unfreezeRules: ownerOnlyRule,
    destroyFrozenFundsRules: ownerOnlyRule,
    emergencyActionRules: ownerOnlyRule,
    mainControlGroup: null,
    mainControlGroupCanBeModified: 'ContractOwner',
    description: form.description || null
  }
}
