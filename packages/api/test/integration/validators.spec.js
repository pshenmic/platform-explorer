const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const BlockHeader = require('../../src/models/BlockHeader')
const tenderdashRpc = require('../../src/tenderdashRpc')

describe('Validators routes', () => {
  let app
  let client
  let knex

  let validators
  let activeValidators
  let inactiveValidators
  let blocks

  before(async () => {
    mock.method(tenderdashRpc, 'getGenesis', async () => ({ genesis_time: new Date(0) }))

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()
    validators = []
    blocks = []

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

    activeValidators = validators.sort((a, b) => a.id - b.id).slice(0, 30)
    inactiveValidators = validators.sort((a, b) => a.id - b.id).slice(30, 50)

    mock.method(tenderdashRpc, 'getValidators',
      async () =>
        Promise.resolve(activeValidators.map(activeValidator =>
          ({ pro_tx_hash: activeValidator.pro_tx_hash }))))
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

      const expectedValidator = {
        proTxHash: validator.pro_tx_hash,
        isActive: false,
        proposedBlocksAmount: 0,
        lastProposedBlockHeader: null
      }

      assert.deepEqual(body, expectedValidator)
    })

    it('should return active validator by proTxHash', async () => {
      const [validator] = activeValidators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}`)
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
            validator: blockHeader.validator
          }))
          .toReversed()[0] ?? null
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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

        assert.deepEqual(body.resultSet, expectedValidators)
      })

      it('should return default set of validators order desc', async () => {
        const { body } = await client.get('/validators?order=desc&isActive=true')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 1)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, activeValidators.length)
        assert.equal(body.resultSet.length, 10)

        const expectedValidators = activeValidators
          .toReversed()
          .slice(0, 10)
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
            proTxHash: row.pro_tx_hash,
            isActive: false,
            proposedBlocksAmount: 0,
            lastProposedBlockHeader: null
          }))

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
          .map(row => ({
            proTxHash: row.pro_tx_hash,
            isActive: false,
            proposedBlocksAmount: 0,
            lastProposedBlockHeader: null
          }))

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
          .map(row => ({
            proTxHash: row.pro_tx_hash,
            isActive: false,
            proposedBlocksAmount: 0,
            lastProposedBlockHeader: null
          }))

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
          .map(row => ({
            proTxHash: row.pro_tx_hash,
            isActive: false,
            proposedBlocksAmount: 0,
            lastProposedBlockHeader: null
          }))

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
          .map(row => ({
            proTxHash: row.pro_tx_hash,
            isActive: false,
            proposedBlocksAmount: 0,
            lastProposedBlockHeader: null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
          .map(row => ({
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
              .toReversed()[0] ?? null
          }))

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
    })
  })
})
