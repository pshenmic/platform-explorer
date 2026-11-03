import { creditsToDash, removeTrailingZeros } from './index'

export function validatorDashAmount(credits: number) {
  const dash = creditsToDash(credits)
  if (!Number.isFinite(dash)) return '—'
  if (dash > 0 && dash < 0.0001) return '<0.0001'
  if (dash < 0 && dash > -0.0001) return '>-0.0001'
  const digits = Math.abs(dash) >= 100 ? 2 : 4
  return String(removeTrailingZeros(dash.toFixed(digits)))
}
