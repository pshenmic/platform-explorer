// Async helper: form state -> v2 TokenConfigurationWASM wrapper ready for
// sdk.dataContracts.create(...). Builds all nested wrappers with v1-product
// defaults (owner-only auth, NotTradeable marketplace, English-only
// localization, history tracking on for everything).
//
// v2 wrapper signatures live in pshenmic-dpp/dist/src/dpp/structs/. They
// differ from the raw NAPI ones in pshenmic-dpp v1.x: optional slots are now
// trailing (just omit), keepsHistory moved earlier in TokenConfigurationWASM,
// maxSupply moved to the end. Localization is a WASM wrapper instance.
//
// Each constructor still moves ownership of nested WASM instances, so every
// rule slot gets a fresh instance via factory functions.

export async function buildTokenConfigurationWasm (form) {
  const {
    TokenConfigurationWASM,
    TokenConfigurationConventionWASM,
    TokenConfigurationLocalizationWASM,
    ChangeControlRulesWASM,
    AuthorizedActionTakersWASM,
    TokenKeepsHistoryRulesWASM,
    TokenDistributionRulesWASM,
    TokenMarketplaceRulesWASM,
    TokenTradeModeWASM
  } = await import('pshenmic-dpp/wasm')

  const ownerTaker = () => AuthorizedActionTakersWASM.ContractOwner()
  const noOneTaker = () => AuthorizedActionTakersWASM.NoOne()

  const ownerOnlyRule = () => new ChangeControlRulesWASM(
    ownerTaker(),
    ownerTaker(),
    false,
    false,
    false
  )
  const noOneRule = () => new ChangeControlRulesWASM(
    noOneTaker(),
    noOneTaker(),
    false,
    false,
    false
  )

  const name = (form.name || 'Token').trim()
  const enLocalization = new TokenConfigurationLocalizationWASM(
    true,
    name,
    `${name}s`
  )
  const conventions = new TokenConfigurationConventionWASM(
    { en: enLocalization },
    Number(form.decimals) || 0
  )

  const keepsHistory = new TokenKeepsHistoryRulesWASM(
    true, true, true, true, true, true
  )

  // v2 TokenDistributionRulesWASM signature:
  //   (perpetualDistributionRules, newTokensDestinationIdentityRules,
  //    mintingAllowChoosingDestination, mintingAllowChoosingDestinationRules,
  //    changeDirectPurchasePricingRules,
  //    perpetualDistribution?, preProgrammedDistribution?, newTokensDestinationIdentity?)
  const distributionRules = new TokenDistributionRulesWASM(
    ownerOnlyRule(),
    ownerOnlyRule(),
    form.allowMint,
    ownerOnlyRule(),
    form.allowDirectPurchase ? ownerOnlyRule() : noOneRule()
  )

  const marketplaceRules = new TokenMarketplaceRulesWASM(
    TokenTradeModeWASM.NotTradeable(),
    ownerOnlyRule()
  )

  // User enters supply in "tokens" (Uniswap-style). DPP stores raw smallest
  // units, so multiply by 10^decimals before broadcast. Hides the decimals
  // footgun from beginners — `baseSupply: 100` with `decimals: 8` becomes
  // `10000000000` on chain and displays as `100.00000000` everywhere.
  const decimals = Number(form.decimals) || 0
  const scale = 10n ** BigInt(decimals)
  const baseSupply = BigInt(form.baseSupply || '0') * scale
  const maxSupply = form.hasMaxSupply && form.maxSupply
    ? BigInt(form.maxSupply) * scale
    : undefined

  // v2 TokenConfigurationWASM signature:
  //   (conventions, conventionsChangeRules, baseSupply, keepsHistory,
  //    startAsPaused, allowTransferToFrozenBalance, maxSupplyChangeRules,
  //    distributionRules, marketplaceRules, manualMintingRules, manualBurningRules,
  //    freezeRules, unfreezeRules, destroyFrozenFundsRules, emergencyActionRules,
  //    mainControlGroupCanBeModified, maxSupply?, mainControlGroup?, description?)
  return new TokenConfigurationWASM(
    conventions,
    ownerOnlyRule(),
    baseSupply,
    keepsHistory,
    !!form.startAsPaused,
    false,
    form.hasMaxSupply ? ownerOnlyRule() : noOneRule(),
    distributionRules,
    marketplaceRules,
    form.allowMint ? ownerOnlyRule() : noOneRule(),
    form.allowBurn ? ownerOnlyRule() : noOneRule(),
    form.allowFreeze ? ownerOnlyRule() : noOneRule(),
    form.allowFreeze ? ownerOnlyRule() : noOneRule(),
    form.allowDestroyFrozen ? ownerOnlyRule() : noOneRule(),
    form.allowEmergency ? ownerOnlyRule() : noOneRule(),
    ownerTaker(),
    maxSupply,
    undefined,
    form.description ? form.description.trim() : undefined
  )
}

export async function calculateTokenId (contractIdLike, position = 0) {
  const { TokenConfigurationWASM } = await import('pshenmic-dpp/wasm')
  return TokenConfigurationWASM.calculateTokenId(contractIdLike, position)
}
