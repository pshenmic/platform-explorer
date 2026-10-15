export function validatorApr(monthly: number | null | undefined, type?: string | null): number | null {
  const collateral = type?.toLowerCase() === 'evo' ? 4000 : type?.toLowerCase() === 'regular' ? 1000 : null
  if (monthly == null || !Number.isFinite(monthly) || monthly < 0 || collateral == null) return null
  return monthly * (365 / 30) / collateral * 100
}
