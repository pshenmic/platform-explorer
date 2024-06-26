const { describe, it, before, after } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const BlockHeader = require('../../src/models/BlockHeader')

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
    it('should return validator by proTxHash', async () => {
      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedValidator = {
        proTxHash: validator.pro_tx_hash,
        proposedBlocksAmount: blocks.filter((block) => block.validator === validator.pro_tx_hash).length,
        lastProposedBlockHeader: blocks
          .filter((block) => block.validator === validator.pro_tx_hash)
          .map((block) => {
            const { ...blockHeader } = BlockHeader.fromRow(block)
            blockHeader.timestamp = blockHeader.timestamp.toISOString()
            return blockHeader
          })
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
            .map((block) => {
              const { ...blockHeader } = BlockHeader.fromRow(block)
              blockHeader.timestamp = blockHeader.timestamp.toISOString()
              return blockHeader
            })
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
        .map(row => {
          return {
            proTxHash: row.pro_tx_hash,
            proposedBlocksAmount: blocks.filter((block) => block.validator === row.pro_tx_hash).length,
            lastProposedBlockHeader: blocks
              .filter((block) => block.validator === row.pro_tx_hash)
              .map((block) => {
                const { ...blockHeader } = BlockHeader.fromRow(block)
                blockHeader.timestamp = blockHeader.timestamp.toISOString()
                return blockHeader
              })
              .toReversed()[0] ?? null
          }
        })

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
            .map((block) => {
              const { ...blockHeader } = BlockHeader.fromRow(block)
              blockHeader.timestamp = blockHeader.timestamp.toISOString()
              return blockHeader
            })
            .toReversed()[0] ?? null
        })
        )

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
            .map((block) => {
              const { ...blockHeader } = BlockHeader.fromRow(block)
              blockHeader.timestamp = blockHeader.timestamp.toISOString()
              return blockHeader
            })
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
            .map((block) => {
              const { ...blockHeader } = BlockHeader.fromRow(block)
              blockHeader.timestamp = blockHeader.timestamp.toISOString()
              return blockHeader
            })
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
            .map((block) => {
              const { ...blockHeader } = BlockHeader.fromRow(block)
              blockHeader.timestamp = blockHeader.timestamp.toISOString()
              return blockHeader
            })
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
            .map((block) => {
              const { ...blockHeader } = BlockHeader.fromRow(block)
              blockHeader.timestamp = blockHeader.timestamp.toISOString()
              return blockHeader
            })
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
