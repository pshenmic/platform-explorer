import type { IntervalUnit, PreProgrammedRow, TokenForm } from './TokenWizardContext'

type ChangeRule = {
  authorizedToMakeChange: 'ContractOwner' | 'NoOne'
  authorizedToChangeChangeAuthorizedRules: 'ContractOwner' | 'NoOne'
}

const ownerOnlyRule: ChangeRule = {
  authorizedToMakeChange: 'ContractOwner',
  authorizedToChangeChangeAuthorizedRules: 'ContractOwner'
}

const noOneRule: ChangeRule = {
  authorizedToMakeChange: 'NoOne',
  authorizedToChangeChangeAuthorizedRules: 'NoOne'
}

const INTERVAL_UNIT_MS: Record<IntervalUnit, number> = {
  seconds: 1000,
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000
}

const buildPreProgrammedDistribution = (
  rows: PreProgrammedRow[] | undefined,
  scale: bigint
): { distributions: Record<string, Record<string, string>> } | null => {
  const distributions: Record<string, Record<string, string>> = {}
  for (const row of rows || []) {
    if (!row.time || !row.identity || !row.amount) continue
    const ts = Date.parse(row.time)
    if (Number.isNaN(ts)) continue
    let scaled: string
    try { scaled = String(BigInt(row.amount) * scale) } catch { continue }
    const key = String(ts)
    if (!distributions[key]) distributions[key] = {}
    distributions[key][row.identity.trim()] = scaled
  }
  return Object.keys(distributions).length ? { distributions } : null
}

const buildPerpetualDistribution = (form: TokenForm, scale: bigint) => {
  if (!form.perpetualEnabled) return null
  const intervalValue = Number(form.perpetualIntervalValue)
  if (!intervalValue || intervalValue <= 0) return null
  let amountScaled: string
  try { amountScaled = String(BigInt(form.perpetualAmount || '0') * scale) } catch { return null }
  if (amountScaled === '0') return null

  const type = form.perpetualType || 'time'
  const fn = { FixedAmount: { amount: amountScaled } }
  let distributionType: Record<string, unknown>
  if (type === 'block') {
    distributionType = { BlockBasedDistribution: { interval: intervalValue, function: fn } }
  } else if (type === 'epoch') {
    distributionType = { EpochBasedDistribution: { interval: intervalValue, function: fn } }
  } else {
    const unitMs = INTERVAL_UNIT_MS[form.perpetualIntervalUnit] || INTERVAL_UNIT_MS.days
    distributionType = { TimeBasedDistribution: { interval: intervalValue * unitMs, function: fn } }
  }

  let recipient: string | { Identity: string }
  if (type === 'epoch' && form.perpetualRecipient === 'evonodes') {
    recipient = 'EvonodesByParticipation'
  } else if (form.perpetualRecipient === 'identity' && form.perpetualRecipientIdentity?.trim()) {
    recipient = { Identity: form.perpetualRecipientIdentity.trim() }
  } else {
    recipient = 'ContractOwner'
  }

  return { distributionType, distributionRecipient: recipient }
}

export const buildTokenConfiguration = (form: TokenForm) => {
  // Supply is multiplied by 10^decimals before broadcast. DPP caps decimals at 16.
  const decimals = Math.min(16, Number(form.decimals) || 0)
  const scale = 10n ** BigInt(decimals)
  const baseSupply = form.baseSupply
    ? String(BigInt(form.baseSupply) * scale)
    : '0'
  const maxSupply = form.hasMaxSupply && form.maxSupply
    ? String(BigInt(form.maxSupply) * scale)
    : null

  const history = form.keepsHistory || {}
  return {
    conventions: {
      decimals,
      localizations: {
        en: {
          shouldCapitalize: !!form.shouldCapitalize,
          singularForm: form.name || '',
          pluralForm: form.pluralForm || (form.name ? `${form.name}s` : '')
        }
      }
    },
    conventionsChangeRules: ownerOnlyRule,
    baseSupply,
    maxSupply,
    keepsHistory: {
      keepsTransferHistory: history.transfer !== false,
      keepsFreezingHistory: history.freezing !== false,
      keepsMintingHistory: history.minting !== false,
      keepsBurningHistory: history.burning !== false,
      keepsDirectPricingHistory: history.directPricing !== false,
      keepsDirectPurchaseHistory: history.directPurchase !== false
    },
    startAsPaused: !!form.startAsPaused,
    allowTransferToFrozenBalance: !!form.allowTransferToFrozenBalance,
    maxSupplyChangeRules: form.hasMaxSupply ? ownerOnlyRule : noOneRule,
    distributionRules: {
      perpetualDistribution: buildPerpetualDistribution(form, scale),
      preProgrammedDistribution: buildPreProgrammedDistribution(form.preProgrammedRows, scale),
      newTokensDestinationIdentity: form.destinationIdentity?.trim() || null,
      mintingAllowChoosingDestination: form.allowMint,
      changeDirectPurchasePricingRules: form.allowDirectPurchase ? ownerOnlyRule : noOneRule
    },
    marketplaceRules: {
      tradeMode: 'NotTradeable' as const,
      tradeModeChangeRules: ownerOnlyRule
    },
    manualMintingRules: form.allowMint ? ownerOnlyRule : noOneRule,
    manualBurningRules: form.allowBurn ? ownerOnlyRule : noOneRule,
    freezeRules: form.allowFreeze ? ownerOnlyRule : noOneRule,
    unfreezeRules: form.allowFreeze ? ownerOnlyRule : noOneRule,
    destroyFrozenFundsRules: form.allowDestroyFrozen ? ownerOnlyRule : noOneRule,
    emergencyActionRules: form.allowEmergency ? ownerOnlyRule : noOneRule,
    mainControlGroup: null,
    mainControlGroupCanBeModified: 'ContractOwner' as const,
    description: form.description || null
  }
}

/** JSON preview shape of token config (not the WASM instance). */
export type TokenConfigurationJson = ReturnType<typeof buildTokenConfiguration>
