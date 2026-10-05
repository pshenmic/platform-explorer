const { test } = require('node:test')
const assert = require('node:assert/strict')
const ValidatorCore = require('../../src/validatorCore')

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
