const { test } = require('node:test')
const assert = require('node:assert/strict')
const getValidatorEpochs = require('../../src/validatorEpochs')

const epochs = [1000, 4000, 10000, 13000].map((startTime, number) => ({ number, startTime }))
const node = {
  getEpochsInfo: async (count, ascending, start = 0) => ascending
    ? epochs.slice(start, start + count)
    : [epochs[epochs.length - 1]]
}

test('uses actual irregular boundaries and includes an overlapping first epoch', async () => {
  assert.deepEqual(await getValidatorEpochs(node, new Date(5000), new Date(12000)), [
    { number: 1, endNumber: 1, startTime: 4000, endTime: 10000 },
    { number: 2, endNumber: 2, startTime: 10000, endTime: 13000 }
  ])
})

test('does not invent future epochs or the end of the current epoch', async () => {
  assert.deepEqual(await getValidatorEpochs(node, new Date(13000), new Date(Date.now() + 86400000)), [
    { number: 3, endNumber: 3, startTime: 13000, endTime: null }
  ])
})

test('fails instead of reporting zero activity when epoch metadata is unavailable', async () => {
  await assert.rejects(getValidatorEpochs({ getEpochsInfo: async () => [] }, new Date(1000), new Date(12000)), /metadata unavailable/)
})

test('All covers the entire history with bounded groups and reuses metadata', async () => {
  let calls = 0
  const history = Array.from({ length: 20000 }, (_, number) => ({ number, startTime: 1000 + number * 1000 }))
  const sdk = {
    getEpochsInfo: async (count, ascending, from = 0) => {
      calls++
      return ascending ? history.slice(from, from + count) : [history.at(-1)]
    }
  }
  const result = await getValidatorEpochs(sdk, new Date(0), new Date())
  assert.equal(result.length, 84)
  assert.equal(result[0].number, 0)
  assert.equal(result.at(-1).endNumber, 19999)
  for (let i = 1; i < result.length; i++) {
    assert.equal(result[i - 1].endNumber + 1, result[i].number)
    assert.equal(result[i - 1].endTime, result[i].startTime)
  }
  assert.ok(calls < 120)
  const before = calls
  assert.deepEqual(await getValidatorEpochs(sdk, new Date(0), new Date()), result)
  assert.equal(calls, before)
})

test('missing internal history boundaries merge groups without dropping epochs', async () => {
  const history = Array.from({ length: 20000 }, (_, number) => ({ number, startTime: number * 1000 }))
  const sdk = {
    getEpochsInfo: async (count, ascending, from = 0) => {
      if (!ascending) return [history.at(-1)]
      return from > 0 && from < 10000 ? [] : history.slice(from, from + count)
    }
  }
  const points = await getValidatorEpochs(sdk, new Date(0), new Date())
  assert.equal(points[0].number, 0)
  assert.ok(points[0].endNumber >= 9999)
  assert.equal(points.at(-1).endNumber, 19999)
  assert.equal(points.reduce((sum, point) => sum + point.endNumber - point.number + 1, 0), 20000)
})

test('a gap within a returned batch merges groups without discarding their blocks', async () => {
  const history = Array.from({ length: 10 }, (_, number) => ({ number, startTime: number * 1000 }))
  const sdk = {
    getEpochsInfo: async (count, ascending, from = 0) => !ascending
      ? [history.at(-1)]
      : history.slice(from, from + count).filter(epoch => epoch.number !== 3)
  }
  const points = await getValidatorEpochs(sdk, new Date(0), new Date(9000))
  assert.equal(points.find(point => point.number === 2).endNumber, 3)
  assert.equal(points.reduce((sum, point) => sum + point.endNumber - point.number + 1, 0), 10)
})
