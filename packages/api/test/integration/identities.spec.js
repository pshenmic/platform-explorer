const { describe, it, before, after, beforeEach, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const tenderdashRpc = require('../../src/tenderdashRpc')
const DAPI = require('../../src/DAPI')

describe('Identities routes', () => {
  let app
  let client
  let knex

  let identity
  let alias
  let block
  let dataContract
  let dataContractTransaction
  let dataContracts
  let document
  let documents
  let transfer
  let transferTx
  let transfers
  let transaction
  let transactions

  let dataContractSchema

  before(async () => {
    dataContractSchema = {
      withdrawal: {
        type: 'object',
        indices: [
          {
            name: 'identityStatus',
            unique: false,
            properties: [
              {
                $ownerId: 'asc'
              },
              {
                status: 'asc'
              },
              {
                $createdAt: 'asc'
              }
            ]
          },
          {
            name: 'identityRecent',
            unique: false,
            properties: [
              {
                $ownerId: 'asc'
              },
              {
                $updatedAt: 'asc'
              },
              {
                status: 'asc'
              }
            ]
          },
          {
            name: 'pooling',
            unique: false,
            properties: [
              {
                status: 'asc'
              },
              {
                pooling: 'asc'
              },
              {
                coreFeePerByte: 'asc'
              },
              {
                $updatedAt: 'asc'
              }
            ]
          },
          {
            name: 'transaction',
            unique: false,
            properties: [
              {
                status: 'asc'
              },
              {
                transactionIndex: 'asc'
              }
            ]
          }
        ],
        required: [
          '$createdAt',
          '$updatedAt',
          'amount',
          'coreFeePerByte',
          'pooling',
          'outputScript',
          'status'
        ],
        properties: {
          amount: {
            type: 'integer',
            minimum: 1000,
            position: 2,
            description: 'The amount to be withdrawn'
          },
          status: {
            enum: [
              0,
              1,
              2,
              3,
              4
            ],
            type: 'integer',
            position: 6,
            description: '0 - Pending, 1 - Signed, 2 - Broadcasted, 3 - Complete, 4 - Expired'
          },
          pooling: {
            enum: [
              0,
              1,
              2
            ],
            type: 'integer',
            position: 4,
            description: 'This indicated the level at which Platform should try to pool this transaction'
          },
          outputScript: {
            type: 'array',
            maxItems: 25,
            minItems: 23,
            position: 5,
            byteArray: true
          },
          coreFeePerByte: {
            type: 'integer',
            maximum: 4294967295,
            minimum: 1,
            position: 3,
            description: 'This is the fee that you are willing to spend for this transaction in Duffs/Byte'
          },
          transactionIndex: {
            type: 'integer',
            minimum: 1,
            position: 0,
            description: 'Sequential index of asset unlock (withdrawal) transaction. Populated when a withdrawal pooled into withdrawal transaction'
          },
          transactionSignHeight: {
            type: 'integer',
            minimum: 1,
            position: 1,
            description: 'The Core height on which transaction was signed'
          }
        },
        description: 'Withdrawal document to track underlying withdrawal transactions. Withdrawals should be created with IdentityWithdrawalTransition',
        additionalProperties: false,
        creationRestrictionMode: 2
      }
    }

    mock.method(DAPI.prototype, 'getIdentityBalance', async () => 0)

    mock.method(DAPI.prototype, 'getContestedState', async () => null)

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
  })

  beforeEach(async () => {
    await fixtures.cleanup(knex)
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getIdentityByIdentifier()', async () => {
    it('should return identity by identifier', async () => {
      const block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash })
      const { alias } = await fixtures.identity_alias(knex,
        {
          alias: 'test.dash',
          identity
        }
      )

      const { body } = await client.get(`/identity/${identity.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        owner: identity.identifier,
        revision: identity.revision,
        balance: 0,
        timestamp: block.timestamp.toISOString(),
        txHash: identity.txHash,
        totalTxs: 1,
        totalTransfers: 0,
        totalDocuments: 0,
        totalDataContracts: 0,
        isSystem: false,
        aliases: [{
          alias,
          status: 'ok'
        }]
      }

      assert.deepEqual(body, expectedIdentity)
    })

    it('should return 404 when identity not found', async () => {
      await client.get('/identity/Cxo56ta5EMrWok8yp2Gpzm8cjBoa3mGYKZaAp9yqD3gW')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getIdentityWithdrawalByIdentifier()', async () => {
    it('should return default set of Withdrawals from state_transitions table', async () => {
      block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash })
      dataContract = await fixtures.dataContract(knex, {
        owner: identity.identifier,
        schema: dataContractSchema,
        identifier: '4fJLR2GYTPFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6'
      })

      transactions = []

      for (let i = 0; i < 10; i++) {
        block = await fixtures.block(knex)

        const transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          type: StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL,
          owner: identity.owner,
          data: 'BQFh0z9HiTN5e+TeiDU8fC2EPCExD20A9u/zFCSnVu59+/0AAAB0alKIAAEAAAEAAUEf89R9GPHIX5QLD/HKJ1xjd86KrnTsfAOxPMxBNDO8cJkAT5yUhcl/sGbQYoHSuNVIZcVVTVnSsYMXIyimihp3Vw=='
        })

        transactions.push({ transaction, block })
      }

      const withdrawals = transactions.sort((a, b) => a.block.height - b.block.height).map(transaction => ({
        timestamp: transaction.block.timestamp.toISOString(),
        hash: null,
        id: transaction.transaction.hash,
        sender: transaction.transaction.owner,
        amount: 12345678,
        status: 'COMPLETE'
      }))

      mock.method(DAPI.prototype, 'getDocumentsByOwner', async () => withdrawals)

      const { body } = await client.get(`/identity/${identity.identifier}/withdrawals`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.resultSet, withdrawals.map(withdrawal => ({
        hash: withdrawal.id,
        document: withdrawal.id,
        sender: withdrawal.sender,
        status: withdrawal.status,
        timestamp: withdrawal.timestamp,
        amount: withdrawal.amount,
        withdrawalAddress: null
      })))
    })

    it('should return 404 whe identity not exist', async () => {
      mock.method(DAPI.prototype, 'getDocumentsByOwner', async () => [])
      const { body } = await client.get('/identity/1234123123PFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6/withdrawals')
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.resultSet, [])
    })
  })

  describe('getIdentityByDPNS()', async () => {
    it('should return identity by dpns', async () => {
      const block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash })
      const { alias } = await fixtures.identity_alias(knex, { alias: 'test-name.1.dash', identity })

      const { body } = await client.get('/dpns/identity?dpns=test-name.1.dash')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        alias
      }

      assert.deepEqual(body, expectedIdentity)
    })

    it('should return identity by dpns with any case', async () => {
      const block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash })
      const { alias } = await fixtures.identity_alias(knex, { alias: 'test-name.2.dash', identity })

      const { body } = await client.get('/dpns/identity?dpns=TeSt-NaME.2.DAsH')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        alias
      }

      assert.deepEqual(body, expectedIdentity)
    })

    it('should return 404 when identity not found', async () => {
      await client.get('/dpns/identity?dpns=bad-name')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getIdentities()', async () => {
    it('should return default set of identities', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        alias = await fixtures.identity_alias(knex, { alias: `#test$${i}`, identity })
        identities.push({ identity, block })
        aliases.push(alias)
      }

      const { body } = await client.get('/identities')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities.slice(0, 10).map((_identity) => ({
        identifier: _identity.identity.identifier,
        owner: _identity.identity.identifier,
        revision: _identity.identity.revision,
        balance: 0,
        timestamp: _identity.block.timestamp.toISOString(),
        txHash: _identity.identity.txHash,
        totalTxs: 1,
        totalTransfers: 0,
        totalDocuments: 0,
        totalDataContracts: 0,
        isSystem: false,
        aliases: [
          aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier).alias
        ].map(alias => ({ alias, status: 'ok' }))
      }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })
    it('should return default set of identities desc', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        alias = await fixtures.identity_alias(knex, { alias: `#test1$${i}`, identity })
        identities.push({ identity, block })
        aliases.push(alias)
      }

      const { body } = await client.get('/identities?order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities
        .sort((a, b) => b.identity.id - a.identity.id)
        .slice(0, 10).map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: 0,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false,
          aliases: [
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier).alias
          ].map(alias => ({ alias, status: 'ok' }))
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow walk through pages', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        alias = await fixtures.identity_alias(knex, { alias: `#test2$${i}`, identity })
        identities.push({ identity, block })
        aliases.push(alias)
      }

      const { body } = await client.get('/identities?page=2')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities
        .sort((a, b) => a.identity.id - b.identity.id)
        .slice(10, 20).map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: 0,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false,
          aliases: [
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier).alias
          ].map(alias => ({ alias, status: 'ok' }))
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow walk through pages desc', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        alias = await fixtures.identity_alias(knex, { alias: `#test3$${i}`, identity })
        identities.push({ identity, block })
        aliases.push(alias)
      }

      const { body } = await client.get('/identities?page=2&limit=5&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 5)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 5)

      const expectedIdentities = identities
        .sort((a, b) => b.identity.id - a.identity.id)
        .slice(5, 10)
        .map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: 0,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false,
          aliases: [
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier).alias
          ].map(alias => ({ alias, status: 'ok' }))
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow sort by tx count', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        const transactions = []

        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })

        for (let j = 0; j < Math.floor(Math.random() * 50); j++) {
          const tx = await fixtures.transaction(knex, {
            block_hash: block.hash,
            type: StateTransitionEnum.DOCUMENTS_BATCH,
            owner: identity.identifier
          })

          transactions.push(tx)
        }

        identity.transactions = transactions

        identities.push({ identity, block })
        alias = await fixtures.identity_alias(knex, { alias: `#test3$${i}`, identity })
        aliases.push(alias)
      }

      const { body } = await client.get('/identities?order_by=tx_count&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities
        .sort((a, b) => b.identity.transactions.length - a.identity.transactions.length || b.identity.id - a.identity.id)
        .slice(0, 10)
        .map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: 0,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: _identity.identity.transactions.length + 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false,
          aliases: [
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier).alias
          ].map(alias => ({ alias, status: 'ok' }))
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow sort by balance', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        transferTx = await fixtures.transaction(knex, {
          block_hash: block.hash,
          type: StateTransitionEnum.IDENTITY_TOP_UP,
          owner: identity.identifier
        })
        transfer = await fixtures.transfer(knex, {
          amount: Math.floor(25 * (i + 1)),
          recipient: identity.identifier,
          state_transition_hash: transferTx.hash
        })

        identity.balance = transfer.amount

        identities.push({ identity, block, transfer })
        alias = await fixtures.identity_alias(knex, { alias: `#test3$${i}`, identity })
        aliases.push(alias)
      }

      mock.reset()

      mock.method(DAPI.prototype, 'getIdentityBalance', async (identifier) => {
        const { identity } = identities.find(({ identity }) => identity.identifier === identifier)
        return identity.balance
      })
      mock.method(tenderdashRpc, 'getBlockByHeight', async () => ({
        block: {
          header: {
            time: new Date(0).toISOString()
          }
        }
      }))

      const { body } = await client.get('/identities?order_by=balance&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities
        .sort((a, b) => b.identity.balance - a.identity.balance)
        .slice(0, 10)
        .map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: _identity.identity.balance,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: 2,
          totalTransfers: 1,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false,
          aliases: [
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier).alias
          ].map(alias => ({ alias, status: 'ok' }))
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })
  })

  describe('getDataContractsByIdentity()', async () => {
    it('should return default set of data contracts by identity', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier
        })
        dataContracts.push({ dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/dataContracts`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDataContracts = dataContracts.slice(0, 10).map((_dataContract) => ({
        identifier: _dataContract.dataContract.identifier,
        name: _dataContract.dataContract.name,
        owner: identity.identifier,
        version: 0,
        schema: null,
        txHash: _dataContract.transaction.hash,
        timestamp: _dataContract.block.timestamp.toISOString(),
        isSystem: false,
        documentsCount: 0
      }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should return default set of data contracts by identity desc', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier
        })
        dataContracts.push({ dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/dataContracts?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDataContracts = dataContracts
        .sort((a, b) => b.dataContract.id - a.dataContract.id)
        .slice(0, 10)
        .map((_dataContract) => ({
          identifier: _dataContract.dataContract.identifier,
          name: _dataContract.dataContract.name,
          owner: identity.identifier,
          version: 0,
          schema: null,
          txHash: _dataContract.transaction.hash,
          timestamp: _dataContract.block.timestamp.toISOString(),
          isSystem: false,
          documentsCount: 0
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should allow walk through pages', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier
        })
        dataContracts.push({ dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/dataContracts?page=2&limit=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 5)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 5)

      const expectedDataContracts = dataContracts
        .sort((a, b) => a.dataContract.id - b.dataContract.id)
        .slice(5, 10)
        .map((_dataContract) => ({
          identifier: _dataContract.dataContract.identifier,
          name: _dataContract.dataContract.name,
          owner: identity.identifier,
          version: 0,
          schema: null,
          txHash: _dataContract.transaction.hash,
          timestamp: _dataContract.block.timestamp.toISOString(),
          isSystem: false,
          documentsCount: 0
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should allow walk through pages desc', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier
        })
        dataContracts.push({ dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/dataContracts?page=2&limit=5&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 5)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 5)

      const expectedDataContracts = dataContracts
        .sort((a, b) => b.dataContract.id - a.dataContract.id)
        .slice(5, 10)
        .map((_dataContract) => ({
          identifier: _dataContract.dataContract.identifier,
          owner: identity.identifier,
          name: _dataContract.dataContract.name,
          version: 0,
          schema: null,
          txHash: _dataContract.transaction.hash,
          timestamp: _dataContract.block.timestamp.toISOString(),
          isSystem: false,
          documentsCount: 0
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })
  })

  describe('getDocumentsByIdentity()', async () => {
    it('should return default set of data contracts by identity', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents.slice(0, 10).map((_document) => ({
        identifier: _document.document.identifier,
        owner: identity.identifier,
        dataContractIdentifier: _document.dataContract.identifier,
        revision: 0,
        txHash: _document.transaction.hash,
        deleted: false,
        data: null,
        timestamp: _document.block.timestamp.toISOString(),
        isSystem: false
      }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should return default set of data contracts by identity dsc', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents
        .sort((a, b) => b.document.id - a.document.id)
        .slice(0, 10)
        .map((_document) => ({
          identifier: _document.document.identifier,
          owner: identity.identifier,
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 0,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          timestamp: _document.block.timestamp.toISOString(),
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should be able to walk through pages', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents?page=2&limit=3`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 3)

      const expectedDocuments = documents
        .sort((a, b) => a.document.id - b.document.id)
        .slice(3, 6)
        .map((_document) => ({
          identifier: _document.document.identifier,
          owner: identity.identifier,
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 0,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          timestamp: _document.block.timestamp.toISOString(),
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should be able to walk through pages desc', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents?page=2&limit=3&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 3)

      const expectedDocuments = documents
        .sort((a, b) => b.document.id - a.document.id)
        .slice(3, 6)
        .map((_document) => ({
          identifier: _document.document.identifier,
          owner: identity.identifier,
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 0,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          timestamp: _document.block.timestamp.toISOString(),
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })
  })

  describe('getTransactionsByIdentity()', async () => {
    it('should return default set of transactions by identity', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        transactions.push({ transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transactions`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = transactions
        .sort((a, b) => a.block.height - b.block.height)
        .slice(0, 10)
        .map((_transaction, i) => ({
          hash: _transaction.transaction.hash,
          index: 0,
          blockHash: _transaction.transaction.block_hash,
          blockHeight: _transaction.block.height,
          type: i === 0 ? StateTransitionEnum.IDENTITY_CREATE : StateTransitionEnum.DOCUMENTS_BATCH,
          data: null,
          timestamp: _transaction.block.timestamp.toISOString(),
          gasUsed: _transaction.transaction.gas_used,
          status: _transaction.transaction.status,
          error: _transaction.transaction.error,
          owner: {
            identifier: _transaction.transaction.owner,
            aliases: []
          }
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
    })

    it('should return default set of transactions by identity desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        transactions.push({ transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transactions?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = transactions
        .sort((a, b) => b.block.height - a.block.height)
        .slice(0, 10)
        .map((_transaction) => ({
          hash: _transaction.transaction.hash,
          index: 0,
          blockHash: _transaction.transaction.block_hash,
          blockHeight: _transaction.block.height,
          type: StateTransitionEnum.DOCUMENTS_BATCH,
          data: null,
          timestamp: _transaction.block.timestamp.toISOString(),
          gasUsed: _transaction.transaction.gas_used,
          status: _transaction.transaction.status,
          error: _transaction.transaction.error,
          owner: {
            identifier: _transaction.transaction.owner,
            aliases: []
          }
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
    })

    it('should allow walk through pages', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        transactions.push({ transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transactions?page=2&limit=4`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 4)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 4)

      const expectedTransactions = transactions
        .sort((a, b) => a.block.height - b.block.height)
        .slice(4, 8)
        .map((_transaction) => ({
          hash: _transaction.transaction.hash,
          index: 0,
          blockHash: _transaction.transaction.block_hash,
          blockHeight: _transaction.block.height,
          type: StateTransitionEnum.DOCUMENTS_BATCH,
          data: null,
          timestamp: _transaction.block.timestamp.toISOString(),
          gasUsed: _transaction.transaction.gas_used,
          status: _transaction.transaction.status,
          error: _transaction.transaction.error,
          owner: {
            identifier: _transaction.transaction.owner,
            aliases: []
          }
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
    })

    it('should allow walk through pages desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        transactions.push({ transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transactions?page=2&limit=4&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 4)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 4)

      const expectedTransactions = transactions
        .sort((a, b) => b.block.height - a.block.height)
        .slice(4, 8)
        .map((_transaction) => ({
          hash: _transaction.transaction.hash,
          index: 0,
          blockHash: _transaction.transaction.block_hash,
          blockHeight: _transaction.block.height,
          type: StateTransitionEnum.DOCUMENTS_BATCH,
          data: null,
          timestamp: _transaction.block.timestamp.toISOString(),
          gasUsed: _transaction.transaction.gas_used,
          status: _transaction.transaction.status,
          error: _transaction.transaction.error,
          owner: {
            identifier: _transaction.transaction.owner,
            aliases: []
          }
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
    })
  })

  describe('getTransfersByIdentity()', async () => {
    it('should return default set of transfers by identity', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransfers = transfers
        .sort((a, b) => a.block.height - b.block.height)
        .slice(0, 10)
        .map((_transfer) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString(),
          txHash: _transfer.transfer.state_transition_hash,
          type: _transfer.transaction.type,
          blockHash: _transfer.block.hash
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should return default set of transfers by identity desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransfers = transfers
        .sort((a, b) => b.block.height - a.block.height)
        .slice(0, 10)
        .map((_transfer) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString(),
          txHash: _transfer.transfer.state_transition_hash,
          type: _transfer.transaction.type,
          blockHash: _transfer.block.hash
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should allow to walk through pages', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?page=2&limit=7`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 7)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)

      const expectedTransfers = transfers
        .sort((a, b) => a.block.height - b.block.height)
        .slice(7, 14)
        .map((_transfer) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString(),
          txHash: _transfer.transfer.state_transition_hash,
          type: _transfer.transaction.type,
          blockHash: _transfer.block.hash
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should allow to walk through pages desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?page=2&limit=7&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 7)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)

      const expectedTransfers = transfers
        .sort((a, b) => b.block.height - a.block.height)
        .slice(7, 14)
        .map((_transfer) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString(),
          txHash: _transfer.transfer.state_transition_hash,
          type: _transfer.transaction.type,
          blockHash: _transfer.block.hash
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })
  })
})
