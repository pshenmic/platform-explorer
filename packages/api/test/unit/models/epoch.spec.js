const { describe, it } = require('node:test')
const assert = require('node:assert').strict
const Epoch = require('../../../src/models/Epoch')

describe('Epoch', () => {
  describe('Epoch.fromObject()', () => {
    it('should calculate last epoch', async () => {
      const genesisTime = new Date(0)

      const blockTimestamp = new Date(36000)

      const currentEpoch = Epoch.fromObject({ genesisTime, timestamp: blockTimestamp })

      assert.deepEqual(currentEpoch, new Epoch(
        0,
        new Date('1970-01-01T00:00:00.000Z'),
        new Date('1970-01-01T01:00:00.000Z')
      ))
    })
  })
})
