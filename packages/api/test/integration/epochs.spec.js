const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const tenderdashRpc = require('../../src/tenderdashRpc')

describe('Blocks routes', () => {
  let app
  let client
  let knex

  let blocks
  let identities
  let transactions

  before(async () => {
    mock.method(tenderdashRpc, 'getGenesis', async () => ({ genesis_time: new Date(0) }))

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    blocks = []
    transactions = []
    identities = []

    await fixtures.cleanup(knex)

    for (let i = 1; i < 31; i++) {
      const block = await fixtures.block(knex, { height: i, timestamp: new Date(60000 * i) })
      const identity = await fixtures.identity(knex, { block_hash: block.hash })
      const transaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        index: i,
        type: 0,
        owner: identity.identifier
      })
      blocks.push(block)
      transactions.push(transaction)
      identities.push(identity)
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getEpochInfo()', async () => {
    it('should return current epoch data', async () => {
      const { body } = await client.get('/getEpochByIndex/0')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedBlock = {
        epoch: {
          endTime: '1970-01-01T01:00:00.000Z',
          index: 0,
          startTime: '1970-01-01T00:00:00.000Z'

        },
        tps: (identities.length + transactions.length) / 3600
      }
      assert.deepEqual(body, expectedBlock)
    })

    it('should return error if not valid date', async () => {
      await client.get('/getEpochByIndex/10000000000000000000')
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })
})
