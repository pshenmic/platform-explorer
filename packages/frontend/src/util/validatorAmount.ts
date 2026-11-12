import { creditsToDash, removeTrailingZeros } from './index'

export function validatorCollateral(type?: string | null): number | null {
  switch (type?.toLowerCase()) {
    case 'evo':
      return 4000
    case 'regular':
      return 1000
    default:
      return null
  }
}

export function validatorDashAmount(credits: number) {
  const dash = creditsToDash(credits)
  if (!Number.isFinite(dash)) return '—'
  if (dash > 0 && dash < 0.0001) return '<0.0001'
  if (dash < 0 && dash > -0.0001) return '>-0.0001'
  const digits = Math.abs(dash) >= 100 ? 2 : 4
  return String(removeTrailingZeros(dash.toFixed(digits)))
}
