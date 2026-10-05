const { test } = require('node:test')
const assert = require('node:assert/strict')
const ValidatorEarnings = require('../../src/validatorEarnings')

const day = 86400000
const rows = Array.from({ length: 6 }, (_, epochIndex) => ({
  epochIndex,
  firstBlockTime: new Date(day * (epochIndex + 1)),
  totalBlocksInEpoch: 4n,
  totalProcessingFees: 100000000000n,
  totalDistributedStorageFees: 100000000000n,
  totalCreatedStorageFees: 999999999999999n,
  coreBlockRewards: 200000000000n,
  blockProposers: [
    { proposer: { hex: () => 'ab' }, count: epochIndex === 0 ? 0n : 1n },
    { proposer: { hex: () => 'cd' }, count: epochIndex === 0 ? 4n : 3n }
  ]
}))
const core = {
  snapshot: async () => ({ list: [{ proTxHash: 'AB', state: { PoSeBanHeight: -1, registeredHeight: 1 } }], coreYieldPerYear: 365 }),
  blockTime: async () => new Date(0).toISOString()
}
const node = {
  getEpochsInfo: async () => [{ number: 6, startTime: BigInt(7 * day) }],
  getFinalizedEpochsInfo: async () => rows
}

test('estimates gross income from distributed pools and includes zero-proposal epochs in the period', async () => {
  const result = await new ValidatorEarnings(node, core).get('AB')
  assert.equal(result.platformHistory.grossCredits, '500000000000')
  assert.equal(result.platformPerMonth, 25)
  assert.equal(result.corePerMonth, 30)
  assert.equal(result.totalPerMonth, 55)
})

test('missing epochs leave the total unavailable while Core remains usable', async () => {
  const result = await new ValidatorEarnings({ ...node, getFinalizedEpochsInfo: async () => rows.slice(1) }, core).get('AB')
  assert.equal(result.corePerMonth, 30)
  assert.equal(result.platformPerMonth, null)
  assert.equal(result.platformHistory, null)
  assert.equal(result.totalPerMonth, null)
})

test('does not forecast for a banned node or extrapolate a partial registration period', async () => {
  const banned = { ...core, snapshot: async () => ({ list: [{ proTxHash: 'ab', state: { PoSeBanHeight: 10 } }], coreYieldPerYear: 365 }) }
  const result = await new ValidatorEarnings(node, banned).get('ab')
  assert.equal(result.eligible, false)
  assert.equal(result.corePerMonth, null)
  assert.equal(result.totalPerMonth, null)
  const recent = await new ValidatorEarnings(node, { ...core, blockTime: async () => new Date(2 * day).toISOString() }).get('ab')
  assert.equal(recent.platformPerMonth, null)
  assert.equal(recent.corePerMonth, 30)
})
