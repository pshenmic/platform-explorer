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
  // User enters supply in "tokens" — DPP stores raw smallest units, so the
  // preview JSON shows the multiplied number (matches what gets broadcast).
  const decimals = Number(form.decimals) || 0
  const scale = 10n ** BigInt(decimals)
  const baseSupply = form.baseSupply
    ? String(BigInt(form.baseSupply) * scale)
    : '0'
  const maxSupply = form.hasMaxSupply && form.maxSupply
    ? String(BigInt(form.maxSupply) * scale)
    : null

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
    startAsPaused: !!form.startAsPaused,
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
    freezeRules: form.allowFreeze ? ownerOnlyRule : noOneRule,
    unfreezeRules: form.allowFreeze ? ownerOnlyRule : noOneRule,
    destroyFrozenFundsRules: form.allowDestroyFrozen ? ownerOnlyRule : noOneRule,
    emergencyActionRules: form.allowEmergency ? ownerOnlyRule : noOneRule,
    mainControlGroup: null,
    mainControlGroupCanBeModified: 'ContractOwner',
    description: form.description || null
  }
}
