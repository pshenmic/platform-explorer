process.env.EPOCH_CHANGE_TIME = 3600000

const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const BlockHeader = require('../../src/models/BlockHeader')
const tenderdashRpc = require('../../src/tenderdashRpc')
const DashCoreRPC = require('../../src/dashcoreRpc')
const ServiceNotAvailableError = require('../../src/errors/ServiceNotAvailableError')
const DAPI = require('../../src/DAPI')
const Epoch = require('../../src/models/Epoch')
const { base58 } = require('@scure/base')
const { IDENTITY_CREDIT_WITHDRAWAL } = require('../../src/enums/StateTransitionEnum')

describe('Validators routes', () => {
  let app
  let client
  let knex

  let validators
  let activeValidators
  let inactiveValidators
  let blocks
  let identities
  let transactions

  let dashCoreRpcResponse

  let intervals

  let epochInfo
  let fullEpochInfo

  before(async () => {
    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()
    validators = []
    blocks = []
    identities = []
    transactions = []

    intervals = {
      '1h': 300000,
      '24h': 7200000,
      '3d': 21600000,
      '1w': 50400000
    }

    dashCoreRpcResponse = {
      type: 'Evo',
      proTxHash: '88251bd4b124efeb87537deabeec54f6c8f575f4df81f10cf5e8eea073092b6f',
      collateralHash: '6ce8545e25d4f03aba1527062d9583ae01827c65b234bd979aca5954c6ae3a59',
      collateralIndex: 3,
      collateralAddress: 'yM9Fgxk8bdqXq4ffv7bWpSFb68UCxCQaTX',
      operatorReward: 0,
      state: {
        version: 2,
        service: '52.33.28.47:19999',
        registeredHeight: 850334,
        lastPaidHeight: 1064465,
        consecutivePayments: 0,
        PoSePenalty: 0,
        PoSeRevivedHeight: 1027668,
        PoSeBanHeight: -1,
        revocationReason: 0,
        ownerAddress: 'yM1dzQB3cagstSbAsbyaz2uCcn5BxbiX69',
        votingAddress: 'yM1dzQB3cagstSbAsbyaz2uCcn5BxbiX69',
        platformNodeID: '711fd9548ae19b2e91c7a9b4067000467ccdd2b5',
        platformP2PPort: 36656,
        platformHTTPPort: 1443,
        payoutAddress: 'yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A',
        pubKeyOperator: 'af9cd8567923fea3f6e6bbf5e1b3a76bf772f6a3c72b41be15c257af50533b32cc3923cebdeda9fce7a6bc9659123d53',
        connectionInfo: {
          httpConnectable: false,
          p2pConnectable: false,
          serviceConnectable: false
        }
      },
      confirmations: 214276,
      metaInfo: {
        lastDSQ: 96910,
        mixingTxCount: 0,
        outboundAttemptCount: 0,
        lastOutboundAttempt: 0,
        lastOutboundAttemptElapsed: 1721031091,
        lastOutboundSuccess: 1720991464,
        lastOutboundSuccessElapsed: 39627
      }
    }

    await fixtures.cleanup(knex)

    mock.method(tenderdashRpc, 'getValidators', async () => [])

    for (let i = 0; i < 50; i++) {
      const validator = await fixtures.validator(knex)
      validators.push(validator)
    }

    for (let i = 1; i <= 50; i++) {
      const block = await fixtures.block(
        knex,
        { validator: validators[i % 30].pro_tx_hash, height: i }
      )

      blocks.push(block)
    }

    for (let i = 0; i < 50; i++) {
      const identity = await fixtures.identity(knex, {
        identifier: base58.encode(Buffer.from(validators[i].pro_tx_hash, 'hex')),
        block_hash: blocks[i].hash
      })

      identities.push(identity)
    }

    activeValidators = validators.sort((a, b) => a.id - b.id).slice(0, 30)
    inactiveValidators = validators.sort((a, b) => a.id - b.id).slice(30, 50)

    for (let i = 0; i < 10; i++) {
      const transaction = await fixtures.transaction(
        knex,
        {
          type: IDENTITY_CREDIT_WITHDRAWAL,
          block_hash: blocks[i].hash,
          owner: base58.encode(Buffer.from((
            (i % 2)
              ? inactiveValidators
              : activeValidators)[0].pro_tx_hash,
          'hex'))
        }
      )

      transactions.push(transaction)
    }

    const date = Date.now()

    epochInfo = () => [
      {
        number: 0,
        firstBlockHeight: 0,
        firstCoreBlockHeight: 1,
        startTime: date,
        feeMultiplier: 1
      }
    ]

    fullEpochInfo = Epoch.fromObject(epochInfo()[0])

    mock.method(tenderdashRpc, 'getValidators',
      async () =>
        Promise.resolve(activeValidators.map(activeValidator =>
          ({ pro_tx_hash: activeValidator.pro_tx_hash }))))

    mock.method(DashCoreRPC, 'getProTxInfo', async () => dashCoreRpcResponse)

    mock.method(DAPI.prototype, 'getEpochsInfo', epochInfo)

    mock.method(DAPI.prototype, 'getIdentityBalance', () => 0)
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getValidatorByProTxHash()', async () => {
    it('should return inactive validator by proTxHash', async () => {
      const [validator] = inactiveValidators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const identity = identities.find(identity =>
        identity.identifier === base58.encode(Buffer.from(validator.pro_tx_hash, 'hex')))

      const expectedValidator = {
        proTxHash: validator.pro_tx_hash,
        isActive: false,
        proposedBlocksAmount: 0,
        lastProposedBlockHeader: null,
        proTxInfo: {
          type: dashCoreRpcResponse.type,
          collateralHash: dashCoreRpcResponse.collateralHash,
          collateralIndex: dashCoreRpcResponse.collateralIndex,
          collateralAddress: dashCoreRpcResponse.collateralAddress,
          operatorReward: dashCoreRpcResponse.operatorReward,
          confirmations: dashCoreRpcResponse.confirmations,
          state: dashCoreRpcResponse.state
        },
        totalReward: 0,
        epochReward: 0,
        identity: identity.identifier,
        identityBalance: 0,
        epochInfo: { ...fullEpochInfo },
        withdrawlsCount: 5,
        lastWithdrawl: transactions[transactions.length - 1].hash
      }

      assert.deepEqual(body, expectedValidator)
    })

    it('should return active validator by proTxHash', async () => {
      const [validator] = activeValidators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const identity = identities.find(identity =>
        identity.identifier === base58.encode(Buffer.from(validator.pro_tx_hash, 'hex')))

      const expectedValidator = {
        proTxHash: validator.pro_tx_hash,
        isActive: true,
        proposedBlocksAmount: blocks.filter((block) => block.validator === validator.pro_tx_hash).length,
        lastProposedBlockHeader: blocks
          .filter((block) => block.validator === validator.pro_tx_hash)
          .map((block) => BlockHeader.fromRow(block))
          .map((blockHeader) => ({
            hash: blockHeader.hash,
            height: blockHeader.height,
            timestamp: blockHeader.timestamp.toISOString(),
            blockVersion: blockHeader.blockVersion,
            appVersion: blockHeader.appVersion,
            l1LockedHeight: blockHeader.l1LockedHeight,
            validator: blockHeader.validator
          }))
          .toReversed()[0] ?? null,
        proTxInfo: {
          type: dashCoreRpcResponse.type,
          collateralHash: dashCoreRpcResponse.collateralHash,
          collateralIndex: dashCoreRpcResponse.collateralIndex,
          collateralAddress: dashCoreRpcResponse.collateralAddress,
          operatorReward: dashCoreRpcResponse.operatorReward,
          confirmations: dashCoreRpcResponse.confirmations,
          state: dashCoreRpcResponse.state
        },
        totalReward: 0,
        epochReward: 0,
        identity: identity.identifier,
        identityBalance: 0,
        epochInfo: { ...fullEpochInfo },
        withdrawlsCount: 5,
        lastWithdrawl: transactions[transactions.length - 2].hash
      }

      assert.deepEqual(body, expectedValidator)
    })

    it('should return 404 if validator not found', async () => {
      await client.get('/validator/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getValidators()', async () => {
    describe('no filter', async () => {
      it('should return default set of validators', async () => {
        const { body } = await client.get('/validators')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = validators
          .slice(0, 10)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: activeValidators.some(validator => validator.pro_tx_hash === row.pro_tx_hash),
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return default set of validators order desc', async () => {
        const { body } = await client.get('/validators?order=desc')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = validators
          .toReversed()
          .slice(0, 10)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: activeValidators.some(validator => validator.pro_tx_hash === row.pro_tx_hash),
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should be able to walk through pages', async () => {
        const { body } = await client.get('/validators?page=2')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 2)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = validators
          .slice(10, 20)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: validators.some(validator => validator.pro_tx_hash === row.pro_tx_hash),
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return custom page size', async () => {
        const { body } = await client.get('/validators?limit=7')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 7)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, 7)

        const expectedValidators = validators
          .slice(0, 7)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive:
                validators.some(validator => validator.pro_tx_hash === row.pro_tx_hash),
              proposedBlocksAmount:
              blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader:
                blocks
                  .filter((block) => block.validator === row.pro_tx_hash)
                  .map((block) => BlockHeader.fromRow(block))
                  .map((blockHeader) => ({
                    hash: blockHeader.hash,
                    height: blockHeader.height,
                    timestamp: blockHeader.timestamp.toISOString(),
                    blockVersion: blockHeader.blockVersion,
                    appVersion: blockHeader.appVersion,
                    l1LockedHeight: blockHeader.l1LockedHeight,
                    validator: blockHeader.validator
                  }))
                  .toReversed()[0] ?? null,
              proTxInfo:
                {
                  type: dashCoreRpcResponse.type,
                  collateralHash: dashCoreRpcResponse.collateralHash,
                  collateralIndex: dashCoreRpcResponse.collateralIndex,
                  collateralAddress: dashCoreRpcResponse.collateralAddress,
                  operatorReward: dashCoreRpcResponse.operatorReward,
                  confirmations: dashCoreRpcResponse.confirmations,
                  state: dashCoreRpcResponse.state
                },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should allow to walk through pages with custom page size', async () => {
        const { body } = await client.get('/validators?limit=7&page=2')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 2)
        assert.equal(body.pagination.limit, 7)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, 7)

        const expectedValidators = validators
          .slice(7, 14)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: activeValidators.some(validator => validator.pro_tx_hash === row.pro_tx_hash),
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should allow to walk through pages with custom page size desc', async () => {
        const { body } = await client.get('/validators?limit=5&page=4&order=desc')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 4)
        assert.equal(body.pagination.limit, 5)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, 5)

        const expectedValidators = validators
          .toReversed()
          .slice(15, 20)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))

            return {
              proTxHash: row.pro_tx_hash,
              isActive: activeValidators.some(validator => validator.pro_tx_hash === row.pro_tx_hash),
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when when it is out of bounds', async () => {
        const { body } = await client.get('/validators?limit=6&page=9')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 9)
        assert.equal(body.pagination.limit, 6)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, 2)

        const expectedValidators = validators
          .slice(48, 50)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: activeValidators.some(validator => validator.pro_tx_hash === row.pro_tx_hash),
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when there is none on the one bound', async () => {
        const { body } = await client.get('/validators?limit=10&page=6')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 6)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, -1)
        assert.equal(body.resultSet.length, 0)

        const expectedValidators = []

        assert.deepEqual(body.resultSet, expectedValidators)
      })
    })

    describe('filter isActive = true', async () => {
      it('should return default set of validators', async () => {
        const { body } = await client.get('/validators?isActive=true')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = activeValidators
          .slice(0, 10)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: true,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return default set of validators order desc', async () => {
        const { body } = await client.get('/validators?order=desc&isActive=true')
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = activeValidators
          .toReversed()
          .slice(0, 10)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: true,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should be able to walk through pages', async () => {
        const { body } = await client.get('/validators?page=2&isActive=true')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 2)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = activeValidators
          .slice(10, 20)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: true,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return custom page size', async () => {
        const { body } = await client.get('/validators?limit=7&isActive=true')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 7)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, 7)

        const expectedValidators = activeValidators
          .slice(0, 7)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: true,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should allow to walk through pages with custom page size', async () => {
        const { body } = await client.get('/validators?limit=7&page=2&isActive=true')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 2)
        assert.equal(body.pagination.limit, 7)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, 7)

        const expectedValidators = activeValidators
          .slice(7, 14)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: true,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should allow to walk through pages with custom page size desc', async () => {
        const { body } = await client.get('/validators?limit=5&page=4&order=desc&isActive=true')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 4)
        assert.equal(body.pagination.limit, 5)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, 5)

        const expectedValidators = activeValidators
          .toReversed()
          .slice(15, 20)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: true,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when when it is out of bounds', async () => {
        const { body } = await client.get('/validators?limit=4&page=8&isActive=true')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 8)
        assert.equal(body.pagination.limit, 4)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, 2)

        const expectedValidators = activeValidators
          .slice(28, 30)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: true,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when there is none on the one bound', async () => {
        const { body } = await client.get('/validators?limit=10&page=4&isActive=true')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 4)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, -1)
        assert.equal(body.resultSet.length, 0)

        const expectedValidators = []

        assert.deepEqual(body.resultSet, expectedValidators)
      })
    })

    describe('filter isActive = false', async () => {
      it('should return default set of validators', async () => {
        const { body } = await client.get('/validators?isActive=false')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, inactiveValidators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = inactiveValidators
          .slice(0, 10)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: false,
              proposedBlocksAmount: 0,
              lastProposedBlockHeader: null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return default set of validators order desc', async () => {
        const { body } = await client.get('/validators?order=desc&isActive=false')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, inactiveValidators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = inactiveValidators
          .toReversed()
          .slice(0, 10)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: false,
              proposedBlocksAmount: 0,
              lastProposedBlockHeader: null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should be able to walk through pages', async () => {
        const { body } = await client.get('/validators?page=2&isActive=false')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 2)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, inactiveValidators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = inactiveValidators
          .slice(10, 20)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: false,
              proposedBlocksAmount: 0,
              lastProposedBlockHeader: null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return custom page size', async () => {
        const { body } = await client.get('/validators?limit=7&isActive=false')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 7)
        assert.equal(body.pagination.total, inactiveValidators.length)
        assert.equal(body.resultSet.length, 7)

        const expectedValidators = inactiveValidators
          .slice(0, 7)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: false,
              proposedBlocksAmount: 0,
              lastProposedBlockHeader: null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should allow to walk through pages with custom page size', async () => {
        const { body } = await client.get('/validators?limit=7&page=2&isActive=false')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 2)
        assert.equal(body.pagination.limit, 7)
        assert.equal(body.pagination.total, inactiveValidators.length)
        assert.equal(body.resultSet.length, 7)

        const expectedValidators = inactiveValidators
          .slice(7, 14)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: false,
              proposedBlocksAmount: 0,
              lastProposedBlockHeader: null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should allow to walk through pages with custom page size desc', async () => {
        const { body } = await client.get('/validators?limit=5&page=4&order=desc&isActive=false')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 4)
        assert.equal(body.pagination.limit, 5)
        assert.equal(body.pagination.total, inactiveValidators.length)
        assert.equal(body.resultSet.length, 5)

        const expectedValidators = inactiveValidators
          .toReversed()
          .slice(15, 20)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: false,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when when it is out of bounds', async () => {
        const { body } = await client.get('/validators?limit=3&page=7&isActive=false')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 7)
        assert.equal(body.pagination.limit, 3)
        assert.equal(body.pagination.total, inactiveValidators.length)
        assert.equal(body.resultSet.length, 2)

        const expectedValidators = inactiveValidators
          .slice(18, 20)
          .map(row => {
            const identity = identities.find(identity =>
              identity.identifier === base58.encode(Buffer.from(row.pro_tx_hash, 'hex')))
            return {
              proTxHash: row.pro_tx_hash,
              isActive: false,
              proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
              lastProposedBlockHeader: blocks
                .filter((block) => block.validator === row.pro_tx_hash)
                .map((block) => BlockHeader.fromRow(block))
                .map((blockHeader) => ({
                  hash: blockHeader.hash,
                  height: blockHeader.height,
                  timestamp: blockHeader.timestamp.toISOString(),
                  blockVersion: blockHeader.blockVersion,
                  appVersion: blockHeader.appVersion,
                  l1LockedHeight: blockHeader.l1LockedHeight,
                  validator: blockHeader.validator
                }))
                .toReversed()[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: 0,
              epochReward: 0,
              identity: identity.identifier,
              identityBalance: 0,
              epochInfo: { ...fullEpochInfo },
              withdrawlsCount: null,
              lastWithdrawl: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when there is none on the one bound', async () => {
        const { body } = await client.get('/validators?limit=10&page=4&isActive=false')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 4)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, -1)
        assert.equal(body.resultSet.length, 0)

        const expectedValidators = []

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return error when dashcore not available', async () => {
        mock.method(DashCoreRPC, 'getProTxInfo', async () => {
          throw new ServiceNotAvailableError()
        })

        await client.get('/validators')
          .expect(503)
          .expect('Content-Type', 'application/json; charset=utf-8')
      })

      it('should return error when tenderdash not available', async () => {
        mock.method(tenderdashRpc, 'getValidators', async () => {
          throw new ServiceNotAvailableError()
        })

        await client.get('/validators')
          .expect(503)
          .expect('Content-Type', 'application/json; charset=utf-8')
      })
    })
  })

  describe('getValidatorStatsByProTxHash()', async () => {
    it('should return stats by proTxHash', async () => {
      const [, validator] = validators
      const timespan = '1h'

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/stats`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedStats = []

      for (let i = 0; i < 12; i++) {
        const nextPeriod = firstTimestamp.getTime() - intervals[timespan] * i
        const prevPeriod = firstTimestamp.getTime() - intervals[timespan] * (i - 1)

        const blocksCount = blocks.filter(
          (block) => block.timestamp.getTime() <= prevPeriod &&
            block.timestamp.getTime() >= nextPeriod &&
            block.validator === validator.pro_tx_hash
        ).length

        expectedStats.push(
          {
            timestamp: new Date(nextPeriod).toISOString(),
            data: {
              blocksCount
            }
          }
        )
      }

      assert.deepEqual(expectedStats.reverse(), body)
    })

    it('should return stats by proTxHash with custom timespan', async () => {
      const [, validator] = validators
      const timespan = '24h'

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/stats?timespan=${timespan}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp)

      const expectedStats = []

      for (let i = 0; i < 12; i++) {
        const nextPeriod = firstTimestamp.getTime() - intervals[timespan] * i
        const prevPeriod = firstTimestamp.getTime() - intervals[timespan] * (i - 1)

        const blocksCount = blocks.filter(
          (block) => block.timestamp.getTime() <= prevPeriod &&
            block.timestamp.getTime() >= nextPeriod &&
            block.validator === validator.pro_tx_hash
        ).length

        expectedStats.push(
          {
            timestamp: new Date(nextPeriod).toISOString(),
            data: {
              blocksCount
            }
          }
        )
      }

      assert.deepEqual(expectedStats.reverse(), body)
    })

    it('should return error on wrong timespan', async () => {
      await client.get('/validator/3307F23FFAF8DE506325EF015C7C5F8BDF8E4E4621FD9002CB9FC307CF5A7F32/stats?timespan=2h')
        .expect(500)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })
})
