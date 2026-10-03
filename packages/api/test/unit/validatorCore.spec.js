const { test } = require('node:test')
const assert = require('node:assert/strict')
const ValidatorCore = require('../../src/services/validatorCore')
const cachedRequest = require('../../src/services/cachedRequest')

test('coalesces requests, bounds stored entries and retries failures', async () => {
  const cached = cachedRequest({ maxEntries: 1 })
  let calls = 0
  const load = async () => ++calls
  assert.deepEqual(await Promise.all([cached('a', load), cached('a', load)]), [1, 1])
  await cached('b', load)
  assert.equal(await cached('a', load), 3)
  await assert.rejects(cached('failure', async () => { throw new Error('offline') }))
  assert.equal(await cached('failure', load), 4)
})

test('derives Core income from RPC duffs and shares the network snapshot', async () => {
  let listCalls = 0
  const rpc = {
    getProTxList: async () => { listCalls++; return [1, 2].map(n => ({ proTxHash: String(n), state: { PoSeBanHeight: -1 } })) },
    getBlockCount: async () => 24,
    getBlockHash: async height => height,
    getBlock: async height => ({ time: height * 150 }),
    getMasternodePayments: async () => [{
      masternodes: [{
        payees: [
          { amount: 100000000, script: '76a914' },
          { amount: 900000000, script: '6a' }
        ]
      }]
    }]
  }
  const service = new ValidatorCore(rpc)
  const [a, b] = await Promise.all([service.details('1', 1), service.details('2', 1)])
  assert.equal(listCalls, 1)
  assert.equal(a.coreYieldPerYear, 365 * 86400 / 150 / 2)
  assert.equal(a.coreBlockIntervalMs, 150000)
  assert.equal(a.poseScoreMax, 100)
  assert.equal(a.registeredAt, '1970-01-01T00:02:30.000Z')
  assert.equal(a.coreYieldPerYear, b.coreYieldPerYear)
})

test('a stalled source times out and can be retried', async () => {
  const cached = cachedRequest({ timeout: 5 })
  await assert.rejects(cached('slow', () => new Promise(() => {})), /timed out/)
  assert.equal(await cached('slow', async () => 42), 42)
})
