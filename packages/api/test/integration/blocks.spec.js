const { describe, it, before, after } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')

describe('Blocks routes', () => {
  let app
  let client
  let knex

  let block
  let blocks

  let validator
  let validators

  before(async () => {
    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()
    blocks = []
    validators = []

    await fixtures.cleanup(knex)

    for (let i = 1; i < 31; i++) {
      block = await fixtures.block(knex, { height: i + 1 })
      blocks.push(block)
    }

    validators.push((await fixtures.validator(knex)))
    validators.push((await fixtures.validator(knex)))

    for (let i = 0; i < 15; i++) {
      validator = await fixtures.block(knex, {
        height: i + 31
      })
      blocks.push(validator)
    }

    for (let i = 15; i < 30; i++) {
      validator = await fixtures.block(knex, {
        validator: validators[0].pro_tx_hash,
        height: i + 31
      })
      blocks.push(validator)
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getBlockByHash()', async () => {
    it('should return block by hash', async () => {
      const [block] = blocks

      const { body } = await client.get(`/block/${block.hash}`)
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
        txs: []
      }

      assert.deepEqual(expectedBlock, body)
    })

    it('should return 404 if block not found', async () => {
      await client.get('/block/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getBlocksByValidator()', async () => {
    it('should return blocks by validator', async () => {
      const [, validator] = validators
      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/blocks`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedBlocks = blocks
        .filter(block => block.validator === validator.pro_tx_hash)
        .slice(0, 10)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))
      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should return default set of blocks order desc', async () => {
      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/blocks?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedBlocks = blocks
        .filter(block => block.validator === validator.pro_tx_hash)
        .sort((a, b) => b.height - a.height)
        .slice(0, 10)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))
      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should be able to walk through pages', async () => {
      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/blocks?page=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 15)

      const expectedBlocks = blocks
        .filter(block => block.validator === validator.pro_tx_hash)
        .slice(10, 20)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))
      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should return custom page size', async () => {
      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/blocks?limit=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 2)
      assert.equal(body.pagination.total, 15)

      const expectedBlocks = blocks
        .filter(block => block.validator === validator.pro_tx_hash)
        .slice(0, 2)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))
      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should allow to walk through pages with custom page size', async () => {
      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/blocks?limit=2&page=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 2)
      assert.equal(body.pagination.total, 15)

      const expectedBlocks = blocks
        .filter(block => block.validator === validator.pro_tx_hash)
        .sort((a, b) => a.height - b.height)
        .slice(2, 4)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))
      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should allow to walk through pages with custom page size desc', async () => {
      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/blocks?limit=2&page=2&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 2)
      assert.equal(body.pagination.total, 15)

      const expectedBlocks = blocks
        .sort((a, b) => b.height - a.height)
        .filter(block => block.validator === validator.pro_tx_hash)
        .slice(2, 4)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))

      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should return less items when it is out of bounds', async () => {
      const page = 3
      const limit = 7

      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/blocks?limit=${limit}&page=${page}&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, page)
      assert.equal(body.pagination.limit, limit)
      assert.equal(body.resultSet.length, 1)

      const expectedBlocks = blocks
        .sort((a, b) => b.height - a.height)
        .filter(block => block.validator === validator.pro_tx_hash)
        .slice((page - 1) * limit, 15)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))
      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should return less items when there is none on the one bound', async () => {
      const [validator] = validators

      const { body } = await client.get(`/validator/${validator.pro_tx_hash}/blocks?limit=23&page=2&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
      const expectedBlocks = []
      assert.deepEqual(expectedBlocks, body.resultSet)
    })
  })

  describe('getBlocks()', async () => {
    it('should return default set of blocks', async () => {
      const { body } = await client.get('/blocks')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, blocks.length)
      assert.equal(body.resultSet.length, 10)

      const expectedBlocks = blocks
        .slice(0, 10)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))

      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should return default set of blocks order desc', async () => {
      const { body } = await client.get('/blocks?order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, blocks.length)
      assert.equal(body.resultSet.length, 10)

      const expectedBlocks = blocks
        .sort((a, b) => b.height - a.height)
        .slice(0, 10)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))

      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should be able to walk through pages', async () => {
      const { body } = await client.get('/blocks?page=2')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, blocks.length)
      assert.equal(body.resultSet.length, 10)

      const expectedBlocks = blocks
        .sort((a, b) => a.height - b.height)
        .slice(10, 20)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))

      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should return custom page size', async () => {
      const { body } = await client.get('/blocks?limit=7')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, blocks.length)
      assert.equal(body.resultSet.length, 7)

      const expectedBlocks = blocks
        .sort((a, b) => a.height - b.height)
        .slice(0, 7)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))

      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should allow to walk through pages with custom page size', async () => {
      const { body } = await client.get('/blocks?limit=7&page=2')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, blocks.length)
      assert.equal(body.resultSet.length, 7)

      const expectedBlocks = blocks
        .sort((a, b) => a.height - b.height)
        .slice(7, 14)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))

      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should allow to walk through pages with custom page size desc', async () => {
      const { body } = await client.get('/blocks?limit=7&page=2&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, blocks.length)
      assert.equal(body.resultSet.length, 7)

      const expectedBlocks = blocks
        .sort((a, b) => b.height - a.height)
        .slice(7, 14)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))

      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should return less items when when it is out of bounds', async () => {
      const limit = 7
      const { body } = await client.get(`/blocks?limit=${limit}&page=9&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 9)
      assert.equal(body.pagination.limit, limit)
      assert.equal(body.pagination.total, blocks.length)
      assert.equal(body.resultSet.length, 4)

      const expectedBlocks = blocks
        .sort((a, b) => b.height - a.height)
        .slice(blocks.length - 4, blocks.length)
        .map(row => ({
          header: {
            hash: row.hash,
            height: row.height,
            timestamp: row.timestamp.toISOString(),
            blockVersion: row.block_version,
            appVersion: row.app_version,
            l1LockedHeight: row.l1_locked_height,
            validator: row.validator
          },
          txs: []
        }))
      assert.deepEqual(expectedBlocks, body.resultSet)
    })

    it('should return less items when there is none on the one bound', async () => {
      const { body } = await client.get('/blocks?limit=10&page=8&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 8)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, -1)
      assert.equal(body.resultSet.length, 0)

      const expectedBlocks = []

      assert.deepEqual(expectedBlocks, body.resultSet)
    })
  })
})
