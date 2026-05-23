// Async helper: form state -> TokenConfigurationWASM instance ready to be
// passed into sdk.dataContracts.create(...). Builds all nested WASM rule
// objects with v1 defaults (owner-only auth, NotTradeable marketplace,
// English-only localization, history tracking on for everything).
//
// WASM constructor signatures verified against:
//   packages/frontend/node_modules/pshenmic-dpp/dist/wasm/pshenmic_dpp.d.ts
//   - TokenConfigurationWASM        — line 2860 (19 positional args)
//   - TokenDistributionRulesWASM    — line 2968 (8 positional args)
//   - TokenConfigurationConventionWASM — line 2803 (any localizations, decimals)
//
// Two non-obvious gotchas:
//
// 1) WASM bindings move ownership when an instance is passed into a constructor.
//    Reusing the same ChangeControlRulesWASM (or AuthorizedActionTakersWASM)
//    instance twice fails with "expected instance of ChangeControlRulesWASM" on
//    the second call. So every constructor slot gets a fresh instance via the
//    factory functions below.
//
// 2) TokenConfigurationConventionWASM deserializes its first argument via
//    serde_wasm_bindgen and expects plain JS values, not WASM instances. Passing
//    `{ en: <TokenConfigurationLocalizationWASM> }` triggers
//    "Converting circular structure to JSON" because the wrapper exposes
//    getter-backed sub-objects. Use a plain JS object instead.

export async function buildTokenConfigurationWasm (form) {
  const {
    TokenConfigurationWASM,
    TokenConfigurationConventionWASM,
    ChangeControlRulesWASM,
    AuthorizedActionTakersWASM,
    TokenKeepsHistoryRulesWASM,
    TokenDistributionRulesWASM,
    TokenMarketplaceRulesWASM,
    TokenTradeModeWASM
  } = await import('pshenmic-dpp')

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
  const localizations = {
    en: { shouldCapitalize: true, singularForm: name, pluralForm: `${name}s` }
  }
  const conventions = new TokenConfigurationConventionWASM(
    localizations,
    Number(form.decimals) || 0
  )

  const keepsHistory = new TokenKeepsHistoryRulesWASM(
    true, true, true, true, true, true
  )

  // TokenDistributionRulesWASM(
  //   js_perpetual_distribution, perpetual_distribution_rules,
  //   js_pre_programmed_distribution, js_new_tokens_destination_identity,
  //   new_tokens_destination_identity_rules,
  //   minting_allow_choosing_destination,
  //   minting_allow_choosing_destination_rules,
  //   change_direct_purchase_pricing_rules)
  // emnapi `Option<&T>` extraction rejects `null` here with
  // "Value supplied as TokenPerpetualDistributionWASM is not an object" even
  // though the .d.ts types these slots as `any`. `undefined` maps to None.
  const distributionRules = new TokenDistributionRulesWASM(
    undefined,
    ownerOnlyRule(),
    undefined,
    undefined,
    ownerOnlyRule(),
    form.allowMint,
    ownerOnlyRule(),
    form.allowDirectPurchase ? ownerOnlyRule() : noOneRule()
  )

  const marketplaceRules = new TokenMarketplaceRulesWASM(
    TokenTradeModeWASM.NotTradeable(),
    ownerOnlyRule()
  )

  const baseSupply = BigInt(form.baseSupply || '0')
  const maxSupply = form.hasMaxSupply && form.maxSupply
    ? BigInt(form.maxSupply)
    : undefined

  // TokenConfigurationWASM(
  //   conventions, conventions_change_rules, base_supply, max_supply,
  //   keeps_history, start_as_paused, allow_transfer_to_frozen_balance,
  //   max_supply_change_rules, distribution_rules, marketplace_rules,
  //   manual_minting_rules, manual_burning_rules,
  //   freeze_rules, unfreeze_rules, destroy_frozen_funds_rules, emergency_action_rules,
  //   main_control_group, main_control_group_can_be_modified, description?)
  return new TokenConfigurationWASM(
    conventions,
    ownerOnlyRule(),
    baseSupply,
    maxSupply,
    keepsHistory,
    false,
    false,
    form.hasMaxSupply ? ownerOnlyRule() : noOneRule(),
    distributionRules,
    marketplaceRules,
    form.allowMint ? ownerOnlyRule() : noOneRule(),
    form.allowBurn ? ownerOnlyRule() : noOneRule(),
    ownerOnlyRule(),
    ownerOnlyRule(),
    ownerOnlyRule(),
    ownerOnlyRule(),
    undefined,
    ownerTaker(),
    form.description ? form.description.trim() : undefined
  )
}

export async function calculateTokenId (contractIdLike, position = 0) {
  const { TokenConfigurationWASM } = await import('pshenmic-dpp')
  return TokenConfigurationWASM.calculateTokenId(contractIdLike, position)
}
