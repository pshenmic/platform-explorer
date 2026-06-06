// v2 wrappers (pshenmic-dpp/dist/src/dpp/structs/) reorder args vs v1 NAPI:
// optionals trail, keepsHistory moved earlier, maxSupply to the end. Each ctor
// moves ownership of nested instances — rule slots use factory functions.

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

  // Supply is multiplied by 10^decimals before broadcast.
  const decimalsForScale = Math.min(16, Number(form.decimals) || 0)
  const scale = 10n ** BigInt(decimalsForScale)

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

  let perpetualDist
  if (form.perpetualEnabled) {
    const intervalValue = Number(form.perpetualIntervalValue)
    let amountScaled
    try { amountScaled = BigInt(form.perpetualAmount || '0') * scale } catch { amountScaled = 0n }
    if (intervalValue > 0 && amountScaled > 0n) {
      const fn = DistributionFunctionWASM.FixedAmountDistribution(amountScaled)
      const type = form.perpetualType || 'time'
      let rewardType
      if (type === 'block') {
        rewardType = RewardDistributionTypeWASM.BlockBasedDistribution(BigInt(intervalValue), fn)
      } else if (type === 'epoch') {
        rewardType = RewardDistributionTypeWASM.EpochBasedDistribution(intervalValue, fn)
      } else {
        const unitMs = INTERVAL_UNIT_MS[form.perpetualIntervalUnit] || INTERVAL_UNIT_MS.days
        rewardType = RewardDistributionTypeWASM.TimeBasedDistribution(BigInt(intervalValue) * unitMs, fn)
      }
      let recipient
      if (type === 'epoch' && form.perpetualRecipient === 'evonodes') {
        recipient = TokenDistributionRecipientWASM.EvonodesByParticipation()
      } else if (form.perpetualRecipient === 'identity' && form.perpetualRecipientIdentity?.trim()) {
        recipient = TokenDistributionRecipientWASM.Identity(form.perpetualRecipientIdentity.trim())
      } else {
        recipient = TokenDistributionRecipientWASM.ContractOwner()
      }
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
