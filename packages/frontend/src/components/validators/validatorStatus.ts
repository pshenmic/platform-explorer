type ValidatorStatusData = {
  isActive?: boolean | null
  proTxInfo?: { state?: { PoSeBanHeight?: unknown } | null } | null
}

export function getValidatorStatus(validator?: ValidatorStatusData | null) {
  const banHeight = validator?.proTxInfo?.state?.PoSeBanHeight
  if (typeof banHeight === 'number' && Number.isFinite(banHeight) && banHeight >= 0) {
    return { label: 'Banned', colorScheme: 'red' } as const
  }
  if (validator?.isActive === true) return { label: 'Active', colorScheme: 'green' } as const
  if (validator?.isActive === false) return { label: 'Inactive', colorScheme: 'gray' } as const
  return { label: 'Unknown', colorScheme: 'gray' } as const
}
