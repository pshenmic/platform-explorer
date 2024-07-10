const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const { getKnex } = require('../../src/utils')
const tenderdashRpc = require('../../src/tenderdashRpc')

describe('Documents routes', () => {
  let app
  let client
  let knex

  let identity
  let dataContract
  let block
  let documents

  before(async () => {
    mock.method(tenderdashRpc, 'getGenesis', async () => ({ genesis_time: new Date(0) }))

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    await fixtures.cleanup(knex)

    documents = []

    block = await fixtures.block(knex, { height: 1 })
    identity = await fixtures.identity(knex, { block_hash: block.hash })

    const dataContractTransaction = await fixtures.transaction(knex, {
      block_hash: block.hash, type: StateTransitionEnum.DATA_CONTRACT_CREATE, owner: identity.identifier
    })
    dataContract = await fixtures.dataContract(knex, {
      state_transition_hash: dataContractTransaction.hash, owner: identity.identifier, schema: '{}'
    })

    for (let i = 0; i < 5; i++) {
      const document = await fixtures.document(knex, {
        data_contract_id: dataContract.id, owner: identity.identifier, is_system: true
      })

      documents.push({ transaction: null, block: null, dataContract, document })
    }

    for (let i = 5; i < 30; i++) {
      const documentTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash, type: StateTransitionEnum.DATA_CONTRACT_CREATE, owner: identity.identifier
      })
      const document = await fixtures.document(knex, {
        data_contract_id: dataContract.id,
        state_transition_hash: documentTransaction.hash,
        owner: identity.identifier
      })

      documents.push({ transaction: documentTransaction, block, dataContract, document })
    }
  })

  after(async () => {
    await knex.destroy()
    await server.stop()
  })

  describe('getDocumentByIdentifier()', async () => {
    it('should return document by identifier', async () => {
      const [document] = documents.filter(e => !e.document.is_system)

      const { body } = await client.get(`/document/${document.document.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDocument = {
        identifier: document.document.identifier,
        dataContractIdentifier: document.dataContract.identifier,
        revision: 0,
        txHash: document.transaction.hash,
        deleted: document.document.deleted,
        data: JSON.stringify(document.document.data),
        timestamp: document.block.timestamp.toISOString(),
        owner: document.document.owner,
        isSystem: false
      }

      assert.deepEqual(body, expectedDocument)
    })

    it('should return system document', async () => {
      const [document] = documents.filter(e => e.document.is_system)

      const { body } = await client.get(`/document/${document.document.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDocument = {
        identifier: document.document.identifier,
        dataContractIdentifier: document.dataContract.identifier,
        revision: 0,
        txHash: null,
        deleted: document.document.deleted,
        data: JSON.stringify(document.document.data),
        timestamp: null,
        owner: document.document.owner,
        isSystem: true
      }

      assert.deepEqual(body, expectedDocument)
    })

    it('should return 404 if document not found', async () => {
      // fake identifier
      await client.get('/document/Po1uVkjb7V5WozqdXvosa7LZ9SvXbyaWUV8jfnPUew3')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getDocumentsByDataContract()', async () => {
    it('should return default set of documents', async () => {
      const { body } = await client.get(`/dataContract/${dataContract.identifier}/documents`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, 30)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents
        .slice(0, 10)
        .map(({ block, document, dataContract, transaction }) => ({
          identifier: document.identifier,
          dataContractIdentifier: dataContract.identifier,
          revision: document.revision,
          txHash: document.is_system ? null : transaction.hash,
          deleted: document.deleted,
          data: JSON.stringify(document.data),
          timestamp: document.is_system ? null : block.timestamp.toISOString(),
          owner: document.owner,
          isSystem: document.is_system
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should return default set of documents desc', async () => {
      const { body } = await client.get(`/dataContract/${dataContract.identifier}/documents?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, 30)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents
        .sort((a, b) => b.document.id - a.document.id)
        .slice(0, 10)
        .map(({ block, document, dataContract, transaction }) => ({
          identifier: document.identifier,
          dataContractIdentifier: dataContract.identifier,
          revision: document.revision,
          txHash: document.is_system ? null : transaction.hash,
          deleted: document.deleted,
          data: JSON.stringify(document.data),
          timestamp: document.is_system ? null : block.timestamp.toISOString(),
          owner: document.owner,
          isSystem: document.is_system
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should be able to walk through pages', async () => {
      const { body } = await client.get(`/dataContract/${dataContract.identifier}/documents?page=2&limit=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDocuments = documents
        .sort((a, b) => a.document.id - b.document.id)
        .slice(2, 4)
        .map(({ block, document, dataContract, transaction }) => ({
          identifier: document.identifier,
          dataContractIdentifier: dataContract.identifier,
          revision: document.revision,
          txHash: document.is_system ? null : transaction.hash,
          deleted: document.deleted,
          data: JSON.stringify(document.data),
          timestamp: document.is_system ? null : block.timestamp.toISOString(),
          owner: document.owner,
          isSystem: document.is_system
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should be able to walk through pages desc', async () => {
      const { body } = await client.get(`/dataContract/${dataContract.identifier}/documents?page=3&limit=3&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDocuments = documents
        .sort((a, b) => b.document.id - a.document.id)
        .slice(6, 9)
        .map(({ block, document, dataContract, transaction }) => ({
          identifier: document.identifier,
          dataContractIdentifier: dataContract.identifier,
          revision: document.revision,
          txHash: document.is_system ? null : transaction.hash,
          deleted: document.deleted,
          data: JSON.stringify(document.data),
          timestamp: document.is_system ? null : block.timestamp.toISOString(),
          owner: document.owner,
          isSystem: document.is_system
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })
  })
})