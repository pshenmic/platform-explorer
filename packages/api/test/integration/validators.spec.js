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
  let blocks

  before(async () => {
    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()
    validators = []
    blocks = []

    await fixtures.cleanup(knex)

    mock.method(tenderdashRpc, 'getValidators', async () => [])

    for (let i = 0; i < 25; i++) {
      const validator = await fixtures.validator(knex)
      validators.push(validator)
    }

    for (let i = 1; i <= 50; i++) {
      const block = await fixtures.block(
        knex,
        { validator: validators[i % 24].pro_tx_hash, height: i }
      )
      blocks.push(block)
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getValidatorByProTxHash()', async () => {
    it('should return inactive validator by proTxHash', async () => {
      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedValidator = {
        proTxHash: validator.pro_tx_hash,
        isActive: false
      }

      assert.deepEqual(expectedValidator, body)
    })

    it('should return validator by proTxHash', async () => {
      const [validator] = validators

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve([{ proTxHash: validator.pro_tx_hash }]))

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

      assert.deepEqual(expectedValidator, body)
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

        assert.deepEqual(expectedValidators, body.resultSet)
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
          .slice(validators.length - 10, validators.length)
          .sort((a, b) => b.id - a.id)
          .map(row => ({
            proTxHash: row.pro_tx_hash,
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

        assert.deepEqual(expectedValidators, body.resultSet)
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

        assert.deepEqual(expectedValidators, body.resultSet)
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

        assert.deepEqual(expectedValidators, body.resultSet)
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

        assert.deepEqual(expectedValidators, body.resultSet)
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
          .sort((a, b) => b.id - a.id)
          .slice(15, 20)
          .map(row => ({
            proTxHash: row.pro_tx_hash,
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

        assert.deepEqual(expectedValidators, body.resultSet)
      })

      it('should return less items when when it is out of bounds', async () => {
        const { body } = await client.get('/validators?limit=10&page=3&order=desc')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 3)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, validators.length)
        assert.equal(body.resultSet.length, 5)

        const expectedValidators = validators
          .slice(20, 25)
          .map(row => ({
            proTxHash: row.pro_tx_hash,
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

        assert.deepEqual(expectedValidators, body.resultSet)
      })

      it('should return less items when there is none on the one bound', async () => {
        const { body } = await client.get('/validators?limit=10&page=4&order=desc')
          .expect(200)
          .expect('Content-Type', 'application/json; charset=utf-8')

        assert.equal(body.pagination.page, 4)
        assert.equal(body.pagination.limit, 10)
        assert.equal(body.pagination.total, -1)
        assert.equal(body.resultSet.length, 0)

        const expectedValidators = []

        assert.deepEqual(expectedValidators, body.resultSet)
      })
    })
  })


  describe('with isActive=true filter', async () => {
    it('should return default set of validators', async () => {
      const activeValidators = validators.sort((a, b) => a.id - b.id).slice(0, 10)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?isActive=true')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, activeValidators.length)
      assert.equal(body.resultSet.length, 10)

      const expectedValidators = validators
        .sort((a, b) => a.id - b.id)
        .slice(0, 10)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: activeValidators.some(activeValidator => activeValidator.pro_tx_hash === row.pro_tx_hash)
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should return default set of validators order desc', async () => {
      const activeValidators = validators.sort((a, b) => b.id - a.id).slice(0, 10)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?order=desc&isActive=true')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, activeValidators.length)
      assert.equal(body.resultSet.length, 10)

      const expectedValidators = validators
        .sort((a, b) => b.id - a.id)
        .slice(0, 10)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: activeValidators.some(activeValidator => activeValidator.pro_tx_hash === row.pro_tx_hash)
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should be able to walk through pages', async () => {
      const activeValidators = validators.sort((a, b) => a.id - b.id).slice(0, 20)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?page=2&isActive=true')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, activeValidators.length)
      assert.equal(body.resultSet.length, 10)

      const expectedValidators = validators
        .sort((a, b) => a.id - b.id)
        .slice(10, 20)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: activeValidators.some(activeValidator => activeValidator.pro_tx_hash === row.pro_tx_hash)
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should return custom page size', async () => {
      const activeValidators = validators.sort((a, b) => a.id - b.id).slice(0, 14)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=7&isActive=true')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, activeValidators.length)
      assert.equal(body.resultSet.length, 7)

      const expectedValidators = validators
        .sort((a, b) => a.id - b.id)
        .slice(0, 7)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: activeValidators.some(activeValidator => activeValidator.pro_tx_hash === row.pro_tx_hash)
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should allow to walk through pages with custom page size', async () => {
      const activeValidators = validators.slice(0, 14)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=7&page=2&isActive=true')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, activeValidators.length)
      assert.equal(body.resultSet.length, 7)

      const expectedValidators = validators
        .slice(7, 14)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: activeValidators.some(activeValidator => activeValidator.pro_tx_hash === row.pro_tx_hash)
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should allow to walk through pages with custom page size desc', async () => {
      const activeValidators = validators.sort((a, b) => b.id - a.id).slice(0, 12)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=3&page=4&order=desc&isActive=true')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 4)
      assert.equal(body.pagination.limit, 3)
      assert.equal(body.pagination.total, activeValidators.length)
      assert.equal(body.resultSet.length, 3)

      const expectedValidators = validators
        .sort((a, b) => b.id - a.id)
        .slice(9, 12)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: activeValidators.some(activeValidator => activeValidator.pro_tx_hash === row.pro_tx_hash)
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should return less items when when it is out of bounds', async () => {
      const activeValidators = validators.sort((a, b) => b.id - a.id).slice(0, 14)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=4&page=4&order=desc&isActive=true')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 4)
      assert.equal(body.pagination.limit, 4)
      assert.equal(body.pagination.total, activeValidators.length)
      assert.equal(body.resultSet.length, 2)

      const expectedValidators = validators
        .sort((a, b) => b.id - a.id)
        .slice(12, 14)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: activeValidators.some(activeValidator => activeValidator.pro_tx_hash === row.pro_tx_hash)
        }))
      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should return less items when there is none on the one bound', async () => {
      const activeValidators = validators.slice(0, 3)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=10&page=4&order=desc&isActive=true')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 4)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, -1)
      assert.equal(body.resultSet.length, 0)

      const expectedValidators = []

      assert.deepEqual(expectedValidators, body.resultSet)
    })
  })

  describe('with isActive=false filter', async () => {
    it('should return default set of validators', async () => {
      const activeValidators = validators.sort((a, b) => a.id - b.id).slice(0, 10)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?isActive=false')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, validators.length - activeValidators.length)
      assert.equal(body.resultSet.length, 10)

      const expectedValidators = validators
        .sort((a, b) => a.id - b.id)
        .slice(10, 20)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: false
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should return default set of validators order desc', async () => {
      const activeValidators = validators.sort((a, b) => b.id - a.id).slice(0, 10)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?order=desc&isActive=false')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, validators.length - activeValidators.length)
      assert.equal(body.resultSet.length, 10)

      const expectedValidators = validators
        .sort((a, b) => b.id - a.id)
        .slice(10, 20)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: false
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should be able to walk through pages', async () => {
      const activeValidators = validators.sort((a, b) => a.id - b.id).slice(0, 10)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?page=2&isActive=false')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, validators.length - activeValidators.length)
      assert.equal(body.resultSet.length, 10)

      const expectedValidators = validators
        .sort((a, b) => a.id - b.id)
        .slice(20, 30)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: false
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should return custom page size', async () => {
      const activeValidators = validators.sort((a, b) => a.id - b.id).slice(0, 10)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=7&isActive=false')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, validators.length - activeValidators.length)
      assert.equal(body.resultSet.length, 7)

      const expectedValidators = validators
        .sort((a, b) => a.id - b.id)
        .slice(10, 17)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: false
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should allow to walk through pages with custom page size', async () => {
      const activeValidators = validators.slice(0, 14)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=7&page=2&isActive=false')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, validators.length - activeValidators.length)
      assert.equal(body.resultSet.length, 7)

      const expectedValidators = validators
        .slice(21, 28)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: false
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should allow to walk through pages with custom page size desc', async () => {
      const activeValidators = validators.sort((a, b) => b.id - a.id).slice(0, 10)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=3&page=4&order=desc&isActive=false')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 4)
      assert.equal(body.pagination.limit, 3)
      assert.equal(body.pagination.total, validators.length - activeValidators.length)
      assert.equal(body.resultSet.length, 3)

      const expectedValidators = validators
        .sort((a, b) => b.id - a.id)
        .slice(19, 22)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: false
        }))

      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should return less items when when it is out of bounds', async () => {
      const activeValidators = validators.sort((a, b) => b.id - a.id).slice(0, 10)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=30&page=1&order=desc&isActive=false')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 30)
      assert.equal(body.pagination.total, validators.length - activeValidators.length)
      assert.equal(body.resultSet.length, 20)

      const expectedValidators = validators
        .sort((a, b) => b.id - a.id)
        .slice(10, 30)
        .map(row => ({
          proTxHash: row.pro_tx_hash,
          isActive: false
        }))
      assert.deepEqual(expectedValidators, body.resultSet)
    })

    it('should return less items when there is none on the one bound', async () => {
      const activeValidators = validators.slice(0, 3)

      mock.method(tenderdashRpc, 'getValidators',
        async () =>
          Promise.resolve(activeValidators.map(activeValidator =>
            ({ proTxHash: activeValidator.pro_tx_hash }))))

      const { body } = await client.get('/validators?limit=10&page=4&order=desc&isActive=false')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 4)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, -1)
      assert.equal(body.resultSet.length, 0)

      const expectedValidators = []

      assert.deepEqual(expectedValidators, body.resultSet)
    })
  })
})
