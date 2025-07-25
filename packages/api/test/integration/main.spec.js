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
  let document
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

    mock.method(DAPI.prototype, 'getContestedState', async () => null)

    mock.method(DAPI.prototype, 'getIdentityKeys', async () => null)

    mock.method(DAPI.prototype, 'getStatus', async () => null)

    mock.method(tenderdashRpc, 'getBlockByHeight', async () => ({
      block: {
        header: {
          time: new Date(0).toISOString()
        }
      }
    }))

    mock.method(DAPI.prototype, 'getDocuments', async () => [])

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
      data: '',
      owner: identityIdentifier
    })
    identity = await fixtures.identity(knex, {
      identifier: identityIdentifier,
      state_transition_hash: identityTransaction.hash,
      block_hash: block.hash
    })

    identityAlias = await fixtures.identity_alias(knex, {
      alias: 'dpns.dash',
      identity,
      state_transition_hash: identityTransaction.hash
    })

    dataContractTransaction = await fixtures.transaction(knex, {
      block_hash: block.hash,
      type: StateTransitionEnum.DATA_CONTRACT_CREATE,
      owner: identity.identifier,
      index: 1
    })
    dataContract = await fixtures.dataContract(knex, {
      state_transition_hash: dataContractTransaction.hash,
      owner: identity.identifier,
      name: 'test'
    })

    documentTransaction = await fixtures.transaction(knex, {
      block_hash: block.hash,
      type: StateTransitionEnum.BATCH,
      owner: identity.identifier,
      data: 'AgAOCeQUD4t3d4EL5WxH8KtcvZvtHnc6vZ+f3y/memaf9wEAAABgCLhdmCbncK0httWF8BDx37Oz8q3GSSMpu++P3sGx1wIEbm90ZdpXZPiQJeml9oBjOQnbWPb39tNYLERTk/FarViCHJ8r8Jo86sqi8SuYeboiPVuMZsMQbv5Y7cURVW8x7pZ2QSsBB21lc3NhZ2USMFR1dG9yaWFsIENJIFRlc3QgQCBUaHUsIDA4IEF1ZyAyMDI0IDIwOjI1OjAzIEdNVAAAAUEfLtRrTrHXdpT9Pzp4PcNiKV13nnAYAqrl0w3KfWI8QR5f7TTen0N66ZUU7R7AoXV8kliIwVqpxiCVwChbh2XiYQ==',
      index: 2
    })
    document = await fixtures.document(knex, {
      identifier: '7TsrNHXDy14fYoRcoYjZHH14K4riMGU2VeHMwopG82DL',
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
        timestamp: new Date(new Date().getTime() - 3600000 * i),
        height: i + 10
      })

      const transaction = await fixtures.transaction(knex, {
        block_hash: tmpBlock.hash,
        type: 0,
        owner: identity.identifier,
        gas_used: 10000
      })

      transactions.push(transaction.hash)
      blocks.push(tmpBlock)
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
          height: 1,
          timestamp: block.timestamp.toISOString(),
          blockVersion: block.block_version,
          appVersion: block.app_version,
          l1LockedHeight: block.l1_locked_height,
          validator: block.validator,
          totalGasUsed: 0,
          appHash: block.app_hash
        },
        txs: [
          {
            batchType: null,
            hash: identityTransaction.hash,
            index: identityTransaction.index,
            blockHash: identityTransaction.block_hash,
            blockHeight: null,
            type: identityTransaction.type,
            data: '',
            timestamp: block.timestamp.toISOString(),
            gasUsed: 0,
            status: 'SUCCESS',
            error: null,
            owner: {
              identifier: identityTransaction.owner,
              aliases: []
            }
          },
          {
            batchType: null,
            hash: dataContractTransaction.hash,
            index: dataContractTransaction.index,
            blockHash: dataContractTransaction.block_hash,
            blockHeight: null,
            type: dataContractTransaction.type,
            data: '{}',
            timestamp: block.timestamp.toISOString(),
            gasUsed: 0,
            status: 'SUCCESS',
            error: null,
            owner: {
              identifier: dataContractTransaction.owner,
              aliases: []
            }
          },
          {
            batchType: null,
            hash: documentTransaction.hash,
            index: documentTransaction.index,
            blockHash: documentTransaction.block_hash,
            blockHeight: null,
            type: documentTransaction.type,
            data: documentTransaction.data,
            timestamp: block.timestamp.toISOString(),
            gasUsed: 0,
            status: 'SUCCESS',
            error: null,
            owner: {
              identifier: documentTransaction.owner,
              aliases: []
            }
          }
        ]
      }

      assert.deepEqual({ blocks: [expectedBlock] }, body)
    })

    it('should search transaction by hash', async () => {
      const { body } = await client.get(`/search?query=${dataContractTransaction.hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedTransaction = {
        batchType: null,
        hash: dataContractTransaction.hash,
        index: dataContractTransaction.index,
        blockHash: dataContractTransaction.block_hash,
        blockHeight: block.height,
        type: dataContractTransaction.type,
        data: JSON.stringify(dataContractTransaction.data),
        timestamp: block.timestamp.toISOString(),
        gasUsed: dataContractTransaction.gas_used,
        status: dataContractTransaction.status,
        error: dataContractTransaction.error,
        owner: {
          identifier: dataContractTransaction.owner,
          aliases: []
        }
      }

      assert.deepEqual({ transactions: [expectedTransaction] }, body)
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
          validator: block.validator,
          totalGasUsed: 0,
          appHash: block.app_hash
        },
        txs: [identityTransaction.hash, dataContractTransaction.hash, documentTransaction.hash]
      }

      assert.deepEqual({ blocks: [expectedBlock] }, body)
    })

    it('should search by data contract', async () => {
      const { body } = await client.get(`/search?query=${dataContract.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContract = {
        identifier: dataContract.identifier,
        name: dataContract.name,
        owner: {
          identifier: identity.identifier.trim(),
          aliases: [
            {
              alias: 'dpns.dash',
              contested: false,
              status: 'ok',
              timestamp: null,
              txHash: identityTransaction.hash
            }
          ]
        },
        schema: JSON.stringify(dataContract.schema),
        version: 0,
        txHash: dataContractTransaction.hash,
        timestamp: block.timestamp.toISOString(),
        isSystem: false,
        documentsCount: 1,
        averageGasUsed: 0,
        identitiesInteracted: 1,
        totalGasUsed: 0,
        topIdentity: {
          identifier: identity.identifier.trim(),
          aliases: [
            {
              alias: 'dpns.dash',
              contested: false,
              status: 'ok',
              timestamp: null,
              txHash: identityTransaction.hash
            }
          ]
        }
      }

      assert.deepEqual({ dataContracts: [expectedDataContract] }, body)
    })

    it('should search by data contract name', async () => {
      const { body } = await client.get('/search?query=test')
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
        documentsCount: 1,
        averageGasUsed: null,
        identitiesInteracted: null,
        totalGasUsed: null,
        topIdentity: null
      }

      assert.deepEqual({ dataContracts: [expectedDataContract] }, body)
    })

    it('should search by document', async () => {
      const { body } = await client.get(`/search?query=${document.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContract = {
        identifier: document.identifier,
        dataContractIdentifier: dataContract.identifier,
        revision: 1,
        txHash: document.state_transition_hash,
        deleted: document.deleted,
        data: JSON.stringify(document.data),
        timestamp: new Date(0).toISOString(),
        system: false,
        entropy: 'f09a3ceacaa2f12b9879ba223d5b8c66c3106efe58edc511556f31ee9676412b',
        prefundedVotingBalance: null,
        documentTypeName: document.document_type_name,
        transitionType: 0,
        owner: {
          identifier: document.owner,
          aliases: [
            {
              alias: identityAlias.alias,
              contested: false,
              status: 'ok',
              timestamp: null,
              txHash: identityTransaction.hash
            }
          ]
        },
        gasUsed: null,
        totalGasUsed: 0,
        identityContractNonce: null
      }

      assert.deepEqual({ documents: [expectedDataContract] }, body)
    })

    it('should search by identity DPNS', async () => {
      mock.method(DAPI.prototype, 'getIdentityBalance', async () => 0)

      const { body } = await client.get(`/search?query=${identityAlias.alias}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = [{
        identifier: identity.identifier,
        alias: identityAlias.alias,
        status: {
          alias: identityAlias.alias,
          contested: false,
          status: 'ok',
          timestamp: block.timestamp.toISOString(),
          txHash: identityTransaction.hash
        }
      }]

      assert.deepEqual({ identities: expectedIdentity }, body)
    })

    it('should search identity', async () => {
      const { body } = await client.get(`/search?query=${identity.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        revision: 0,
        balance: '0',
        timestamp: block.timestamp.toISOString(),
        txHash: identityTransaction.hash,
        totalTxs: 51,
        totalTransfers: 0,
        totalDocuments: 1,
        totalDataContracts: 1,
        isSystem: false,
        owner: identity.identifier,
        aliases: [{
          alias: 'dpns.dash',
          contested: false,
          status: 'ok',
          timestamp: '1970-01-01T00:00:00.000Z',
          txHash: identityTransaction.hash
        }],
        totalGasSpent: 480000,
        averageGasSpent: 9412,
        totalTopUpsAmount: 0,
        totalWithdrawalsAmount: 0,
        lastWithdrawalHash: null,
        publicKeys: [],
        fundingCoreTx: null,
        lastWithdrawalTimestamp: null,
        totalTopUps: 0,
        totalWithdrawals: 0
      }

      assert.deepEqual({ identities: [expectedIdentity] }, body)
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
      const mockDapiStatus = {
        version: {
          dapiVersion: '1.5.1',
          driveVersion: '1.6.2',
          tenderdashVersion: '1.4.0',
          tenderdashP2pProtocol: 10,
          tenderdashBlockProtocol: 14,
          driveLatestProtocol: 6,
          driveCurrentProtocol: 6
        }
      }

      mock.reset()
      mock.method(DAPI.prototype, 'getTotalCredits', async () => 0)
      mock.method(DAPI.prototype, 'getStatus', async () => mockDapiStatus)
      mock.method(DAPI.prototype, 'getEpochsInfo', async () => [{
        number: 0,
        firstBlockHeight: '0',
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
          firstBlockHeight: '0',
          firstCoreBlockHeight: 0,
          startTime: 0,
          feeMultiplier: 0,
          endTime: null
        },
        identitiesCount: 1,
        transactionsCount: 51,
        totalCredits: '0',
        totalCollectedFeesDay: 240000,
        transfersCount: 0,
        dataContractsCount: 1,
        documentsCount: 1,
        network: null,
        indexer: {
          status: 'syncing',
          syncProgress: (blocks.length) / mockTDStatus?.highestBlock?.height * 100
        },
        api: {
          version: require('../../package.json').version,
          block: {
            height: blocks.length - 1,
            hash: blocks[blocks.length - 1].hash,
            timestamp: blocks[blocks.length - 1].timestamp.toISOString()
          }
        },
        tenderdash: {
          version: mockDapiStatus.version.tenderdashVersion ?? null,
          block: {
            height: mockTDStatus?.highestBlock?.height,
            hash: mockTDStatus?.highestBlock?.hash,
            timestamp: mockTDStatus?.highestBlock?.timestamp
          }
        },
        versions: {
          software: {
            dapi: mockDapiStatus.version.dapiVersion ?? null,
            drive: mockDapiStatus.version.driveVersion ?? null,
            tenderdash: mockDapiStatus.version.tenderdashVersion ?? null
          },
          protocol: {
            tenderdash: {
              p2p: mockDapiStatus.version.tenderdashP2pProtocol ?? null,
              block: mockDapiStatus.version.tenderdashBlockProtocol ?? null
            },
            drive: {
              latest: mockDapiStatus.version.driveLatestProtocol ?? null,
              current: mockDapiStatus.version.driveCurrentProtocol ?? null
            }
          }
        }
      }

      assert.deepEqual(body, expectedStats)
    })
  })
})
