import { validatorCollateral } from './validatorAmount'

export function validatorApr(
  monthly: number | null | undefined,
  type?: string | null
): number | null {
  const collateral = validatorCollateral(type)
  if (monthly == null || !Number.isFinite(monthly) || monthly < 0 || collateral == null) return null
  return ((monthly * (365 / 30)) / collateral) * 100
}
