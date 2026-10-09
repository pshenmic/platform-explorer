import { expect, test } from '@jest/globals'
import { getValidatorStatus } from '../components/validators/validatorStatus'

test('departed nodes do not inherit a historical ban or waiting status', () => {
  for (const height of [-1, 100]) {
    expect(getValidatorStatus({ isActive: false, isRegistered: false,
      proTxInfo: { state: { PoSeBanHeight: height } } }).label).toBe('Unregistered')
  }
})

test('only known registered unbanned nodes are waiting', () => {
  expect(getValidatorStatus({ isActive: false, isRegistered: true,
    proTxInfo: { state: { PoSeBanHeight: -1 } } }).label).toBe('Waiting for Quorum')
  expect(getValidatorStatus({ isActive: false, isRegistered: true,
    proTxInfo: { state: { PoSeBanHeight: 0 } } }).label).toBe('Banned')
  expect(getValidatorStatus({ isActive: true, isRegistered: true }).label).toBe('Active')
})

test('old API and unavailable registration use a neutral fallback', () => {
  expect(getValidatorStatus({ isActive: false }).label).toBe('Not in quorum')
  expect(getValidatorStatus({ isActive: false, isRegistered: null }).label).toBe('Not in quorum')
  expect(getValidatorStatus(null).label).toBe('Unknown')
})
