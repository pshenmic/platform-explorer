process.env.EPOCH_CHANGE_TIME = 3600000
const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const { getKnex } = require('../../src/utils')
const tenderdashRpc = require('../../src/tenderdashRpc')
const DAPI = require('../../src/DAPI')

const genesisTime = new Date(0)
const blockDiffTime = 2 * 3600 * 1000

describe('Other routes', () => {
  let app
  let client
  let knex

  let block
  let blocks
  let identityTransaction
  let identity
  let identityAlias
  let dataContractTransaction
  let dataContract
  let documentTransaction
  let transactions

  before(async () => {
    mock.method(DAPI.prototype, 'getIdentityBalance', async () => 0)
    mock.method(DAPI.prototype, 'getTotalCredits', async () => 0)
    mock.method(DAPI.prototype, 'getEpochsInfo', async () => [{
      number: 0,
      firstBlockHeight: 0,
      firstCoreBlockHeight: 0,
      startTime: 0,
      feeMultiplier: 0,
      nextEpoch: 0
    }])

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

    await fixtures.cleanup(knex)

    // Prepare an identity with data contract and document
    // 3 tx in one block
    // for the search() test

    const identityIdentifier = fixtures.identifier()
    block = await fixtures.block(knex, { timestamp: new Date(genesisTime + blockDiffTime) })
    blocks.push(block)

    identityTransaction = await fixtures.transaction(knex, {
      block_hash: block.hash,
      type: StateTransitionEnum.IDENTITY_CREATE,
      owner: identityIdentifier
    })
    identity = await fixtures.identity(knex, {
      identifier: identityIdentifier,
      state_transition_hash: identityTransaction.hash,
      block_hash: block.hash
    })

    identityAlias = await fixtures.identity_alias(knex, {
      alias: 'dpns.dash',
      identity
    })

    dataContractTransaction = await fixtures.transaction(knex, {
      block_hash: block.hash,
      type: StateTransitionEnum.DATA_CONTRACT_CREATE,
      owner: identity.identifier
    })
    dataContract = await fixtures.dataContract(knex, {
      state_transition_hash: dataContractTransaction.hash,
      owner: identity.identifier
    })

    documentTransaction = await fixtures.transaction(knex, {
      block_hash: block.hash,
      type: StateTransitionEnum.DOCUMENTS_BATCH,
      owner: identity.identifier
    })
    await fixtures.document(knex, {
      state_transition_hash: documentTransaction.hash,
      owner: identity.identifier,
      data_contract_id: dataContract.id
    })

    transactions.push(identityTransaction.hash)
    transactions.push(dataContractTransaction.hash)
    transactions.push(documentTransaction.hash)

    // prepare for get status

    for (let i = 1; i < 10; i++) {
      const newBlock = await fixtures.block(knex, {
        height: i + 1,
        timestamp: new Date(block.timestamp.getTime() + blockDiffTime * i)
      })
      blocks.push(newBlock)
    }

    for (let i = 0; i < 48; i++) {
      const tmpBlock = await fixtures.block(knex, {
        timestamp: new Date(new Date().getTime() - 3600000 * i)
      })
      const transaction = await fixtures.transaction(knex, {
        block_hash: tmpBlock.hash,
        type: 0,
        owner: identity.identifier,
        gas_used: 10000
      })
      transactions.push(transaction.hash)
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('search()', async () => {
    it('should search block by hash', async () => {
      const { body } = await client.get(`/search?query=${block.hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedBlock = {
        header: {
          hash: block.hash,
          height: block.height,
          timestamp: block.timestamp.toISOString(),
          blockVersion: block.block_version,
          appVersion: block.app_version,
          l1LockedHeight: block.l1_locked_height,
          validator: block.validator
        },
        txs: [identityTransaction.hash, dataContractTransaction.hash, documentTransaction.hash]
      }

      assert.deepEqual({ block: expectedBlock }, body)
    })

    it('should search transaction by hash', async () => {
      const { body } = await client.get(`/search?query=${dataContractTransaction.hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedTransaction = {
        hash: dataContractTransaction.hash,
        index: dataContractTransaction.index,
        blockHash: dataContractTransaction.block_hash,
        blockHeight: block.height,
        type: dataContractTransaction.type,
        data: JSON.stringify(dataContractTransaction.data),
        timestamp: block.timestamp.toISOString(),
        gasUsed: dataContractTransaction.gas_used,
        status: dataContractTransaction.status,
        error: dataContractTransaction.error
      }

      assert.deepEqual({ transaction: expectedTransaction }, body)
    })

    it('should search block by height', async () => {
      const { body } = await client.get(`/search?query=${block.height}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedBlock = {
        header: {
          hash: block.hash,
          height: block.height,
          timestamp: block.timestamp.toISOString(),
          blockVersion: block.block_version,
          appVersion: block.app_version,
          l1LockedHeight: block.l1_locked_height,
          validator: block.validator
        },
        txs: transactions
      }

      assert.deepEqual({ block: expectedBlock }, body)
    })

    it('should search by data contract', async () => {
      const { body } = await client.get(`/search?query=${dataContract.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContract = {
        identifier: dataContract.identifier,
        name: dataContract.name,
        owner: identity.identifier.trim(),
        schema: JSON.stringify(dataContract.schema),
        version: 0,
        txHash: dataContractTransaction.hash,
        timestamp: block.timestamp.toISOString(),
        isSystem: false,
        documentsCount: 1
      }

      assert.deepEqual({ dataContract: expectedDataContract }, body)
    })

    it('should search by identity DPNS', async () => {
      mock.method(DAPI.prototype, 'getIdentityBalance', async () => 0)

      const { body } = await client.get(`/search?query=${identityAlias.alias}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        revision: 0,
        balance: 0,
        timestamp: block.timestamp.toISOString(),
        txHash: identityTransaction.hash,
        totalTxs: 51,
        totalTransfers: 0,
        totalDocuments: 1,
        totalDataContracts: 1,
        isSystem: false,
        owner: identity.identifier,
        aliases: ['dpns.dash']
      }

      assert.deepEqual({ identity: expectedIdentity }, body)
    })

    it('should search identity', async () => {
      const { body } = await client.get(`/search?query=${identity.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        revision: 0,
        balance: 0,
        timestamp: block.timestamp.toISOString(),
        txHash: identityTransaction.hash,
        totalTxs: 51,
        totalTransfers: 0,
        totalDocuments: 1,
        totalDataContracts: 1,
        isSystem: false,
        owner: identity.identifier,
        aliases: ['dpns.dash']
      }

      assert.deepEqual({ identity: expectedIdentity }, body)
    })
  })

  describe('getStatus()', async () => {
    it('should return status', async () => {
      const mockTDStatus = {
        version: 'v2.0.0',
        highestBlock: {
          height: 1337,
          hash: 'DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF',
          timestamp: new Date().toISOString()
        }
      }
      mock.reset()
      mock.method(DAPI.prototype, 'getTotalCredits', async () => 0)
      mock.method(DAPI.prototype, 'getEpochsInfo', async () => [{
        number: 0,
        firstBlockHeight: 0,
        firstCoreBlockHeight: 0,
        startTime: 0,
        feeMultiplier: 0,
        nextEpoch: 0
      }])
      mock.method(tenderdashRpc, 'getStatus', async () => (mockTDStatus))
      mock.method(tenderdashRpc, 'getBlockByHeight', async () => ({
        block: {
          header: {
            time: new Date(0).toISOString()
          }
        }
      }))

      const { body } = await client.get('/status')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedStats = {
        epoch: {
          number: 0,
          firstBlockHeight: 0,
          firstCoreBlockHeight: 0,
          startTime: 0,
          feeMultiplier: 0,
          endTime: null
        },
        identitiesCount: 1,
        transactionsCount: 51,
        totalCredits: 0,
        totalCollectedFeesDay: 240000,
        transfersCount: 0,
        dataContractsCount: 1,
        documentsCount: 1,
        network: null,
        api: {
          version: require('../../package.json').version,
          block: {
            height: 10,
            hash: blocks[blocks.length - 1].hash,
            timestamp: blocks[blocks.length - 1].timestamp.toISOString()
          }
        },
        platform: {
          version: '1' + require('../../package.json').dependencies.dash.substring(1)
        },
        tenderdash: {
          version: mockTDStatus?.version ?? null,
          block: {
            height: mockTDStatus?.highestBlock?.height,
            hash: mockTDStatus?.highestBlock?.hash,
            timestamp: mockTDStatus?.highestBlock?.timestamp
          }
        }
      }

      assert.deepEqual(body, expectedStats)
    })
  })
})
