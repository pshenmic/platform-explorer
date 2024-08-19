const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const tenderdashRpc = require('../../src/tenderdashRpc')
const DAPI = require('../../src/dapi')

describe('Transaction routes', () => {
  let app
  let client
  let knex

  let identity
  let block
  let transactions

  before(async () => {
    mock.method(DAPI.prototype, 'initDAPI', () => {})

    mock.method(tenderdashRpc, 'getBlockByHeight', async () => ({
      block: {
        header: {
          time: new Date(0).toISOString()
        }
      }
    }))

    const startDate = new Date(new Date() - 1000 * 60 * 60)

    app = await server.start()
    client = supertest(app.server)
    knex = getKnex()

    await fixtures.cleanup(knex)

    block = await fixtures.block(knex, {
      height: 1, timestamp: startDate
    })
    identity = await fixtures.identity(knex, { block_hash: block.hash })

    transactions = [{ transaction: identity.transaction, block }]

    // error tx
    const errorTx = await fixtures.transaction(knex, {
      block_hash: block.hash,
      data: '{}',
      type: StateTransitionEnum.DOCUMENTS_BATCH,
      owner: identity.identifier,
      error: 'fake_err',
      status: 'FAIL'
    })
    transactions.push({ transaction: errorTx, block })

    for (let i = 2; i < 30; i++) {
      const block = await fixtures.block(knex, {
        height: i + 1, timestamp: new Date(startDate.getTime() + i * 1000 * 60)
      })

      const transaction = await fixtures.transaction(knex, {
        block_hash: block.hash, data: '{}', type: StateTransitionEnum.DATA_CONTRACT_CREATE, owner: identity.identifier
      })

      transactions.push({ transaction, block })
    }

    for (let i = 30; i < 60; i++) {
      const block = await fixtures.block(knex, {
        height: i + 1, timestamp: new Date(startDate.getTime() + i * 1000 * 60)
      })

      for (let j = 0; j < Math.ceil(Math.random() * 30); j++) {
        const transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          data: '{}',
          type: StateTransitionEnum.DATA_CONTRACT_CREATE,
          owner: identity.identifier,
          index: j
        })

        transactions.push({ transaction, block })
      }
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getTransactionByHash()', async () => {
    it('should return transaction', async () => {
      const [transaction] = transactions
      const { body } = await client.get(`/transaction/${transaction.transaction.hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedTransaction = {
        blockHash: transaction.block.hash,
        blockHeight: transaction.block.height,
        data: '{}',
        hash: transaction.transaction.hash,
        index: transaction.transaction.index,
        timestamp: transaction.block.timestamp.toISOString(),
        type: transaction.transaction.type,
        gasUsed: transaction.transaction.gas_used,
        status: transaction.transaction.status,
        error: transaction.transaction.error
      }

      assert.deepEqual(expectedTransaction, body)
    })

    it('should error transaction', async () => {
      const [, transaction] = transactions
      const { body } = await client.get(`/transaction/${transaction.transaction.hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedTransaction = {
        blockHash: transaction.block.hash,
        blockHeight: transaction.block.height,
        data: '{}',
        hash: transaction.transaction.hash,
        index: transaction.transaction.index,
        timestamp: transaction.block.timestamp.toISOString(),
        type: transaction.transaction.type,
        gasUsed: 0,
        status: 'FAIL',
        error: 'fake_err'
      }

      assert.deepEqual(expectedTransaction, body)
    })

    it('should return 404 if transaction not found', async () => {
      await client.get('/transaction/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getTransactions()', async () => {
    it('should return default set of transactions', async () => {
      const { body } = await client.get('/transactions')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = transactions
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: transaction.transaction.type,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions desc', async () => {
      const { body } = await client.get('/transactions?order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = transactions
        .sort((a, b) => b.transaction.id - a.transaction.id)
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: transaction.transaction.type,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return be able to walk through pages desc', async () => {
      const { body } = await client.get('/transactions?page=3&limit=3&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 3)

      const expectedTransactions = transactions
        .sort((a, b) => b.transaction.id - a.transaction.id)
        .slice(6, 9)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: transaction.transaction.type,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return be able to walk through pages desc', async () => {
      const { body } = await client.get('/transactions?page=3&limit=3')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 3)

      const expectedTransactions = transactions
        .sort((a, b) => a.transaction.id - b.transaction.id)
        .slice(6, 9)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: transaction.transaction.type,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })
  })

  describe('getHistorySeries()', async () => {
    it('should return default series set', async () => {
      const { body } = await client.get('/transactions/history')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 12)

      // todo add assert expected data series
      // didn't find a correct to do this yet
      // assert.deepEqual(expectedSeriesData, body)
    })
    it('should return default series set timespan 1h', async () => {
      const { body } = await client.get('/transactions/history?timespan=1h')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 12)

      // todo add assert expected data series
      // didn't find a correct to do this yet
      // assert.deepEqual(expectedSeriesData, body)
    })
    it('should return default series set timespan 24h', async () => {
      const { body } = await client.get('/transactions/history?timespan=24h')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 12)

      // todo add assert expected data series
      // didn't find a correct to do this yet
      // assert.deepEqual(expectedSeriesData, body)
    })
    it('should return default series set timespan 3d', async () => {
      const { body } = await client.get('/transactions/history?timespan=3d')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 12)

      // todo add assert expected data series
      // didn't find a correct to do this yet
      // assert.deepEqual(expectedSeriesData, body)
    })
    it('should return default series set timespan 1w', async () => {
      const { body } = await client.get('/transactions/history?timespan=1w')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 12)

      // todo add assert expected data series
      // didn't find a correct to do this yet
      // assert.deepEqual(expectedSeriesData, body)
    })
  })
})
