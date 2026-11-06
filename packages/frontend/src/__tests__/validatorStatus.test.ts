import { describe, expect, test } from '@jest/globals'
import { getValidatorStatus } from '../components/validators/validatorStatus'

describe('validator ban status', () => {
  test.each([null, undefined, -1, '0', NaN])('does not infer a ban from %s', height => {
    expect(getValidatorStatus({ isActive: true, proTxInfo: { state: { PoSeBanHeight: height } } }).key)
      .toBe('quorum')
  })
  test.each([0, 123])('recognizes an explicit ban height %s', height => {
    expect(getValidatorStatus({ isActive: true, proTxInfo: { state: { PoSeBanHeight: height } } }).key)
      .toBe('banned')
  })
})
