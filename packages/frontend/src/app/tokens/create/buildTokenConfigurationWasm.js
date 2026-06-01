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

const INTERVAL_UNIT_MS = {
  seconds: 1000n,
  minutes: 60_000n,
  hours: 3_600_000n,
  days: 86_400_000n
}

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
    TokenTradeModeWASM,
    TokenPerpetualDistributionWASM,
    TokenPreProgrammedDistributionWASM,
    RewardDistributionTypeWASM,
    DistributionFunctionWASM,
    TokenDistributionRecipientWASM
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
  const pluralForm = (form.pluralForm || `${name}s`).trim()
  const enLocalization = new TokenConfigurationLocalizationWASM(
    !!form.shouldCapitalize,
    name,
    pluralForm
  )
  const conventions = new TokenConfigurationConventionWASM(
    { en: enLocalization },
    Math.min(16, Number(form.decimals) || 0)
  )

  const h = form.keepsHistory || {}
  const keepsHistory = new TokenKeepsHistoryRulesWASM(
    h.transfer !== false,
    h.freezing !== false,
    h.minting !== false,
    h.burning !== false,
    h.directPricing !== false,
    h.directPurchase !== false
  )

  const destinationIdentity = form.destinationIdentity?.trim() || undefined

  // User enters supply in "tokens" — multiply by 10^decimals before chain.
  const decimalsForScale = Math.min(16, Number(form.decimals) || 0)
  const scale = 10n ** BigInt(decimalsForScale)

  // Pre-programmed distribution: object keyed by ms timestamp -> id -> bigint amount.
  let preProgrammedDist
  const groupedPP = {}
  for (const row of form.preProgrammedRows || []) {
    if (!row.time || !row.identity?.trim() || !row.amount) continue
    const ts = Date.parse(row.time)
    if (Number.isNaN(ts)) continue
    let scaled
    try { scaled = BigInt(row.amount) * scale } catch { continue }
    const key = String(ts)
    if (!groupedPP[key]) groupedPP[key] = {}
    groupedPP[key][row.identity.trim()] = scaled
  }
  if (Object.keys(groupedPP).length) {
    preProgrammedDist = new TokenPreProgrammedDistributionWASM(groupedPP)
  }

  // Perpetual distribution: Time-based + FixedAmount only.
  let perpetualDist
  if (form.perpetualEnabled) {
    const intervalValue = Number(form.perpetualIntervalValue)
    const unitMs = INTERVAL_UNIT_MS[form.perpetualIntervalUnit] || INTERVAL_UNIT_MS.days
    let amountScaled
    try { amountScaled = BigInt(form.perpetualAmount || '0') * scale } catch { amountScaled = 0n }
    if (intervalValue > 0 && amountScaled > 0n) {
      const intervalMs = BigInt(intervalValue) * unitMs
      const fn = DistributionFunctionWASM.FixedAmountDistribution(amountScaled)
      const rewardType = RewardDistributionTypeWASM.TimeBasedDistribution(intervalMs, fn)
      const recipient = form.perpetualRecipient === 'identity' && form.perpetualRecipientIdentity?.trim()
        ? TokenDistributionRecipientWASM.Identity(form.perpetualRecipientIdentity.trim())
        : TokenDistributionRecipientWASM.ContractOwner()
      perpetualDist = new TokenPerpetualDistributionWASM(rewardType, recipient)
    }
  }

  // TokenDistributionRulesWASM signature:
  //   (perpetualDistributionRules, newTokensDestinationIdentityRules,
  //    mintingAllowChoosingDestination, mintingAllowChoosingDestinationRules,
  //    changeDirectPurchasePricingRules,
  //    perpetualDistribution?, preProgrammedDistribution?, newTokensDestinationIdentity?)
  const distributionRules = new TokenDistributionRulesWASM(
    ownerOnlyRule(),
    ownerOnlyRule(),
    form.allowMint,
    ownerOnlyRule(),
    form.allowDirectPurchase ? ownerOnlyRule() : noOneRule(),
    perpetualDist,
    preProgrammedDist,
    destinationIdentity
  )

  const marketplaceRules = new TokenMarketplaceRulesWASM(
    TokenTradeModeWASM.NotTradeable(),
    ownerOnlyRule()
  )

  // User enters supply in "tokens" (Uniswap-style). DPP stores raw smallest
  // units, so multiply by 10^decimals before broadcast. Hides the decimals
  // footgun from beginners — `baseSupply: 100` with `decimals: 8` becomes
  // `10000000000` on chain and displays as `100.00000000` everywhere.
  // `scale` already declared above (used for perpetual/pre-programmed amounts).
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
    !!form.allowTransferToFrozenBalance,
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
