type ValidatorStatusData = {
  isActive?: boolean | null
  isRegistered?: boolean | null
  proTxInfo?: { state?: { PoSeBanHeight?: unknown } | null } | null
}

export function getValidatorStatus(validator?: ValidatorStatusData | null) {
  if (validator?.isRegistered === false)
    return { label: 'Unregistered', colorScheme: 'gray' } as const
  const banHeight = validator?.proTxInfo?.state?.PoSeBanHeight
  if (validator?.isRegistered === true && typeof banHeight === 'number' && Number.isInteger(banHeight) && banHeight >= 0) {
    return { label: 'Banned', colorScheme: 'red' } as const
  }
  if (validator?.isActive === true) return { label: 'Active', colorScheme: 'green' } as const
  if (validator?.isActive === false && validator.isRegistered === true && banHeight === -1)
    return { label: 'Waiting for Quorum', colorScheme: 'gray' } as const
  if (validator?.isActive === false)
    return { label: 'Not in quorum', colorScheme: 'gray' } as const
  return { label: 'Unknown', colorScheme: 'gray' } as const
}
