process.env.EPOCH_CHANGE_TIME = 3600000

const { describe, it, before, after, mock } = require('node:test')
const crypto = require('crypto')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex, checkTcpConnect } = require('../../src/utils')
const BlockHeader = require('../../src/models/BlockHeader')
const tenderdashRpc = require('../../src/tenderdashRpc')
const DashCoreRPC = require('../../src/dashcoreRpc')
const GeoIP = require('../../src/geoip')
const ServiceNotAvailableError = require('../../src/errors/ServiceNotAvailableError')
const Epoch = require('../../src/models/Epoch')
const { base58 } = require('@scure/base')
const { IDENTITY_CREDIT_WITHDRAWAL, IDENTITY_CREATE } = require('../../src/enums/StateTransitionEnum')
const cache = require('../../src/cache')
const { NodeController } = require('dash-platform-sdk/src/node')
const { IdentitiesController } = require('dash-platform-sdk/src/identities')

const currentQuorumHash = '0'.repeat(63) + '1'
const upcomingQuorumHash = '0'.repeat(63) + '2'

describe('Validators routes', () => {
  let app
  let client
  let knex

  let validators
  let activeValidators
  let upcomingValidators
  let inactiveValidators
  let blocks
  let identities
  let transactions

  let timestamp

  let dashCoreRpcResponse
  let endpoints
  let geoIpInfo

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

    geoIpInfo = {
      ipv4: '255.255.255.255',
      countryCode: 'US',
      city: 'Boardman',
      latitude: 45.8399,
      longitude: -119.7009
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

    mock.method(tenderdashRpc, 'getValidators', async () => ({ validators: [] }))

    mock.method(cache, 'set', () => {})

    for (let i = 0; i < 50; i++) {
      const validator = await fixtures.validator(knex)
      validators.push(validator)
    }

    // every validator was paid 1 DASH once in the Core blocks 1001 - 1050
    for (const [i, validator] of validators.entries()) {
      await fixtures.corePayment(knex, { core_block_height: 1001 + i, pro_tx_hash: validator.pro_tx_hash, amount: 100000000 })
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
    // the inactive half splits again: the first ten sit in a quorum that has not
    // taken over yet ("upcoming"), the rest are in no quorum at all ("queued")
    upcomingValidators = validators.sort((a, b) => a.id - b.id).slice(30, 40)
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

    mock.method(tenderdashRpc, 'getValidators', async () => ({
      quorumHash: currentQuorumHash,
      quorumType: 6,
      validators: activeValidators.map(activeValidator =>
        ({ pro_tx_hash: activeValidator.pro_tx_hash }))
    }))

    mock.method(DashCoreRPC, 'getQuorumsListExtended', async () => ({
      llmq_25_67: [
        {
          [currentQuorumHash.toLowerCase()]: {
            creationHeight: 2,
            minedBlockHash: 'a'.repeat(64),
            numValidMembers: activeValidators.length,
            healthRatio: '1.00'
          }
        },
        {
          [upcomingQuorumHash.toLowerCase()]: {
            creationHeight: 1,
            minedBlockHash: 'b'.repeat(64),
            numValidMembers: upcomingValidators.length,
            healthRatio: '1.00'
          }
        }
      ]
    }))

    mock.method(DashCoreRPC, 'getQuorumInfo', async (quorumHash) => ({
      height: 1,
      type: 'llmq_25_67',
      quorumHash,
      quorumIndex: 0,
      minedBlock: 'a'.repeat(64),
      quorumPublicKey: 'c'.repeat(96),
      members: (quorumHash.toUpperCase() === currentQuorumHash ? activeValidators : upcomingValidators)
        .map(validator => ({ proTxHash: validator.pro_tx_hash.toLowerCase(), valid: true }))
    }))

    mock.method(DashCoreRPC, 'getProTxInfo', async () => dashCoreRpcResponse)

    mock.method(DashCoreRPC, 'getBlockHash', async (height) => height.toString(16).padStart(64, '0'))

    // a Core block every 150 seconds
    mock.method(DashCoreRPC, 'getBlockStats', async (height) => ({ time: height * 150 }))

    mock.method(DashCoreRPC, 'getBlockCount', async () => 1100000)

    mock.method(GeoIP, 'lookup', () => geoIpInfo)

    // every validator was paid at a different height, so the payment queue follows the list order
    mock.method(DashCoreRPC, 'getProTxList', async () =>
      validators.map((validator, i) =>
        ({ proTxHash: validator.pro_tx_hash, type: 'Evo', state: { PoSeBanHeight: -1, PoSeRevivedHeight: -1, lastPaidHeight: i + 1, registeredHeight: 1 } })))

    mock.method(GeoIP, 'lookup', () => geoIpInfo)

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
        endpoints,
        geoIpInfo,
        registeredAt: new Date(850334 * 150 * 1000).toISOString(),
        votingIdentity: base58.encode(crypto.createHash('sha256')
          .update(Buffer.from(validator.pro_tx_hash, 'hex'))
          .update(base58.decode(dashCoreRpcResponse.state.votingAddress).subarray(1, 21))
          .digest()),
        votingIdentityBalance: '0',
        poseScoreMax: 100,
        blocksUntilCorePayment: validators.findIndex(row => row.pro_tx_hash === validator.pro_tx_hash) + 1,
        registeredCoreBlockHash: (850334).toString(16).padStart(64, '0'),
        lastPaidCoreBlockHash: (1064465).toString(16).padStart(64, '0'),
        poseRevivedCoreBlockHash: (1027668).toString(16).padStart(64, '0'),
        poseBanCoreBlockHash: null,
        // 1 DASH per 50 Core blocks of 150 seconds
        coreYieldPerYear: 4204.8,
        coreTipTime: new Date(1100000 * 150 * 1000).toISOString(),
        coreBlockIntervalMs: 150000
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
            appHash: blockHeader.appHash,
            quorumHash: blockHeader.quorumHash
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
        endpoints,
        geoIpInfo,
        registeredAt: new Date(850334 * 150 * 1000).toISOString(),
        votingIdentity: base58.encode(crypto.createHash('sha256')
          .update(Buffer.from(validator.pro_tx_hash, 'hex'))
          .update(base58.decode(dashCoreRpcResponse.state.votingAddress).subarray(1, 21))
          .digest()),
        votingIdentityBalance: '0',
        poseScoreMax: 100,
        blocksUntilCorePayment: validators.findIndex(row => row.pro_tx_hash === validator.pro_tx_hash) + 1,
        registeredCoreBlockHash: (850334).toString(16).padStart(64, '0'),
        lastPaidCoreBlockHash: (1064465).toString(16).padStart(64, '0'),
        poseRevivedCoreBlockHash: (1027668).toString(16).padStart(64, '0'),
        poseBanCoreBlockHash: null,
        // 1 DASH per 50 Core blocks of 150 seconds
        coreYieldPerYear: 4204.8,
        coreTipTime: new Date(1100000 * 150 * 1000).toISOString(),
        coreBlockIntervalMs: 150000
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
        endpoints,
        geoIpInfo,
        registeredAt: new Date(850334 * 150 * 1000).toISOString(),
        votingIdentity: base58.encode(crypto.createHash('sha256')
          .update(Buffer.from(validator.pro_tx_hash, 'hex'))
          .update(base58.decode(dashCoreRpcResponse.state.votingAddress).subarray(1, 21))
          .digest()),
        votingIdentityBalance: '0',
        poseScoreMax: 100,
        blocksUntilCorePayment: validators.findIndex(row => row.pro_tx_hash === validator.pro_tx_hash) + 1,
        registeredCoreBlockHash: (850334).toString(16).padStart(64, '0'),
        lastPaidCoreBlockHash: (1064465).toString(16).padStart(64, '0'),
        poseRevivedCoreBlockHash: (1027668).toString(16).padStart(64, '0'),
        poseBanCoreBlockHash: null,
        // 1 DASH per 50 Core blocks of 150 seconds
        coreYieldPerYear: 4204.8,
        coreTipTime: new Date(1100000 * 150 * 1000).toISOString(),
        coreBlockIntervalMs: 150000
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
            quorumHash: blockHeader.quorumHash,
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
        endpoints,
        geoIpInfo,
        registeredAt: new Date(850334 * 150 * 1000).toISOString(),
        votingIdentity: base58.encode(crypto.createHash('sha256')
          .update(Buffer.from(validator.pro_tx_hash, 'hex'))
          .update(base58.decode(dashCoreRpcResponse.state.votingAddress).subarray(1, 21))
          .digest()),
        votingIdentityBalance: '0',
        poseScoreMax: 100,
        blocksUntilCorePayment: validators.findIndex(row => row.pro_tx_hash === validator.pro_tx_hash) + 1,
        registeredCoreBlockHash: (850334).toString(16).padStart(64, '0'),
        lastPaidCoreBlockHash: (1064465).toString(16).padStart(64, '0'),
        poseRevivedCoreBlockHash: (1027668).toString(16).padStart(64, '0'),
        poseBanCoreBlockHash: null,
        // 1 DASH per 50 Core blocks of 150 seconds
        coreYieldPerYear: 4204.8,
        coreTipTime: new Date(1100000 * 150 * 1000).toISOString(),
        coreBlockIntervalMs: 150000
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
                  appHash: blockHeader.appHash,
                  quorumHash: blockHeader.quorumHash
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                  appHash: blockHeader.appHash,
                  quorumHash: blockHeader.quorumHash
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                  appHash: blockHeader.appHash,
                  quorumHash: blockHeader.quorumHash
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                    quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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

    describe('other filters', async () => {
      it('should return set by blocks_proposed_min and blocks_proposed_max', async () => {
        const { body } = await client.get('/validators?blocks_proposed_min=2&blocks_proposed_max=12')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, 20)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = validators
          .filter(row => {
            const proposedBlocksCount = blocks.filter((block) => block.validator === row.pro_tx_hash).length
            return proposedBlocksCount >= 2
          })
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
                  appHash: blockHeader.appHash,
                  quorumHash: blockHeader.quorumHash
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return set by blocks_proposed_min and blocks_proposed_max, last_proposed_block_height_min and last_proposed_block_height_max', async () => {
        const { body } = await client.get('/validators?blocks_proposed_min=2&blocks_proposed_max=12&last_proposed_block_height_min=35&last_proposed_block_height_max=50')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, 16)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = validators
          .filter(row => {
            const proposedBlocks = blocks.filter((block) => block.validator === row.pro_tx_hash)

            const [lastProposedBlock] = proposedBlocks
              .sort((a, b) => b.height - a.height)

            return proposedBlocks.length >= 2 && proposedBlocks.length <= 12 && lastProposedBlock.height >= 35 && lastProposedBlock.height <= 50
          })
          .sort((a, b) => a.id - b.id)
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
                  appHash: blockHeader.appHash,
                  quorumHash: blockHeader.quorumHash
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return set by last_proposed_block_hash', async () => {
        const [block] = blocks.reverse()

        const { body } = await client.get(`/validators?last_proposed_block_hash=${block.hash}`)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, 1)
        assert.equal(body.resultSet.length, 1)

        const expectedValidators = validators
          .filter(row => {
            const proposedBlocks = blocks.filter((block) => block.validator === row.pro_tx_hash)

            const [lastProposedBlock] = proposedBlocks
              .sort((a, b) => b.height - a.height)

            return lastProposedBlock?.hash === block.hash
          })
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
                  appHash: blockHeader.appHash,
                  quorumHash: blockHeader.quorumHash
                }))[0] ?? null,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
            }
          })

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return validators by owner', async () => {
        const [validator] = validators

        const owner = base58.encode(Buffer.from(validator.pro_tx_hash, 'hex'))

        const { body } = await client.get(`/validators?owner=${owner}`)
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        const expectedValidators = [validator]
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
                  totalGasUsed: 0,
                  appHash: blockHeader.appHash,
                  quorumHash: blockHeader.quorumHash
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
            }
          })

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
          .sort((a, b) => a.id - b.id)
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
                .sort((a, b) => a.height - b.height)
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                .sort((a, b) => a.height - b.height)
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                .sort((a, b) => a.height - b.height)
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                .sort((a, b) => a.height - b.height)
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                .sort((a, b) => a.height - b.height)
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                .sort((a, b) => a.height - b.height)
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                .sort((a, b) => a.height - b.height)
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
                  quorumHash: blockHeader.quorumHash,
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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
              endpoints: null,
              geoIpInfo,
              registeredAt: null,
              votingIdentity: null,
              votingIdentityBalance: null,
              poseScoreMax: null,
              blocksUntilCorePayment: null,
              registeredCoreBlockHash: null,
              lastPaidCoreBlockHash: null,
              poseRevivedCoreBlockHash: null,
              poseBanCoreBlockHash: null,
              coreYieldPerYear: null,
              coreTipTime: null,
              coreBlockIntervalMs: null
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

    describe('filter isBanned', async () => {
      let bannedValidators

      before(() => {
        // restore the healthy mocks (preceding describes leave some throwing)
        mock.method(tenderdashRpc, 'getValidators', async () => ({
          quorumHash: currentQuorumHash,
          quorumType: 6,
          validators: activeValidators.map(activeValidator =>
            ({ pro_tx_hash: activeValidator.pro_tx_hash }))
        }))

        mock.method(DashCoreRPC, 'getProTxInfo', async () => dashCoreRpcResponse)

        // a banned validator can never be active, so ban a subset of the
        // inactive validators by dropping them from the registered masternode
        // list — the list endpoint treats any removed validator as banned
        bannedValidators = inactiveValidators.slice(0, 10)

        mock.method(DashCoreRPC, 'getProTxList', async () =>
          validators
            .filter(validator => !bannedValidators.some(banned =>
              banned.pro_tx_hash === validator.pro_tx_hash))
            .map(validator =>
              ({ proTxHash: validator.pro_tx_hash, state: { PoSeBanHeight: -1 } })))
      })

      after(() => {
        mock.method(DashCoreRPC, 'getProTxList', async () =>
          validators.map(validator =>
            ({ proTxHash: validator.pro_tx_hash, state: { PoSeBanHeight: -1 } })))
      })

      it('should return only banned validators', async () => {
        const { body } = await client.get('/validators?isBanned=true&limit=0')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.total, bannedValidators.length)
        assert.equal(body.resultSet.length, bannedValidators.length)

        const returnedHashes = body.resultSet.map(validator => validator.proTxHash).sort()
        const expectedHashes = bannedValidators.map(validator => validator.pro_tx_hash).sort()

        assert.deepEqual(returnedHashes, expectedHashes)
      })

      it('should return only not banned validators', async () => {
        const { body } = await client.get('/validators?isBanned=false&limit=0')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        const notBannedCount = validators.length - bannedValidators.length

        assert.equal(body.pagination.total, notBannedCount)
        assert.equal(body.resultSet.length, notBannedCount)

        const returnedHashes = body.resultSet.map(validator => validator.proTxHash)

        for (const banned of bannedValidators) {
          assert.equal(returnedHashes.includes(banned.pro_tx_hash), false)
        }
      })
    })
  })

  describe('getValidatorQuorumsByProTxHash()', async () => {
    it('should return the current quorum for an active validator', async () => {
      const [validator] = activeValidators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/quorums`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 1)
      assert.equal(body[0].quorumHash, currentQuorumHash)
      assert.equal(body[0].isCurrent, true)
    })

    it('should return the upcoming quorum for an upcoming validator', async () => {
      const [validator] = upcomingValidators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/quorums`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 1)
      assert.equal(body[0].quorumHash, upcomingQuorumHash)
      assert.equal(body[0].isCurrent, false)
    })

    it('should return an empty list for a validator in no quorum', async () => {
      const validator = inactiveValidators[inactiveValidators.length - 1]

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/quorums`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body, [])
    })

    it('should return 404 for an unknown validator', async () => {
      await client.get(`/validator/${'F'.repeat(64)}/quorums`)
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
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

  describe('getValidatorIncomeStatsByProTxHash()', async () => {
    let start
    let end
    let validatorA
    let validatorB

    before(async () => {
      // isolated time window so blocks seeded by other suites don't interfere
      start = new Date('2031-01-01T00:00:00.000Z')
      end = new Date('2031-01-01T01:00:00.000Z')

      validatorA = await fixtures.validator(knex)
      validatorB = await fixtures.validator(knex)

      let height = 3000

      const createBlockWithGas = async (validator, minuteOffset, gasUsed) => {
        const block = await fixtures.block(knex, {
          validator: validator.pro_tx_hash,
          height: height++,
          timestamp: new Date(start.getTime() + minuteOffset * 60000)
        })

        if (gasUsed !== null) {
          await fixtures.transaction(knex, {
            block_hash: block.hash,
            block_height: block.height,
            type: IDENTITY_CREDIT_WITHDRAWAL,
            owner: identities[0].identifier,
            gas_used: gasUsed
          })
        }
      }

      // first interval: both validators propose, fees split pro-rata by blocks
      await createBlockWithGas(validatorA, 2, 1000)
      await createBlockWithGas(validatorB, 4, 3000)

      // second interval: only validatorA proposes
      await createBlockWithGas(validatorA, 8, 600)

      // third interval: only validatorB proposes, no income for validatorA
      await createBlockWithGas(validatorB, 14, 500)
    })

    it('should return income stats by proTxHash', async () => {
      const { body } = await client.get(`/validator/${validatorA.pro_tx_hash}/income/stats?timestamp_start=${start.toISOString()}&timestamp_end=${end.toISOString()}&intervalsCount=10`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const intervalMs = 360000

      const expectedStats = []

      for (let i = 0; i < 10; i++) {
        // validatorA proposed 1 of 2 blocks in the first interval and the
        // only block in the second one
        const income = i === 0 ? 2000 : i === 1 ? 600 : 0

        expectedStats.push({
          timestamp: new Date(start.getTime() + intervalMs * i).toISOString(),
          data: {
            income
          }
        })
      }

      assert.deepEqual(expectedStats, body)
    })

    it('should return zero income series for validator without blocks', async () => {
      const validator = await fixtures.validator(knex)

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/income/stats?timestamp_start=${start.toISOString()}&timestamp_end=${end.toISOString()}&intervalsCount=10`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 10)
      assert.ok(body.every((point) => point.data.income === 0))
    })

    it('should return error on wrong bounds', async () => {
      await client.get(`/validator/${validatorA.pro_tx_hash}/income/stats?timestamp_start=2025-01-02T00:00:00&timestamp_end=2024-01-08T00:00:00`)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  // epochs 10, 12 and 13 of the validators A and B, epoch 11 had no blocks and Platform skips it
  const createEpochsFixtures = async () => {
    const validatorA = await fixtures.validator(knex)
    const validatorB = await fixtures.validator(knex)

    const epochBlocks = [
      { height: 1000, validator: validatorA, epoch: 10, timestamp: '2024-01-01T00:00:10Z' },
      { height: 1001, validator: validatorA, epoch: 10, timestamp: '2024-01-01T00:10:00Z' },
      { height: 1002, validator: validatorA, epoch: 10, timestamp: '2024-01-01T00:20:00Z' },
      { height: 1003, validator: validatorB, epoch: 10, timestamp: '2024-01-01T00:40:00Z' },
      { height: 1004, validator: validatorB, epoch: 12, timestamp: '2024-01-01T01:00:10Z' },
      { height: 1005, validator: validatorB, epoch: 12, timestamp: '2024-01-01T01:20:00Z' },
      { height: 1006, validator: validatorA, epoch: 13, timestamp: '2024-01-01T02:00:10Z' }
    ]

    const createdBlocks = []

    for (const { height, validator, epoch, timestamp } of epochBlocks) {
      createdBlocks.push(await fixtures.block(knex, {
        height,
        epoch,
        validator: validator.pro_tx_hash,
        timestamp: new Date(timestamp),
        l1_locked_height: 500 + (height - 1000) * 10
      }))
    }

    for (const [block, gasUsed] of [[createdBlocks[0], 100], [createdBlocks[1], 50], [createdBlocks[3], 1000]]) {
      await fixtures.transaction(knex, {
        type: IDENTITY_CREATE,
        block_hash: block.hash,
        block_height: block.height,
        gas_used: gasUsed
      })
    }

    for (const [coreBlockHeight, proTxHash, amount] of [
      [505, validatorA.pro_tx_hash, 100],
      [515, validatorB.pro_tx_hash, 150],
      [525, validatorA.pro_tx_hash, 200],
      [565, validatorA.pro_tx_hash, 400]
    ]) {
      await fixtures.corePayment(knex, { core_block_height: coreBlockHeight, pro_tx_hash: proTxHash, amount })
    }

    // the first block of an epoch pays the previous one, epoch 13 is not paid yet
    for (const [blockHeight, epoch, proTxHash, amount] of [
      [1004, 10, validatorA.pro_tx_hash, 2997],
      [1004, 10, validatorB.pro_tx_hash, 1000],
      [1006, 12, validatorB.pro_tx_hash, 1000]
    ]) {
      await fixtures.platformReward(knex, { block_height: blockHeight, epoch, pro_tx_hash: proTxHash, amount })
    }

    return { validatorA, validatorB }
  }

  describe('getValidatorEpochStatsByProTxHash()', async () => {
    let validatorA

    before(async () => {
      ({ validatorA } = await createEpochsFixtures())
    })

    it('should return the epochs overlapping the period', async () => {
      const { body } = await client.get(`/validator/${validatorA.pro_tx_hash}/epochs/stats?timestamp_start=2024-01-01T00:30:00Z&timestamp_end=2024-01-01T01:30:00Z`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body, [
        {
          timestamp: '2024-01-01T00:00:10.000Z',
          data: {
            epoch: 10,
            endEpoch: 10,
            endTime: '2024-01-01T01:00:10.000Z',
            blocksProposed: 3,
            totalBlocks: 4,
            fees: 150,
            reward: 2997
          }
        },
        {
          timestamp: '2024-01-01T01:00:10.000Z',
          data: {
            epoch: 12,
            endEpoch: 12,
            endTime: '2024-01-01T02:00:10.000Z',
            blocksProposed: 0,
            totalBlocks: 2,
            fees: 0,
            reward: 0
          }
        }
      ])
    })

    it('should return the current epoch without reward', async () => {
      const { body } = await client.get(`/validator/${validatorA.pro_tx_hash}/epochs/stats?timestamp_start=2024-01-01T02:30:00Z&timestamp_end=2024-01-01T03:00:00Z`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body, [
        {
          timestamp: '2024-01-01T02:00:10.000Z',
          data: {
            epoch: 13,
            endEpoch: 13,
            endTime: null,
            blocksProposed: 1,
            totalBlocks: 1,
            fees: 0,
            reward: null
          }
        }
      ])
    })

    it('should group consecutive epochs of a long interval', async () => {
      const validator = await fixtures.validator(knex)

      // 170 epochs of 2025 with a block each, grouped by 3 into 57 points
      for (let i = 0; i < 170; i++) {
        await fixtures.block(knex, {
          height: 5000 + i,
          epoch: 100 + i,
          validator: validator.pro_tx_hash,
          timestamp: new Date(Date.UTC(2025, 0, 1) + i * 3600000),
          l1_locked_height: 5000
        })
      }

      await fixtures.platformReward(knex, { block_height: 5001, epoch: 100, pro_tx_hash: validator.pro_tx_hash, amount: 1000 })
      await fixtures.platformReward(knex, { block_height: 5002, epoch: 101, pro_tx_hash: validator.pro_tx_hash, amount: 2000 })

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/epochs/stats?timestamp_start=2025-01-01T00:00:00Z&timestamp_end=2025-01-31T00:00:00Z`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.length, 57)
      assert.deepEqual(body[0], {
        timestamp: '2025-01-01T00:00:00.000Z',
        data: {
          epoch: 100,
          endEpoch: 102,
          endTime: '2025-01-01T03:00:00.000Z',
          blocksProposed: 3,
          totalBlocks: 3,
          fees: 0,
          // epoch 102 is not paid yet
          reward: 3000
        }
      })
      assert.deepEqual(body.at(-1).data, {
        epoch: 268,
        endEpoch: 269,
        endTime: null,
        blocksProposed: 2,
        totalBlocks: 2,
        fees: 0,
        reward: null
      })
    })

    it('should return 404 for an unknown validator', async () => {
      await client.get('/validator/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF/epochs/stats')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })

    it('should return error on wrong bounds', async () => {
      await client.get(`/validator/${validatorA.pro_tx_hash}/epochs/stats?timestamp_start=2025-01-02T00:00:00&timestamp_end=2024-01-08T00:00:00`)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getValidatorEarningsByProTxHash()', async () => {
    let validatorA
    let validatorB
    let validator

    before(async () => {
      await fixtures.cleanup(knex)

      ;({ validatorA, validatorB } = await createEpochsFixtures())

      // a masternode Core pays with a Platform reward paid by the block 2001 ten days ago,
      // the validators A and B are not in the masternode list
      validator = await fixtures.validator(knex)
      const other = await fixtures.validator(knex)

      const now = Date.now()

      for (const [height, epoch, timestamp] of [[2000, 1, now - 40 * 86400000], [2001, 2, now - 10 * 86400000], [2002, 2, now - 60000]]) {
        await fixtures.block(knex, { height, epoch, validator: validator.pro_tx_hash, timestamp: new Date(timestamp), l1_locked_height: 600 })
      }

      await fixtures.platformReward(knex, { block_height: 2001, epoch: 1, pro_tx_hash: validator.pro_tx_hash, amount: 500000000000 })

      await fixtures.corePayment(knex, { core_block_height: 101, pro_tx_hash: validator.pro_tx_hash, amount: 100000000 })
      await fixtures.corePayment(knex, { core_block_height: 200, pro_tx_hash: other.pro_tx_hash, amount: 300000000 })

      mock.method(DashCoreRPC, 'getProTxList', async () => [validator, other]
        .map(({ pro_tx_hash: proTxHash }) => ({ proTxHash, type: 'Evo', state: { PoSeBanHeight: -1, registeredHeight: 1 } })))
    })

    it('should return Core payments and Platform rewards paid during the period', async () => {
      const { body } = await client.get(`/validator/${validatorA.pro_tx_hash}/earnings?timestamp_start=2024-01-01T00:00:00Z&timestamp_end=2024-01-01T01:30:00Z`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      // Core block 565 was chain locked after the period
      assert.deepEqual(body, {
        core: {
          payments: 2,
          amount: 300
        },
        platform: {
          epochs: 1,
          firstEpoch: 10,
          lastEpoch: 10,
          blocksProposed: 3,
          reward: 2997
        },
        // the validator is not in the masternode list
        estimate: {
          periodDays: 30,
          eligible: false,
          corePerMonth: null,
          platformPerMonth: null,
          totalPerMonth: null,
          platformHistory: null
        }
      })
    })

    it('should skip rewards paid before the period', async () => {
      const { body } = await client.get(`/validator/${validatorB.pro_tx_hash}/earnings?timestamp_start=2024-01-01T01:10:00Z&timestamp_end=2024-01-01T03:00:00Z`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.platform, {
        epochs: 1,
        firstEpoch: 12,
        lastEpoch: 12,
        blocksProposed: 2,
        reward: 1000
      })
    })

    it('should return zero earnings for a validator without payments', async () => {
      const validator = await fixtures.validator(knex)

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/earnings?timestamp_start=2024-01-01T00:00:00Z&timestamp_end=2024-01-01T03:00:00Z`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body, {
        core: {
          payments: 0,
          amount: 0
        },
        platform: {
          epochs: 0,
          firstEpoch: null,
          lastEpoch: null,
          blocksProposed: 0,
          reward: 0
        },
        // the validator is not in the masternode list
        estimate: {
          periodDays: 30,
          eligible: false,
          corePerMonth: null,
          platformPerMonth: null,
          totalPerMonth: null,
          platformHistory: null
        }
      })
    })

    it('should estimate the monthly earnings by the last 30 days', async () => {
      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/earnings`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      // the median Core payout is 2 DASH per the Core blocks 101 - 565 of 150 seconds
      const corePerMonth = 2 * 365 * 86400 / (465 * 150) * 30 / 365

      const { platformHistory, ...estimate } = body.estimate

      assert.deepEqual(estimate, {
        periodDays: 30,
        eligible: true,
        corePerMonth,
        platformPerMonth: 5,
        totalPerMonth: corePerMonth + 5
      })

      assert.deepEqual({ ...platformHistory, startTime: undefined, endTime: undefined }, {
        firstEpoch: 1,
        lastEpoch: 1,
        startTime: undefined,
        endTime: undefined,
        reward: 500000000000
      })
      assert.equal(new Date(platformHistory.endTime) - new Date(platformHistory.startTime), 30 * 86400000)
    })

    it('should return 404 for an unknown validator', async () => {
      await client.get('/validator/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF/earnings')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })

    it('should return error on wrong bounds', async () => {
      await client.get(`/validator/${validatorA.pro_tx_hash}/earnings?timestamp_start=2025-01-02T00:00:00&timestamp_end=2024-01-08T00:00:00`)
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })
})
