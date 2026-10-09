import { expect, test } from '@jest/globals'
import { getValidatorStatus } from '../components/validators/validatorStatus'

test('departed nodes do not inherit a historical ban or waiting status', () => {
  for (const height of [-1, 100]) {
    expect(getValidatorStatus({ isActive: false, isRegistered: false,
      proTxInfo: { state: { PoSeBanHeight: height } } }).key).toBe('unregistered')
  }
})

test('registered nodes distinguish current bans, quorum and waiting', () => {
  expect(getValidatorStatus({ isActive: false, isRegistered: true,
    proTxInfo: { state: { PoSeBanHeight: -1 } } }).key).toBe('waiting')
  expect(getValidatorStatus({ isActive: false, isRegistered: true,
    proTxInfo: { state: { PoSeBanHeight: 0 } } }).key).toBe('banned')
  expect(getValidatorStatus({ isActive: true, isRegistered: true }).key).toBe('quorum')
})

test('unknown registration and missing ban height never imply a current ban', () => {
  expect(getValidatorStatus({ isActive: false }).key).toBe('inactive')
  expect(getValidatorStatus({ isActive: false, isRegistered: null,
    proTxInfo: { state: { PoSeBanHeight: 100 } } }).key).toBe('inactive')
  expect(getValidatorStatus({ isActive: false, isRegistered: true,
    proTxInfo: { state: { PoSeBanHeight: null } } }).key).toBe('inactive')
  expect(getValidatorStatus(null).key).toBe('unknown')
})
