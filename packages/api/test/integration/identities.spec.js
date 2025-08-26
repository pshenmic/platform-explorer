const { describe, it, before, after, beforeEach, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const tenderdashRpc = require('../../src/tenderdashRpc')
const BatchEnum = require('../../src/enums/BatchEnum')
const ContestedResourcesController = require("dash-platform-sdk/src/contestedResources");
const {IdentitiesController} = require("dash-platform-sdk/src/identities");
const {DocumentsController} = require("dash-platform-sdk/src/documents");

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

    mock.method(IdentitiesController.prototype, 'getIdentityBalance', async () => 0)

    mock.method(IdentitiesController.prototype, 'getIdentityPublicKeys', async () => null)

    mock.method(ContestedResourcesController.default.prototype, 'getContestedResourceVoteState', async () => null)

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
      const block = await fixtures.block(knex, { timestamp: new Date(0) })
      const owner = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      const transaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        type: StateTransitionEnum.IDENTITY_CREATE,
        owner: owner.identifier,
        data: ''
      })
      const identity = await fixtures.identity(knex, {
        block_hash: block.hash,
        block_height: block.height,
        state_transition_hash: transaction.hash
      })
      const alias = await fixtures.identity_alias(knex,
        {
          alias: 'test.dash',
          identity,
          state_transition_hash: transaction.hash
        }
      )

      const { body } = await client.get(`/identity/${identity.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        owner: identity.identifier,
        revision: identity.revision,
        balance: '0',
        timestamp: block.timestamp.toISOString(),
        txHash: identity.txHash,
        totalTxs: 0,
        totalTransfers: 0,
        totalDocuments: 0,
        totalDataContracts: 0,
        isSystem: false,
        aliases: [{
          alias: alias.alias,
          contested: false,
          status: 'ok',
          timestamp: '1970-01-01T00:00:00.000Z',
          txHash: alias.state_transition_hash
        }],
        totalGasSpent: 0,
        averageGasSpent: 0,
        totalTopUpsAmount: 0,
        totalWithdrawalsAmount: 0,
        lastWithdrawalHash: null,
        lastWithdrawalTimestamp: null,
        totalTopUps: 0,
        totalWithdrawals: 0,
        publicKeys: [],
        fundingCoreTx: null
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
      const identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
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
          block_height: block.height,
          type: StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL,
          owner: identity.owner,
          data: 'BQFh0z9HiTN5e+TeiDU8fC2EPCExD20A9u/zFCSnVu59+/0AAAB0alKIAAEAAAEAAUEf89R9GPHIX5QLD/HKJ1xjd86KrnTsfAOxPMxBNDO8cJkAT5yUhcl/sGbQYoHSuNVIZcVVTVnSsYMXIyimihp3Vw=='
        })

        transactions.push({ transaction, block })
      }

      const withdrawals = transactions.sort((a, b) => b.block.height - a.block.height).map(transaction => ({
        createdAt: transaction.block.timestamp.getTime(),
        hash: null,
        id: {
          base58: () => transaction.transaction.hash
        },
        ownerId: {
          base58: () => transaction.transaction.owner
        },
        properties: {
          status: 0,
          amount: 12345678
        },
        getCreatedAt: () => transaction.block.timestamp,
        getId: () => transaction.transaction.hash,
        getOwnerId: () => transaction.transaction.owner,
        getData: () => ({ status: 0, amount: 12345678 })
      }))

      mock.method(DocumentsController.prototype, 'query', async () => withdrawals)

      const { body } = await client.get(`/identity/${identity.identifier}/withdrawals`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.resultSet, withdrawals.map(withdrawal => ({
        hash: withdrawal.id.base58(),
        document: withdrawal.id.base58(),
        sender: withdrawal.ownerId.base58(),
        status: 0,
        timestamp: new Date(withdrawal.createdAt).toISOString(),
        amount: withdrawal.properties.amount,
        withdrawalAddress: null
      })))
    })

    it('should return 404 when identity not exist', async () => {
      mock.method(DocumentsController.prototype, 'query', async () => [])
      const { body } = await client.get('/identity/D1111QnZXVpMW9yg4X6MjuWzSZ5Nui8TmCLUDY18FBtq/withdrawals')
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.resultSet, [])
    })
  })

  describe('getIdentityByDPNS()', async () => {
    it('should return identity by dpns', async () => {
      const block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      const alias = await fixtures.identity_alias(knex, {
        alias: 'test-name.1.dash',
        identity,
        state_transition_hash: identity.transaction.hash
      })

      const { body } = await client.get('/dpns/identity?dpns=test-name.1.dash')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        alias: alias.alias,
        status: {
          alias: alias.alias,
          contested: false,
          status: 'ok',
          timestamp: block.timestamp.toISOString(),
          txHash: alias.state_transition_hash
        }
      }

      assert.deepEqual(body, [expectedIdentity])
    })

    it('should return identity by dpns with any case', async () => {
      const block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      const alias = await fixtures.identity_alias(knex, {
        alias: 'test-name.2.dash',
        identity,
        state_transition_hash: identity.transaction.hash
      })

      const { body } = await client.get('/dpns/identity?dpns=TeSt-NaME.2.DAsH')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        alias: alias.alias,
        status: {
          alias: alias.alias,
          contested: false,
          status: 'ok',
          timestamp: block.timestamp.toISOString(),
          txHash: alias.state_transition_hash
        }
      }

      assert.deepEqual(body, [expectedIdentity])
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
        block = await fixtures.block(knex, { height: i + 1, timestamp: new Date(0) })
        identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
        alias = await fixtures.identity_alias(knex, {
          alias: `#test$${i}`,
          identity,
          state_transition_hash: identity.transaction.hash
        })
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
          aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier)
        ].map(alias => ({
          alias: alias.alias,
          txHash: alias.state_transition_hash,
          status: 'ok',
          contested: false,
          timestamp: '1970-01-01T00:00:00.000Z'
        })),
        totalGasSpent: null,
        averageGasSpent: null,
        totalTopUpsAmount: null,
        totalWithdrawalsAmount: null,
        lastWithdrawalHash: null,
        publicKeys: [],
        fundingCoreTx: null,
        lastWithdrawalTimestamp: null,
        totalTopUps: null,
        totalWithdrawals: null
      }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })
    it('should return default set of identities desc', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1, timestamp: new Date(0) })
        identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
        alias = await fixtures.identity_alias(knex, {
          alias: `#test1$${i}`,
          identity,
          state_transition_hash: identity.transaction.hash
        })
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
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier)
          ].map(alias => ({
            alias: alias.alias,
            txHash: alias.state_transition_hash,
            status: 'ok',
            contested: false,
            timestamp: '1970-01-01T00:00:00.000Z'
          })),
          totalGasSpent: null,
          averageGasSpent: null,
          totalTopUpsAmount: null,
          totalWithdrawalsAmount: null,
          lastWithdrawalHash: null,
          publicKeys: [],
          fundingCoreTx: null,
          lastWithdrawalTimestamp: null,
          totalTopUps: null,
          totalWithdrawals: null
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow walk through pages', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1, timestamp: new Date(0) })
        identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
        alias = await fixtures.identity_alias(knex, {
          alias: `#test2$${i}`,
          identity,
          state_transition_hash: identity.transaction.hash
        })
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
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier)
          ].map(alias => ({
            alias: alias.alias,
            txHash: alias.state_transition_hash,
            status: 'ok',
            contested: false,
            timestamp: '1970-01-01T00:00:00.000Z'
          })),
          totalGasSpent: null,
          averageGasSpent: null,
          totalTopUpsAmount: null,
          totalWithdrawalsAmount: null,
          lastWithdrawalHash: null,
          publicKeys: [],
          fundingCoreTx: null,
          lastWithdrawalTimestamp: null,
          totalTopUps: null,
          totalWithdrawals: null
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow walk through pages desc', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1, timestamp: new Date(0) })
        identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
        alias = await fixtures.identity_alias(knex, {
          alias: `#test3$${i}`,
          identity,
          state_transition_hash: identity.transaction.hash
        })
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
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier)
          ].map(alias => ({
            alias: alias.alias,
            txHash: alias.state_transition_hash,
            status: 'ok',
            contested: false,
            timestamp: '1970-01-01T00:00:00.000Z'
          })),
          totalGasSpent: null,
          averageGasSpent: null,
          totalTopUpsAmount: null,
          totalWithdrawalsAmount: null,
          lastWithdrawalHash: null,
          publicKeys: [],
          fundingCoreTx: null,
          lastWithdrawalTimestamp: null,
          totalTopUps: null,
          totalWithdrawals: null
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow sort by tx count', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        const transactions = []

        block = await fixtures.block(knex, { height: i + 1, timestamp: new Date(0) })
        identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

        for (let j = 0; j < Math.floor(Math.random() * 50); j++) {
          const tx = await fixtures.transaction(knex, {
            block_hash: block.hash,
            block_height: block.height,
            type: StateTransitionEnum.BATCH,
            owner: identity.identifier
          })

          transactions.push(tx)
        }

        identity.transactions = transactions

        identities.push({ identity, block })
        alias = await fixtures.identity_alias(knex, {
          alias: `#test3$${i}`,
          identity,
          state_transition_hash: identity.transaction.hash
        })
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
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier)
          ].map(alias => ({
            alias: alias.alias,
            txHash: alias.state_transition_hash,
            status: 'ok',
            contested: false,
            timestamp: '1970-01-01T00:00:00.000Z'
          })),
          totalGasSpent: null,
          averageGasSpent: null,
          totalTopUpsAmount: null,
          totalWithdrawalsAmount: null,
          lastWithdrawalHash: null,
          publicKeys: [],
          fundingCoreTx: null,
          lastWithdrawalTimestamp: null,
          totalTopUps: null,
          totalWithdrawals: null
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow sort by balance', async () => {
      const identities = []
      const aliases = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1, timestamp: new Date(0) })
        identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
        transferTx = await fixtures.transaction(knex, {
          block_height: block.height,
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
        alias = await fixtures.identity_alias(knex, {
          alias: `#test3$${i}`,
          identity,
          state_transition_hash: identity.transaction.hash
        })
        aliases.push(alias)
      }

      mock.reset()

      mock.method(IdentitiesController.prototype, 'getIdentityBalance', async (identifier) => {
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
            aliases.find((_alias) => _alias.identity_identifier === _identity.identity.identifier)
          ].map(alias => ({
            alias: alias.alias,
            txHash: alias.state_transition_hash,
            status: 'ok',
            contested: false,
            timestamp: '1970-01-01T00:00:00.000Z'
          })),
          totalGasSpent: null,
          averageGasSpent: null,
          totalTopUpsAmount: null,
          totalWithdrawalsAmount: null,
          lastWithdrawalHash: null,
          publicKeys: [],
          fundingCoreTx: null,
          lastWithdrawalTimestamp: null,
          totalTopUps: null,
          totalWithdrawals: null
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })
  })

  describe('getDataContractsByIdentity()', async () => {
    it('should return default set of data contracts by identity', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_height: block.height,
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
        documentsCount: 0,
        averageGasUsed: null,
        identitiesInteracted: null,
        topIdentity: null,
        totalGasUsed: null,
        groups: null,
        tokens: null
      }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should return default set of data contracts by identity desc', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_height: block.height,
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
          documentsCount: 0,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null,
          groups: null,
          tokens: null
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should allow walk through pages', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_height: block.height,
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
          documentsCount: 0,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null,
          tokens: null,
          groups: null
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should allow walk through pages desc', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_height: block.height,
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
          documentsCount: 0,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null,
          tokens: null,
          groups: null
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })
  })

  describe('getDocumentsByIdentity()', async () => {
    it('should return default set of documents by identity', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
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
        owner: {
          identifier: identity.identifier,
          aliases: []
        },
        dataContractIdentifier: _document.dataContract.identifier,
        revision: 1,
        txHash: _document.transaction.hash,
        deleted: false,
        data: null,
        entropy: null,
        prefundedVotingBalance: null,
        documentTypeName: 'type_name',
        timestamp: _document.block.timestamp.toISOString(),
        system: false,
        transitionType: BatchEnum[0],
        identityContractNonce: null,
        gasUsed: null,
        totalGasUsed: null
      }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should return default set of documents by identity dsc', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
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
          owner: {
            identifier: identity.identifier,
            aliases: []
          },
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 1,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          entropy: null,
          prefundedVotingBalance: null,
          documentTypeName: 'type_name',
          timestamp: _document.block.timestamp.toISOString(),
          system: false,
          transitionType: BatchEnum[0],
          gasUsed: null,
          identityContractNonce: null,
          totalGasUsed: null
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should return default set of documents by identity and type_name dsc', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id,
          document_type_name: i % 2 === 0 ? 'my_type' : 'non_my_type'
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents?order=desc&document_type_name=my_type`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length / 2)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents
        .filter(({ document }) => document.document_type_name === 'my_type')
        .sort((a, b) => b.document.id - a.document.id)
        .slice(0, 10)
        .map((_document) => ({
          identifier: _document.document.identifier,
          owner: {
            identifier: identity.identifier,
            aliases: []
          },
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 1,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          timestamp: _document.block.timestamp.toISOString(),
          system: false,
          transitionType: BatchEnum[0],
          documentTypeName: 'my_type',
          prefundedVotingBalance: null,
          entropy: null,
          gasUsed: null,
          identityContractNonce: null,
          totalGasUsed: null
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should be able to walk through pages', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
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
          owner: {
            identifier: identity.identifier,
            aliases: []
          },
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 1,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          entropy: null,
          prefundedVotingBalance: null,
          documentTypeName: 'type_name',
          timestamp: _document.block.timestamp.toISOString(),
          system: false,
          transitionType: BatchEnum[0],
          gasUsed: null,
          identityContractNonce: null,
          totalGasUsed: null
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should be able to walk through pages desc', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
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
          owner: {
            identifier: identity.identifier,
            aliases: []
          },
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 1,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          entropy: null,
          prefundedVotingBalance: null,
          documentTypeName: 'type_name',
          timestamp: _document.block.timestamp.toISOString(),
          system: false,
          transitionType: BatchEnum[0],
          gasUsed: null,
          identityContractNonce: null,
          totalGasUsed: null
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })
  })

  describe('getTransactionsByIdentity()', async () => {
    it('should return default set of transactions by identity', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
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
          batchType: i === 0 ? null : 'DOCUMENT_CREATE',
          data: i === 0 ? '{}' : 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ==',
          type: i === 0 ? StateTransitionEnum[StateTransitionEnum.IDENTITY_CREATE] : StateTransitionEnum[StateTransitionEnum.BATCH],
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
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
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
          batchType: 'DOCUMENT_CREATE',
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ==',
          type: StateTransitionEnum[StateTransitionEnum.BATCH],
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
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
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
          type: StateTransitionEnum[StateTransitionEnum.BATCH],
          batchType: 'DOCUMENT_CREATE',
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ==',
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
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.BATCH,
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ=='
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
          type: StateTransitionEnum[StateTransitionEnum.BATCH],
          batchType: 'DOCUMENT_CREATE',
          data: 'AgE+qIzJYi7CLZTbni56gjvhPCY9AygUa6gK/sM7NLqBrwEAAAAB7oqwuqydXWC3ZNKdsOewDBvVPG59q2STMTFBSX39PpsGBmRvbWFpbuZoxlmvZq7h5ywYbd57W34KHXEqCcQNVyH2Ir9TxTFVADX/3MRaB7Ujt7MChW+omvQ4l5lZQcj2oeuDAo1Xqp0DBwVsYWJlbBIRdGhlcmVhMXMxMW1zaGFkZHkPbm9ybWFsaXplZExhYmVsEhF0aGVyZWExczExbXNoYWRkeRpub3JtYWxpemVkUGFyZW50RG9tYWluTmFtZRIEZGFzaBBwYXJlbnREb21haW5OYW1lEgRkYXNoDHByZW9yZGVyU2FsdAwJO0EguXjRH+tISRlNWqdayLael99pDBeK2UHJ2GdO5AdyZWNvcmRzFgESCGlkZW50aXR5ED6ojMliLsItlNueLnqCO+E8Jj0DKBRrqAr+wzs0uoGvDnN1YmRvbWFpblJ1bGVzFgESD2FsbG93U3ViZG9tYWlucxMAARJwYXJlbnROYW1lQW5kTGFiZWz9AAAABKgXyAAAAUEfnR0sqWBSop6NAWColV8pyCWFMohaQWAFV0PbICNwdRltcTrEqKqQdowqzKZsz+PaWgkny8RwCmDE5Fxa7833rQ==',
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
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP,
          gas_used: 123
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
          type: StateTransitionEnum[_transfer.transaction.type],
          blockHash: _transfer.block.hash,
          gasUsed: _transfer.transaction.gas_used
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should return default set of transfers by identity and type', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: i % 2 === 0 ? 5 : 6,
          gas_used: 123
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?type=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, 15)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransfers = transfers
        .filter(_transfer => _transfer.transaction.type === 5)
        .sort((a, b) => a.block.height - b.block.height)
        .slice(0, 10)
        .map((_transfer) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString(),
          txHash: _transfer.transfer.state_transition_hash,
          type: StateTransitionEnum[_transfer.transaction.type],
          blockHash: _transfer.block.hash,
          gasUsed: _transfer.transaction.gas_used
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should return default set of transfers by identity and type with string value', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: i % 2 === 0 ? 5 : 6,
          gas_used: 123
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?type=IDENTITY_UPDATE`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, 15)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransfers = transfers
        .filter(_transfer => _transfer.transaction.type === 5)
        .sort((a, b) => a.block.height - b.block.height)
        .slice(0, 10)
        .map((_transfer) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString(),
          txHash: _transfer.transfer.state_transition_hash,
          type: StateTransitionEnum[_transfer.transaction.type],
          blockHash: _transfer.block.hash,
          gasUsed: _transfer.transaction.gas_used
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should return transfer by identity and tx hash', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transfers = []

      transaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        owner: identity.identifier,
        type: StateTransitionEnum.IDENTITY_TOP_UP,
        gas_used: 123
      })
      transfer = await fixtures.transfer(knex, {
        amount: 1000,
        recipient: identity.identifier,
        sender: null,
        state_transition_hash: transaction.hash
      })

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?hash=${transaction.hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 1)
      assert.equal(body.pagination.total, 1)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransfers = {
        amount: transfer.amount,
        sender: null,
        recipient: identity.identifier,
        timestamp: block.timestamp.toISOString(),
        txHash: transaction.hash,
        type: StateTransitionEnum[transaction.type],
        blockHash: block.hash,
        gasUsed: transaction.gas_used
      }

      assert.deepEqual(body.resultSet, [expectedTransfers])
    })

    it('should return default set of transfers by identity desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP,
          gas_used: 12
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
          type: StateTransitionEnum[_transfer.transaction.type],
          blockHash: _transfer.block.hash,
          gasUsed: _transfer.transaction.gas_used
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should allow to walk through pages', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP,
          gas_used: 22
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
          type: StateTransitionEnum[_transfer.transaction.type],
          blockHash: _transfer.block.hash,
          gasUsed: _transfer.transaction.gas_used
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should allow to walk through pages desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP,
          gas_used: 33
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
          type: StateTransitionEnum[_transfer.transaction.type],
          blockHash: _transfer.block.hash,
          gasUsed: _transfer.transaction.gas_used
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })
  })
})
