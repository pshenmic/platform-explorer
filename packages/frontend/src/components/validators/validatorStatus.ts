type ValidatorStatusData = {
  isActive?: boolean | null
  proTxInfo?: { state?: { PoSeBanHeight?: unknown } | null } | null
}

export function getValidatorStatus(validator?: ValidatorStatusData | null) {
  const banHeight = validator?.proTxInfo?.state?.PoSeBanHeight
  if (typeof banHeight === 'number' && Number.isFinite(banHeight) && banHeight >= 0) {
    return { key: 'banned', label: 'Banned', colorScheme: 'red' } as const
  }
  if (validator?.isActive === true)
    return { key: 'quorum', label: 'In quorum', colorScheme: 'green' } as const
  if (validator?.isActive === false)
    return { key: 'waiting', label: 'Waiting for quorum', colorScheme: 'gray' } as const
  return { key: 'unknown', label: 'Unknown', colorScheme: 'gray' } as const
}
