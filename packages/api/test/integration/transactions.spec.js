const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const tenderdashRpc = require('../../src/tenderdashRpc')
const DAPI = require('../../src/DAPI')
const { IdentifierWASM } = require('pshenmic-dpp')
const BatchTypeEnum = require('../../src/enums/BatchEnum')

describe('Transaction routes', () => {
  let app
  let client
  let knex

  let identity
  let block
  let transactions
  let aliasTimestamp

  before(async () => {
    aliasTimestamp = new Date()

    mock.method(tenderdashRpc, 'getBlockByHeight', async () => ({
      block: {
        header: {
          time: new Date(0).toISOString()
        }
      }
    }))

    mock.method(DAPI.prototype, 'getDocuments', async () => [{
      properties: {
        label: 'alias',
        parentDomainName: 'dash',
        normalizedLabel: 'a11as'
      },
      id: new IdentifierWASM('AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW'),
      createdAt: BigInt(aliasTimestamp.getTime())
    }])

    const startDate = new Date(new Date() - 1000 * 60 * 60)

    app = await server.start()
    client = supertest(app.server)
    knex = getKnex()

    await fixtures.cleanup(knex)

    block = await fixtures.block(knex, {
      height: 1, timestamp: startDate
    })
    identity = await fixtures.identity(knex, {
      block_hash: block.hash,
      block_height: block.height
    })

    transactions = [{ transaction: identity.transaction, block }]

    // error tx
    const errorTx = await fixtures.transaction(knex, {
      block_hash: block.hash,
      block_height: block.height,
      data: '{}',
      type: StateTransitionEnum.BATCH,
      owner: identity.identifier,
      error: 'Cannot deserialize',
      status: 'FAIL'
    })
    transactions.push({ transaction: errorTx, block })

    for (let i = 2; i < 30; i++) {
      block = await fixtures.block(knex, {
        height: i + 1,
        timestamp: new Date(startDate.getTime() + i * 1000 * 60)
      })

      const transaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        data: '{}',
        type: StateTransitionEnum.DATA_CONTRACT_UPDATE,
        owner: identity.identifier,
        gas_used: i * 123
      })

      transactions.push({ transaction, block })
    }

    for (let i = 30; i < 60; i++) {
      block = await fixtures.block(knex, {
        height: i + 1, timestamp: new Date(startDate.getTime() + i * 1000 * 60)
      })

      for (let j = 0; j < Math.ceil(Math.random() * 30); j++) {
        const transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          data: '{}',
          type: j % 5 === 0 ? StateTransitionEnum.BATCH : StateTransitionEnum.DATA_CONTRACT_CREATE,
          batch_type: j % 5 === 0 ? 2 : undefined,
          owner: identity.identifier,
          index: j,
          gas_used: j * 123
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
        type: StateTransitionEnum[transaction.transaction.type],
        batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
        gasUsed: transaction.transaction.gas_used,
        status: transaction.transaction.status,
        error: transaction.transaction.error,
        owner: {
          identifier: transaction.transaction.owner,
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
        }
      }

      assert.deepEqual(expectedTransaction, body)
    })

    it('should return error transaction', async () => {
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
        type: StateTransitionEnum[transaction.transaction.type],
        batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
        gasUsed: 0,
        status: 'FAIL',
        error: 'Cannot deserialize',
        owner: {
          identifier: transaction.transaction.owner,
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
        }
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
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
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
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions desc with owner', async () => {
      const owner = transactions[0].transaction.owner

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = transactions
        .filter(transaction => transaction.transaction.owner === owner)
        .sort((a, b) => b.transaction.id - a.transaction.id)
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions desc with owner and type filter', async () => {
      const owner = transactions[0].transaction.owner

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}&transaction_type=0&transaction_type=8`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const txsWithType = transactions.filter(transaction => transaction.transaction.type === 0 || transaction.transaction.type === 8)

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, txsWithType.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = txsWithType
        .filter(transaction => transaction.transaction.owner === owner)
        .sort((a, b) => b.transaction.id - a.transaction.id)
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions desc with owner and batch filter', async () => {
      const owner = transactions[0].transaction.owner

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}&batch_type=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const txsWithType = transactions.filter(transaction => transaction.transaction.batch_type === 2)

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, txsWithType.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = txsWithType
        .filter(transaction => transaction.transaction.owner === owner)
        .sort((a, b) => b.transaction.id - a.transaction.id)
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions desc with owner and batch filter string', async () => {
      const owner = transactions[0].transaction.owner

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}&batch_type=DOCUMENT_DELETE`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const txsWithType = transactions.filter(transaction => transaction.transaction.batch_type === 2)

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, txsWithType.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = txsWithType
        .filter(transaction => transaction.transaction.owner === owner)
        .sort((a, b) => b.transaction.id - a.transaction.id)
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions desc with owner and type filter in string', async () => {
      const owner = transactions[0].transaction.owner

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}&transaction_type=0&transaction_type=MASTERNODE_VOTE`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const txsWithType = transactions.filter(transaction => transaction.transaction.type === 0 || transaction.transaction.type === 8)

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, txsWithType.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = txsWithType
        .filter(transaction => transaction.transaction.owner === owner)
        .sort((a, b) => b.transaction.id - a.transaction.id)
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions desc with owner and type filter and status', async () => {
      const owner = transactions[0].transaction.owner

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}&transaction_type=1&status=FAIL`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const txsWithType = transactions.filter(transaction => transaction.transaction.type === 1)

      assert.equal(body.resultSet.length, 1)
      assert.equal(body.pagination.total, 1)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = txsWithType
        .filter(transaction => transaction.transaction.status === 'FAIL')
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions desc with owner and type filter and min-max', async () => {
      const owner = transactions[0].transaction.owner

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}&transaction_type=0&gas_min=246&gas_max=1107`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const txsWithType = transactions
        .filter(transaction => transaction.transaction.type === 0)
        .filter(transaction => transaction.transaction.gas_used <= 1107 && transaction.transaction.gas_used >= 246)

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, txsWithType.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = txsWithType
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return default set of transactions with timestamp', async () => {
      const owner = transactions[0].transaction.owner

      const endTimestamp = transactions[0].block.timestamp.toISOString()
      const startTimestamp = transactions[100].block.timestamp.toISOString()

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}&transaction_type=0&gas_min=246&gas_max=1107&timestamp_start=${startTimestamp}&timestamp_end=${endTimestamp}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const txsWithType = transactions
        .filter(transaction => transaction.transaction.type === 0)
        .filter(transaction => transaction.block.timestamp.getTime() >= new Date(startTimestamp).getTime() && transaction.block.timestamp.getTime() <= new Date(endTimestamp).getTime())
        .filter(transaction => transaction.transaction.gas_used <= 1107 && transaction.transaction.gas_used >= 246)

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, txsWithType.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = txsWithType
        .slice(0, 10)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return empty set of transactions desc with owner and type filter', async () => {
      const owner = transactions[0].transaction.owner

      const { body } = await client.get(`/transactions?order=desc&owner=${owner}&transaction_type=7`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 0)
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
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return be able to walk through pages desc with ordering by id', async () => {
      const { body } = await client.get('/transactions?page=3&limit=3&order=desc&orderBy=id')
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
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return be able to walk through pages desc with ordering by gas_used', async () => {
      const { body } = await client.get('/transactions?page=3&limit=3&order=desc&orderBy=gas_used')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 3)

      const expectedTransactions = transactions
        .sort((a, b) => b.transaction.gas_used - a.transaction.gas_used)
        .slice(6, 9)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return be able to walk through pages asc with ordering by timestamp', async () => {
      const { body } = await client.get('/transactions?page=3&limit=3&order=asc&orderBy=timestamp')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 3)

      const expectedTransactions = transactions
        .sort((a, b) => new Date(a.block.timestamp).getTime() - new Date(b.block.timestamp).getTime())
        .slice(6, 9)
        .map(transaction => ({
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          data: '{}',
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          timestamp: transaction.block.timestamp.toISOString(),
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(expectedTransactions, body.resultSet)
    })

    it('should return be able to walk through pages', async () => {
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
          hash: transaction.transaction.hash,
          index: transaction.transaction.index,
          blockHash: transaction.block.hash,
          blockHeight: transaction.block.height,
          type: StateTransitionEnum[transaction.transaction.type],
          batchType: BatchTypeEnum[transaction.transaction.batch_type] ?? null,
          data: '{}',
          timestamp: transaction.block.timestamp.toISOString(),
          gasUsed: transaction.transaction.gas_used,
          status: transaction.transaction.status,
          error: transaction.transaction.error,
          owner: {
            identifier: transaction.transaction.owner,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ]
          }
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
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
        ).sort((a, b) => a.block.timestamp - b.block.timestamp)

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

    it('should return default series set timespan 2H', async () => {
      const { body } = await client.get(`/transactions/history?timestamp_start=${new Date(new Date().getTime() - 3600000).toISOString()}&timestamp_end=${new Date(new Date().getTime() + 3600000).toISOString()}&intervalsCount=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 5)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 1440000 * i
        const prevPeriod = firstTimestamp - 1440000 * (i - 1)

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
      const { body } = await client.get(`/transactions/history?timestamp_start=${new Date(new Date().getTime() - 43200000).toISOString()}&timestamp_end=${new Date(new Date().getTime() + 43200000).toISOString()}&intervalsCount=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 5)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 17280000 * i
        const prevPeriod = firstTimestamp - 17280000 * (i - 1)

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
      const { body } = await client.get(`/transactions/history?timestamp_start=${new Date(new Date().getTime() - 129600000).toISOString()}&timestamp_end=${new Date(new Date().getTime() + 129600000).toISOString()}&intervalsCount=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 5)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 51840000 * i
        const prevPeriod = firstTimestamp - 51840000 * (i - 1)

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
      const { body } = await client.get(`/transactions/history?timestamp_start=${new Date(new Date().getTime() - 302400000).toISOString()}&timestamp_end=${new Date(new Date().getTime() + 302400000).toISOString()}&intervalsCount=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 5)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 120960000 * i
        const prevPeriod = firstTimestamp - 120960000 * (i - 1)

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
    it('should return series of 6 intervals timespan 3d', async () => {
      const start = new Date(new Date().getTime())
      const end = new Date(start.getTime() + 10800000)

      const { body } = await client.get(`/transactions/history?timestamp_start=${start.toISOString()}&timestamp_end=${end.toISOString()}&intervalsCount=6`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 6)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - Math.ceil((end - start) / 1000 / 6) * 1000 * i
        const prevPeriod = firstTimestamp - 3600000 * (i - 1)

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

  describe('getGasHistorySeries()', async () => {
    it('should return default series set', async () => {
      const { body } = await client.get('/transactions/gas/history')
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

        const gas = txs.reduce((a, b) => a + b.transaction.gas_used, 0)

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            gas,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })

    it('should return default series set timespan 2H', async () => {
      const { body } = await client.get(`/transactions/gas/history?timestamp_start=${new Date(new Date().getTime() - 3600000).toISOString()}&timestamp_end=${new Date(new Date().getTime() + 3600000).toISOString()}&intervalsCount=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 5)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 1440000 * i
        const prevPeriod = firstTimestamp - 1440000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        const gas = txs.reduce((a, b) => a + b.transaction.gas_used, 0)

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            gas: txs[0]?.block?.height ? gas : 0,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })

    it('should return default series set timespan 24h', async () => {
      const { body } = await client.get(`/transactions/gas/history?timestamp_start=${new Date(new Date().getTime() - 43200000).toISOString()}&timestamp_end=${new Date(new Date().getTime() + 43200000).toISOString()}&intervalsCount=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 5)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 17280000 * i
        const prevPeriod = firstTimestamp - 17280000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        const gas = txs.reduce((a, b) => a + b.transaction.gas_used, 0)

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            gas: txs[0]?.block?.height ? gas : 0,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })

    it('should return default series set timespan 3d', async () => {
      const { body } = await client.get(`/transactions/gas/history?timestamp_start=${new Date(new Date().getTime() - 129600000).toISOString()}&timestamp_end=${new Date(new Date().getTime() + 129600000).toISOString()}&intervalsCount=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 5)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 51840000 * i
        const prevPeriod = firstTimestamp - 51840000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        const gas = txs.reduce((a, b) => a + b.transaction.gas_used, 0)

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            gas: txs[0]?.block?.height ? gas : 0,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })

    it('should return default series set timespan 1w', async () => {
      const { body } = await client.get(`/transactions/gas/history?timestamp_start=${new Date(new Date().getTime() - 302400000).toISOString()}&timestamp_end=${new Date(new Date().getTime() + 302400000).toISOString()}&intervalsCount=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 5)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 120960000 * i
        const prevPeriod = firstTimestamp - 120960000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        const gas = txs.reduce((a, b) => a + b.transaction.gas_used, 0)

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            gas: txs[0]?.block?.height ? gas : 0,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })
    it('should return series of 6 intervals timespan 3d', async () => {
      const start = new Date(new Date().getTime())
      const end = new Date(start.getTime() + 10800000)

      const { body } = await client.get(`/transactions/gas/history?timestamp_start=${start.toISOString()}&timestamp_end=${end.toISOString()}&intervalsCount=6`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 6)

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedSeriesData = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - Math.ceil((end - start) / 1000 / 6) * 1000 * i
        const prevPeriod = firstTimestamp - 3600000 * (i - 1)

        const txs = transactions.filter(transaction =>
          new Date(transaction.block.timestamp).getTime() <= prevPeriod &&
          new Date(transaction.block.timestamp).getTime() >= nextPeriod
        )

        const gas = txs.reduce((a, b) => a + b.transaction.gas_used, 0)

        expectedSeriesData.push({
          timestamp: new Date(nextPeriod).toISOString(),
          data: {
            gas: txs[0]?.block?.height ? gas : 0,
            blockHeight: txs[0]?.block?.height ?? null,
            blockHash: txs[0]?.block?.hash ?? null
          }
        })
      }

      assert.deepEqual(expectedSeriesData.reverse(), body)
    })
  })
})
