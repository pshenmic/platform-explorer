// v2 ctors move ownership of nested instances — rule slots use factory functions.
// WASM types are weak; we only type the form input and return values via SDK Parameters.

import type { DashPlatformSDK, IdentifierWASM } from 'dash-platform-sdk/types'
import type { IntervalUnit, TokenForm } from './TokenWizardContext'

type CreateDataContract = DashPlatformSDK['dataContracts']['create']
/** Token configuration entry accepted by `sdk.dataContracts.create` (5th arg item). */
type TokenConfigEntry = NonNullable<Parameters<CreateDataContract>[4]>[number]
/** Underlying WASM config object nested in a token entry. */
export type TokenConfigurationWasm = TokenConfigEntry extends { tokenConfiguration: infer T }
  ? T
  : TokenConfigEntry

const INTERVAL_UNIT_MS: Record<IntervalUnit, bigint> = {
  seconds: 1000n,
  minutes: 60_000n,
  hours: 3_600_000n,
  days: 86_400_000n
}

export async function buildTokenConfigurationWasm(
  form: TokenForm
): Promise<TokenConfigurationWasm> {
  // Dynamic import — pshenmic-dpp/wasm has no reliable .d.ts; treat module as loosely typed.
  const wasm = (await import('pshenmic-dpp/wasm')) as Record<string, any>

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
  } = wasm

  const ownerTaker = () => AuthorizedActionTakersWASM.ContractOwner()
  const noOneTaker = () => AuthorizedActionTakersWASM.NoOne()

  const ownerOnlyRule = () =>
    new ChangeControlRulesWASM(ownerTaker(), ownerTaker(), false, false, false)
  const noOneRule = () =>
    new ChangeControlRulesWASM(noOneTaker(), noOneTaker(), false, false, false)

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

  let preProgrammedDist: InstanceType<typeof TokenPreProgrammedDistributionWASM> | undefined
  const groupedPP: Record<string, Record<string, bigint>> = {}
  for (const row of form.preProgrammedRows || []) {
    if (!row.time || !row.identity?.trim() || !row.amount) continue
    const ts = Date.parse(row.time)
    if (Number.isNaN(ts)) continue
    let scaled: bigint
    try {
      scaled = BigInt(row.amount) * scale
    } catch {
      continue
    }
    const key = String(ts)
    if (!groupedPP[key]) groupedPP[key] = {}
    groupedPP[key][row.identity.trim()] = scaled
  }
  if (Object.keys(groupedPP).length) {
    preProgrammedDist = new TokenPreProgrammedDistributionWASM(groupedPP)
  }

  let perpetualDist: InstanceType<typeof TokenPerpetualDistributionWASM> | undefined
  if (form.perpetualEnabled) {
    const intervalValue = Number(form.perpetualIntervalValue)
    let amountScaled: bigint
    try {
      amountScaled = BigInt(form.perpetualAmount || '0') * scale
    } catch {
      amountScaled = 0n
    }
    if (intervalValue > 0 && amountScaled > 0n) {
      const fn = DistributionFunctionWASM.FixedAmountDistribution(amountScaled)
      const type = form.perpetualType || 'time'
      let rewardType: ReturnType<
        | typeof RewardDistributionTypeWASM.BlockBasedDistribution
        | typeof RewardDistributionTypeWASM.EpochBasedDistribution
        | typeof RewardDistributionTypeWASM.TimeBasedDistribution
      >
      if (type === 'block') {
        rewardType = RewardDistributionTypeWASM.BlockBasedDistribution(BigInt(intervalValue), fn)
      } else if (type === 'epoch') {
        rewardType = RewardDistributionTypeWASM.EpochBasedDistribution(intervalValue, fn)
      } else {
        const unitMs = INTERVAL_UNIT_MS[form.perpetualIntervalUnit] || INTERVAL_UNIT_MS.days
        rewardType = RewardDistributionTypeWASM.TimeBasedDistribution(
          BigInt(intervalValue) * unitMs,
          fn
        )
      }
      let recipient: ReturnType<
        | typeof TokenDistributionRecipientWASM.EvonodesByParticipation
        | typeof TokenDistributionRecipientWASM.Identity
        | typeof TokenDistributionRecipientWASM.ContractOwner
      >
      if (type === 'epoch' && form.perpetualRecipient === 'evonodes') {
        recipient = TokenDistributionRecipientWASM.EvonodesByParticipation()
      } else if (
        form.perpetualRecipient === 'identity' &&
        form.perpetualRecipientIdentity?.trim()
      ) {
        recipient = TokenDistributionRecipientWASM.Identity(form.perpetualRecipientIdentity.trim())
      } else {
        recipient = TokenDistributionRecipientWASM.ContractOwner()
      }
      perpetualDist = new TokenPerpetualDistributionWASM(rewardType, recipient)
    }
  }

  // Positional ctor — arg order per pshenmic-dpp TokenDistributionRulesWASM (no reliable .d.ts, see #76).
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
  const maxSupply = form.hasMaxSupply && form.maxSupply ? BigInt(form.maxSupply) * scale : undefined

  // Positional ctor — arg order per pshenmic-dpp TokenConfigurationWASM v2 (see #76).
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
  ) as TokenConfigurationWasm
}

export async function calculateTokenId(
  contractIdLike: IdentifierWASM | string,
  position = 0
): Promise<IdentifierWASM> {
  const { TokenConfigurationWASM } = (await import('pshenmic-dpp/wasm')) as {
    TokenConfigurationWASM: {
      calculateTokenId: (id: IdentifierWASM | string, position: number) => IdentifierWASM
    }
  }
  return TokenConfigurationWASM.calculateTokenId(contractIdLike, position)
}
