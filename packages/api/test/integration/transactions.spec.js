const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const tenderdashRpc = require('../../src/tenderdashRpc')

describe('Transaction routes', () => {
  let app
  let client
  let knex

  let identity
  let block
  let transactions

  before(async () => {
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
      error: 'Cannot deserialize',
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
        error: 'Cannot deserialize'
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

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 300000 * i
        const prevPeriod = firstTimestamp - 300000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            txs: txs.length,
            blockHeight: txs[0]?.block?.height,
            blockHash: txs[0]?.block?.hash
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })

    it('should return default series set timespan 2H', async () => {
      const { body } = await client.get(`/transactions/history?start=${new Date(new Date().getTime() - 3600000).toISOString()}&end=${new Date(new Date().getTime() + 3600000).toISOString()}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 4)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 1800000 * i
        const prevPeriod = firstTimestamp - 1800000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            txs: txs.length,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })

    it('should return default series set timespan 24h', async () => {
      const { body } = await client.get(`/transactions/history?start=${new Date(new Date().getTime() - 43200000).toISOString()}&end=${new Date(new Date().getTime() + 43200000).toISOString()}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 12)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 7200000 * i
        const prevPeriod = firstTimestamp - 7200000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            txs: txs.length,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })

    it('should return default series set timespan 3d', async () => {
      const { body } = await client.get(`/transactions/history?start=${new Date(new Date().getTime() - 129600000).toISOString()}&end=${new Date(new Date().getTime() + 129600000).toISOString()}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 3)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 86400000 * i
        const prevPeriod = firstTimestamp - 86400000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            txs: txs.length,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })

    it('should return default series set timespan 1w', async () => {
      const { body } = await client.get(`/transactions/history?start=${new Date(new Date().getTime() - 302400000).toISOString()}&end=${new Date(new Date().getTime() + 302400000).toISOString()}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 7)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 86400000 * i
        const prevPeriod = firstTimestamp - 86400000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            txs: txs.length,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })
  })
})
