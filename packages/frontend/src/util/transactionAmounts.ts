export function formatTransactionAmount(value: string | number | null | undefined, decimals = 0) {
  if (value == null || !Number.isInteger(decimals) || decimals < 0 || decimals > 18) return null
  if (typeof value === 'number' && !Number.isSafeInteger(value)) return null
  if (!/^\d+$/.test(String(value))) return null

  const amount = BigInt(value)
  const divisor = 10n ** BigInt(decimals)
  const whole = (amount / divisor).toLocaleString('en-US')
  const fraction = (amount % divisor).toString().padStart(decimals, '0').replace(/0+$/, '')
  return decimals && fraction ? `${whole}.${fraction}` : whole
}
