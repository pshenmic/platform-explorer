import { expect, test } from '@jest/globals'
import { validatorApr } from '../util/validatorApr'

test('annualizes thirty-day gross earnings against the node collateral', () => {
  expect(validatorApr(30, 'Evo')).toBeCloseTo(9.125)
  expect(validatorApr(30, 'Regular')).toBeCloseTo(36.5)
  expect(validatorApr(0, 'Evo')).toBe(0)
})

test('does not invent APR for unknown collateral or missing earnings', () => {
  expect(validatorApr(30, 'unknown')).toBeNull()
  expect(validatorApr(null, 'Evo')).toBeNull()
  expect(validatorApr(NaN, 'Evo')).toBeNull()
  expect(validatorApr(-1, 'Evo')).toBeNull()
})
