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


    // ? Duplicates for validator tests
    let validatorForDuplicates = (await fixtures.validator(knex))
    for (let i = 0; i < 21; i++) {
      validator = await fixtures.block(knex, {
        validator: validatorForDuplicates.pro_tx_hash,
        height: i + 31
      })
      validators.push(validator)
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
      const [block] = validators.filter(v =>)
      const { body } = await client.get(`/validator/${block.validator}/blocks`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedBlocks = blocks
        .filter(row => row.validator === block.validator)
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
      const [block] = validators

      const { body } = await client.get(`/validator/${block.validator}/blocks?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedBlocks = blocks
        .filter(row => row.validator === block.validator)
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
      const [block] = validators

      const { body } = await client.get(`/validator/${block.validator}/blocks?page=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 23)

      const expectedBlocks = blocks
        .filter(row => row.validator === block.validator)
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
      const [block] = validators

      const { body } = await client.get(`/validator/${block.validator}/blocks?limit=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 2)
      assert.equal(body.pagination.total, 23)

      const expectedBlocks = blocks
        .sort((a, b) => a.height - b.height)
        .filter(row => row.validator === block.validator)
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
      const [block] = validators

      const { body } = await client.get(`/validator/${block.validator}/blocks?limit=2&page=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 2)
      assert.equal(body.pagination.total, 23)

      const expectedBlocks = blocks
        .filter(row => row.validator === block.validator)
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
      const [block] = validators

      const { body } = await client.get(`/validator/${block.validator}/blocks?limit=2&page=2&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 2)
      assert.equal(body.pagination.total, 23)

      const expectedBlocks = blocks
        .sort((a, b) => b.height - a.height)
        .filter(row => row.validator === block.validator)
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
      const page = 4
      const limit = 7

      const [block] = validators

      const { body } = await client.get(`/validator/${block.validator}/blocks?limit=${limit}&page=${page}&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, page)
      assert.equal(body.pagination.limit, limit)
      assert.equal(body.resultSet.length, 2)

      const blocksWithValidatorCount = blocks.find((_block) => _block === block.validator).length

      const expectedBlocks = blocks
        .sort((a, b) => b.height - a.height)
        .filter(row => row.validator === block.validator)
        .slice((page - 1) * limit, blocksWithValidatorCount)
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
      const [block] = validators

      const { body } = await client.get(`/validator/${block.validator}/blocks?limit=23&page=2&order=desc`)
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
      assert.equal(body.pagination.total, blocks.length + validators.length)
      assert.equal(body.resultSet.length, 10)

      const expectedBlocks = blocks
        .sort((a, b) => a.height - b.height)
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
      assert.equal(body.pagination.total, blocks.length + validators.length)
      assert.equal(body.resultSet.length, 10)

      const expectedBlocks = [...blocks, ...validators]
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
      assert.equal(body.pagination.total, blocks.length + validators.length)
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
      assert.equal(body.pagination.total, blocks.length + validators.length)
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
      assert.equal(body.pagination.total, blocks.length + validators.length)
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
      assert.equal(body.pagination.total, blocks.length + validators.length)
      assert.equal(body.resultSet.length, 7)

      const expectedBlocks = [...blocks, ...validators]
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
      const { body } = await client.get(`/blocks?limit=${limit}&page=8&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 8)
      assert.equal(body.pagination.limit, limit)
      assert.equal(body.pagination.total, blocks.length + validators.length)
      assert.equal(body.resultSet.length, 2)

      const expectedBlocks = blocks
        .sort((a, b) => b.height - a.height)
        .slice(blocks.length - 2, blocks.length)
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
