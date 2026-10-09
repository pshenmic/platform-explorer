const { test } = require('node:test')
const assert = require('node:assert/strict')
const DashCoreRPC = require('../../src/dashcoreRpc')
const TenderdashRPC = require('../../src/tenderdashRpc')
const getValidatorRegistration = require('../../src/validatorRegistration')
const ValidatorsController = require('../../src/controllers/ValidatorsController')
const Validator = require('../../src/models/Validator')
const ServiceNotAvailableError = require('../../src/errors/ServiceNotAvailableError')
const cache = require('../../src/cache')
const { VALIDATORS_CACHE_KEY, BANNED_STATE_CACHE_KEY } = require('../../src/constants')

test('registration lookup distinguishes empty lists from unavailable data', async context => {
  const rpc = context.mock.method(DashCoreRPC, 'getProTxList', async () => [])
  assert.equal((await getValidatorRegistration()).size, 0)
  rpc.mock.mockImplementation(async () => [{ proTxHash: 'abc', state: { PoSeBanHeight: -1 } }])
  assert.equal((await getValidatorRegistration()).has('ABC'), true)
  for (const value of [null, {}, [null], [{}]]) {
    rpc.mock.mockImplementation(async () => value)
    assert.equal(await getValidatorRegistration(), null)
  }
  rpc.mock.mockImplementation(async () => { throw new Error('offline') })
  assert.equal(await getValidatorRegistration(), null)
})

test('list refreshes registration and ban state independently of cached metadata', async context => {
  const hash = 'A'.repeat(64)
  const metadata = { proTxHash: hash, identifier: 'cached', proTxInfo: { state: { PoSeBanHeight: 42 } } }
  context.mock.method(cache, 'get', key => key === `${VALIDATORS_CACHE_KEY}_${hash}` ? metadata : null)
  context.mock.method(TenderdashRPC, 'getValidators', async () => ({ validators: [] }))
  const rpc = context.mock.method(DashCoreRPC, 'getProTxList', async () => [{ proTxHash: hash.toLowerCase(), state: { PoSeBanHeight: -1 } }])
  const controller = new ValidatorsController(null, { node: { getEpochsInfo: async () => [{ number: 1, startTime: 1000 }] } })
  controller.validatorsDAO.getValidators = async () => ({ resultSet: [{ proTxHash: hash }], pagination: {} })
  let result
  const response = { send: body => { result = body } }
  await controller.getValidators({ query: {} }, response)
  assert.equal(result.resultSet[0].isRegistered, true)
  assert.equal(result.resultSet[0].proTxInfo.state.PoSeBanHeight, -1)
  rpc.mock.mockImplementation(async () => [])
  await controller.getValidators({ query: {} }, response)
  assert.equal(result.resultSet[0].isRegistered, false)
  assert.equal(result.resultSet[0].proTxInfo.state.PoSeBanHeight, null)
  rpc.mock.mockImplementation(async () => { throw new Error('offline') })
  await controller.getValidators({ query: {} }, response)
  assert.equal(result.resultSet[0].isRegistered, null)
  for (const query of [{ isRegistered: false }, { isRegistered: true }, { isBanned: false }, { isBanned: true }]) {
    await assert.rejects(controller.getValidators({ query }, response), ServiceNotAvailableError)
  }
  assert.equal(metadata.proTxInfo.state.PoSeBanHeight, 42)
})

test('validator model preserves registration false and unknown', () => {
  for (const isRegistered of [true, false, null]) {
    assert.equal(Validator.fromObject({ isRegistered }).isRegistered, isRegistered)
  }
  assert.equal(Validator.fromObject({}).isRegistered, null)
})

test('detail distinguishes departed nodes even when historical state says banned', async context => {
  const hash = 'B'.repeat(64)
  const metadata = { proTxHash: hash, proTxInfo: { state: { PoSeBanHeight: -1 } } }
  context.mock.method(console, 'error', () => {})
  context.mock.method(cache, 'get', key => {
    if (key === `${VALIDATORS_CACHE_KEY}_${hash}`) return metadata
    if (key === `${BANNED_STATE_CACHE_KEY}_${hash}`) return 100
  })
  context.mock.method(TenderdashRPC, 'getValidators', async () => ({ validators: [] }))
  const rpc = context.mock.method(DashCoreRPC, 'getProTxList', async () => [])
  const controller = new ValidatorsController(null, { node: { getEpochsInfo: async () => [{ number: 1, startTime: 1000 }] } })
  controller.validatorsDAO.getValidatorByProTxHash = async () => ({ proTxHash: hash })
  let result
  const response = { send: body => { result = body } }
  await controller.getValidatorByProTxHash({ params: { hash } }, response)
  assert.equal(result.isRegistered, false)
  assert.equal(result.proTxInfo.state.PoSeBanHeight, 100)
  rpc.mock.mockImplementation(async () => [{ proTxHash: hash.toLowerCase(), state: { PoSeBanHeight: -1 } }])
  await controller.getValidatorByProTxHash({ params: { hash } }, response)
  assert.equal(result.isRegistered, true)
  assert.equal(result.proTxInfo.state.PoSeBanHeight, -1)
  rpc.mock.mockImplementation(async () => { throw new Error('offline') })
  await controller.getValidatorByProTxHash({ params: { hash } }, response)
  assert.equal(result.isRegistered, null)
  assert.equal(result.proTxInfo.state.PoSeBanHeight, null)
  assert.equal(metadata.proTxInfo.state.PoSeBanHeight, -1)
})
