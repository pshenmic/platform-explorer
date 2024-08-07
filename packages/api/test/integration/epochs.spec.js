process.env.EPOCH_CHANGE_TIME = 3600000
const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const tenderdashRpc = require('../../src/tenderdashRpc')

describe('Epoch routes', () => {
  let app
  let client
  let knex

  let blocks
  let identities
  let transactions
  let validator

  before(async () => {
    mock.method(tenderdashRpc, 'getBlockByHeight', async () => ({
      block: {
        header: {
          time: new Date(0).toISOString()
        }
      }
    }))

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    blocks = []
    transactions = []
    identities = []

    await fixtures.cleanup(knex)

    validator = await fixtures.validator(knex)
    for (let i = 1; i <= 30; i++) {
      const block = await fixtures.block(knex, {
        height: i,
        timestamp: new Date(60000 * i),
        validator: i % 5 === 0 ? validator.pro_tx_hash : null
      })
      const identity = await fixtures.identity(knex, { block_hash: block.hash })
      const transaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        index: i,
        type: 0,
        gas_used: Math.ceil(Math.random() * 1000),
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
      const { body } = await client.get('/epoch/0')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedBlock = {
        epoch: {
          endTime: '1970-01-01T01:00:00.000Z',
          index: 0,
          startTime: '1970-01-01T00:00:00.000Z'

        },
        tps: (identities.length + transactions.length) / (process.env.EPOCH_CHANGE_TIME / 1000),
        totalCollectedFees: transactions.reduce((acc, tx) => acc + tx.gas_used, 0),
        bestValidator: validator.pro_tx_hash
      }
      assert.deepEqual(body, expectedBlock)
    })

    it('should return error if not valid date', async () => {
      await client.get('/epoch/10000000000000000000')
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })
})
