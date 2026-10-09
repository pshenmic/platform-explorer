type ValidatorStatusData = {
  isActive?: boolean | null
  isRegistered?: boolean | null
  proTxInfo?: { state?: { PoSeBanHeight?: unknown } | null } | null
}

export function getValidatorStatus(validator?: ValidatorStatusData | null) {
  if (validator?.isRegistered === false)
    return { key: 'unregistered', label: 'Unregistered', colorScheme: 'gray' } as const
  const banHeight = validator?.proTxInfo?.state?.PoSeBanHeight
  if (validator?.isRegistered === true && typeof banHeight === 'number' && Number.isInteger(banHeight) && banHeight >= 0) {
    return { key: 'banned', label: 'Banned', colorScheme: 'red' } as const
  }
  if (validator?.isActive === true)
    return { key: 'quorum', label: 'In quorum', colorScheme: 'green' } as const
  if (validator?.isActive === false && validator.isRegistered === true && banHeight === -1)
    return { key: 'waiting', label: 'Waiting for quorum', colorScheme: 'gray' } as const
  if (validator?.isActive === false)
    return { key: 'inactive', label: 'Not in quorum', colorScheme: 'gray' } as const
  return { key: 'unknown', label: 'Unknown', colorScheme: 'gray' } as const
}
