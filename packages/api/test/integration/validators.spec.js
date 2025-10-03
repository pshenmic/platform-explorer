process.env.EPOCH_CHANGE_TIME = 3600000

const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex, checkTcpConnect } = require('../../src/utils')
const BlockHeader = require('../../src/models/BlockHeader')
const tenderdashRpc = require('../../src/tenderdashRpc')
const DashCoreRPC = require('../../src/dashcoreRpc')
const ServiceNotAvailableError = require('../../src/errors/ServiceNotAvailableError')
const Epoch = require('../../src/models/Epoch')
const { base58 } = require('@scure/base')
const { IDENTITY_CREDIT_WITHDRAWAL } = require('../../src/enums/StateTransitionEnum')
const cache = require('../../src/cache')
const { NodeController } = require('dash-platform-sdk/src/node')
const { IdentitiesController } = require('dash-platform-sdk/src/identities')

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

  let timestamp

  let dashCoreRpcResponse
  let endpoints

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
    timestamp = new Date()

    endpoints = {
      coreP2PPortStatus: {
        host: '255.255.255.255',
        port: 255,
        status: 'ERR_OUT_OF_RANGE',
        message: 'The value of "msecs" is out of range. It must be a non-negative finite number. Received NaN'
      },
      platformP2PPortStatus: {
        host: '255.255.255.255',
        port: 255,
        status: 'ERR_OUT_OF_RANGE',
        message: 'The value of "msecs" is out of range. It must be a non-negative finite number. Received NaN'
      },
      platformGrpcPortStatus: {
        host: '255.255.255.255',
        port: 255,
        status: 'ERR_OUT_OF_RANGE',
        message: 'The value of "msecs" is out of range. It must be a non-negative finite number. Received NaN'
      }
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
        service: '255.255.255.255:255',
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
        platformP2PPort: 255,
        platformHTTPPort: 255,
        payoutAddress: 'yeRZBWYfeNE4yVUHV4ZLs83Ppn9aMRH57A',
        pubKeyOperator: 'af9cd8567923fea3f6e6bbf5e1b3a76bf772f6a3c72b41be15c257af50533b32cc3923cebdeda9fce7a6bc9659123d53'
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

    mock.method(cache, 'set', () => {})

    for (let i = 0; i < 50; i++) {
      const validator = await fixtures.validator(knex)
      validators.push(validator)
    }

    for (let i = 1; i <= 50; i++) {
      const block = await fixtures.block(
        knex,
        {
          validator: validators[i % 30].pro_tx_hash,
          height: i,
          timestamp
        }
      )

      blocks.push(block)
    }

    for (let i = 1; i <= 10; i++) {
      const block = await fixtures.block(
        knex,
        {
          validator: validators[1].pro_tx_hash,
          height: 50 + i,
          timestamp: new Date(new Date().getTime() + 3600000 + i)
        }
      )

      blocks.push(block)
    }

    for (let i = 0; i < 50; i++) {
      const identity = await fixtures.identity(knex, {
        identifier: base58.encode(Buffer.from(validators[i].pro_tx_hash, 'hex')),
        block_height: blocks[i].height,
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
          block_height: blocks[i].height,
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

    mock.method(NodeController.prototype, 'getEpochsInfo', epochInfo)

    mock.method(IdentitiesController.prototype, 'getIdentityBalance', async () => 0)

    mock.fn(checkTcpConnect, () => 'ERROR')
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
        identityBalance: '0',
        epochInfo: { ...fullEpochInfo },
        withdrawalsCount: 5,
        lastWithdrawal: transactions[transactions.length - 1].hash,
        lastWithdrawalTime: timestamp.toISOString(),
        endpoints
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
            validator: blockHeader.validator,
            totalGasUsed: 0,
            appHash: blockHeader.appHash
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
        identityBalance: '0',
        epochInfo: { ...fullEpochInfo },
        withdrawalsCount: 5,
        lastWithdrawal: transactions[transactions.length - 2].hash,
        lastWithdrawalTime: timestamp.toISOString(),
        endpoints
      }

      assert.deepEqual(body, expectedValidator)
    })

    it('should return 404 if validator not found', async () => {
      await client.get('/validator/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getValidatorByIdentity()', async () => {
    it('should return inactive validator by identifier', async () => {
      const [validator] = inactiveValidators

      const identifier = base58.encode(Buffer.from(validator.pro_tx_hash, 'hex'))

      const { body } = await client.get(`/validator/identity/${identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

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
        identity: identifier,
        identityBalance: '0',
        epochInfo: { ...fullEpochInfo },
        withdrawalsCount: 5,
        lastWithdrawal: transactions[transactions.length - 1].hash,
        lastWithdrawalTime: timestamp.toISOString(),
        endpoints
      }

      assert.deepEqual(body, expectedValidator)
    })

    it('should return active validator by identifier', async () => {
      const [validator] = activeValidators

      const identifier = base58.encode(Buffer.from(validator.pro_tx_hash, 'hex'))

      const { body } = await client.get(`/validator/identity/${identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

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
            validator: blockHeader.validator,
            appHash: blockHeader.appHash,
            totalGasUsed: 0
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
        identity: identifier,
        identityBalance: '0',
        epochInfo: { ...fullEpochInfo },
        withdrawalsCount: 5,
        lastWithdrawal: transactions[transactions.length - 2].hash,
        lastWithdrawalTime: timestamp.toISOString(),
        endpoints
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
                  validator: blockHeader.validator,
                  totalGasUsed: 0,
                  appHash: blockHeader.appHash
                }))
                .sort((a, b) => b.height - a.height)[0] ?? null,
              proTxInfo: {
                type: dashCoreRpcResponse.type,
                collateralHash: dashCoreRpcResponse.collateralHash,
                collateralIndex: dashCoreRpcResponse.collateralIndex,
                collateralAddress: dashCoreRpcResponse.collateralAddress,
                operatorReward: dashCoreRpcResponse.operatorReward,
                confirmations: dashCoreRpcResponse.confirmations,
                state: dashCoreRpcResponse.state
              },
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return all validators', async () => {
        const { body } = await client.get('/validators?limit=0')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, validators.length)

        const expectedValidators = validators
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
                  validator: blockHeader.validator,
                  totalGasUsed: 0,
                  appHash: blockHeader.appHash
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                  validator: blockHeader.validator,
                  totalGasUsed: 0,
                  appHash: blockHeader.appHash
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                    validator: blockHeader.validator,
                    appHash: blockHeader.appHash,
                    totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when there is none on the one bound', async () => {
        const { body } = await client.get('/validators?page=6')
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return all validators', async () => {
        const { body } = await client.get('/validators?isActive=true&limit=0')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, activeValidators.length)

        const expectedValidators = activeValidators
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
                  validator: blockHeader.validator,
                  appHash: blockHeader.appHash,
                  totalGasUsed: 0
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when there is none on the one bound', async () => {
        const { body } = await client.get('/validators?page=4&isActive=true')
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return all validators', async () => {
        const { body } = await client.get('/validators?isActive=false&limit=0')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.total, inactiveValidators.length)
        assert.equal(body.resultSet.length, inactiveValidators.length)

        const expectedValidators = inactiveValidators
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
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
              totalReward: null,
              epochReward: null,
              identity: identity.identifier,
              identityBalance: '0',
              epochInfo: { ...fullEpochInfo },
              withdrawalsCount: null,
              lastWithdrawal: null,
              lastWithdrawalTime: null,
              endpoints: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return less items when there is none on the one bound', async () => {
        const { body } = await client.get('/validators?page=4&isActive=false')
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

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/stats`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp).getTime()

      const expectedStats = []

      for (let i = 0; i < 12; i++) {
        const nextPeriod = firstTimestamp - 300000 * i
        const prevPeriod = firstTimestamp - 300000 * (i - 1)

        const blocksCount = blocks.filter(
          (block) => new Date(block.timestamp).getTime() <= prevPeriod &&
            new Date(block.timestamp).getTime() >= nextPeriod &&
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

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/stats?timestamp_start=${new Date().toISOString()}&timestamp_end=${new Date(new Date().getTime() + 80600000).toISOString()}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp).getTime()

      const expectedStats = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - 7200000 * i
        const prevPeriod = firstTimestamp - 7200000 * (i - 1)

        const blocksCount = blocks.filter(
          (block) => new Date(block.timestamp).getTime() <= prevPeriod &&
            new Date(block.timestamp).getTime() >= nextPeriod &&
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

    it('should return stats by proTxHash with custom timespan with intervalsCount', async () => {
      const [, validator] = validators

      const start = new Date()
      const end = new Date(start.getTime() + 80600000)

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/stats?timestamp_start=${start.toISOString()}&timestamp_end=${end.toISOString()}&intervalsCount=3`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const [firstPeriod] = body.toReversed()
      const firstTimestamp = new Date(firstPeriod.timestamp).getTime()

      const expectedStats = []

      for (let i = 0; i < body.length; i++) {
        const nextPeriod = firstTimestamp - Math.ceil((end - start) / 1000 / 3) * 1000 * i
        const prevPeriod = firstTimestamp - 26867000 * (i - 1)

        const blocksCount = blocks.filter(
          (block) => new Date(block.timestamp).getTime() <= prevPeriod &&
            new Date(block.timestamp).getTime() >= nextPeriod &&
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

    it('should return error on wrong bounds', async () => {
      await client.get(`/validator/${validators[0].pro_tx_hash}/stats?timestamp_start=2025-01-02T00:00:00&timestamp_end=2024-01-08T00:00:00`)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })
})
