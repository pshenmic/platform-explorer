const { describe, it, before, after, beforeEach, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const tenderdashRpc = require('../../src/tenderdashRpc')

describe('Identities routes', () => {
  let app
  let client
  let knex

  let identity
  let block
  let dataContract
  let dataContractTransaction
  let dataContracts
  let document
  let documents
  let transfer
  let transferTx
  let transfers
  let transaction
  let transactions

  before(async () => {
    mock.method(tenderdashRpc, 'getGenesis', async () => ({ genesis_time: new Date(0) }))
    app = await server.start()
    client = supertest(app.server)
    knex = getKnex()
  })

  beforeEach(async () => {
    await fixtures.cleanup(knex)
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getIdentityByIdentifier()', async () => {
    it('should return identity by identifier', async () => {
      const block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash })

      const { body } = await client.get(`/identity/${identity.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        owner: identity.identifier,
        revision: identity.revision,
        balance: 0,
        timestamp: block.timestamp.toISOString(),
        txHash: identity.txHash,
        totalTxs: 1,
        totalTransfers: 0,
        totalDocuments: 0,
        totalDataContracts: 0,
        isSystem: false
      }

      assert.deepEqual(body, expectedIdentity)
    })

    it('should return 404 when identity not found', async () => {
      await client.get('/identity/Cxo56ta5EMrWok8yp2Gpzm8cjBoa3mGYKZaAp9yqD3gW')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getIdentityByDPNS()', async () => {
    it('should return identity by dpns', async () => {
      const block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash })
      await fixtures.identity_alias(knex, { alias: 'test-name.1.dash', identity })

      const { body } = await client.get('/dpns/identity?dpns=test-name.1.dash')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        owner: identity.identifier,
        revision: identity.revision,
        balance: 0,
        timestamp: block.timestamp.toISOString(),
        txHash: identity.txHash,
        totalTxs: 1,
        totalTransfers: 0,
        totalDocuments: 0,
        totalDataContracts: 0,
        isSystem: false
      }

      assert.deepEqual(body, expectedIdentity)
    })

    it('should return identity by dpns with any case', async () => {
      const block = await fixtures.block(knex)
      const identity = await fixtures.identity(knex, { block_hash: block.hash })
      await fixtures.identity_alias(knex, { alias: 'test-name.2.dash', identity })

      const { body } = await client.get('/dpns/identity?dpns=TeSt-NaME.2.DAsH')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedIdentity = {
        identifier: identity.identifier,
        owner: identity.identifier,
        revision: identity.revision,
        balance: 0,
        timestamp: block.timestamp.toISOString(),
        txHash: identity.txHash,
        totalTxs: 1,
        totalTransfers: 0,
        totalDocuments: 0,
        totalDataContracts: 0,
        isSystem: false
      }

      assert.deepEqual(body, expectedIdentity)
    })

    it('should return 404 when identity not found', async () => {
      await client.get('/dpns/identity?dpns=bad-name')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getIdentities()', async () => {
    it('should return default set of identities', async () => {
      const identities = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        identities.push({ identity, block })
      }

      const { body } = await client.get('/identities')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities.slice(0, 10).map((_identity) => ({
        identifier: _identity.identity.identifier,
        owner: _identity.identity.identifier,
        revision: _identity.identity.revision,
        balance: 0,
        timestamp: _identity.block.timestamp.toISOString(),
        txHash: _identity.identity.txHash,
        totalTxs: 1,
        totalTransfers: 0,
        totalDocuments: 0,
        totalDataContracts: 0,
        isSystem: false
      }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })
    it('should return default set of identities desc', async () => {
      const identities = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        identities.push({ identity, block })
      }

      const { body } = await client.get('/identities?order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities
        .sort((a, b) => b.identity.id - a.identity.id)
        .slice(0, 10).map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: 0,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow walk through pages', async () => {
      const identities = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        identities.push({ identity, block })
      }

      const { body } = await client.get('/identities?page=2')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities
        .sort((a, b) => a.identity.id - b.identity.id)
        .slice(10, 20).map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: 0,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow walk through pages desc', async () => {
      const identities = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        identities.push({ identity, block })
      }

      const { body } = await client.get('/identities?page=2&limit=5&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 5)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 5)

      const expectedIdentities = identities
        .sort((a, b) => b.identity.id - a.identity.id)
        .slice(5, 10)
        .map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: 0,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow sort by tx count', async () => {
      const identities = []

      for (let i = 0; i < 30; i++) {
        const transactions = []

        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })

        for (let j = 0; j < Math.floor(Math.random() * 50); j++) {
          const tx = await fixtures.transaction(knex, {
            block_hash: block.hash,
            type: StateTransitionEnum.DOCUMENTS_BATCH,
            owner: identity.identifier
          })

          transactions.push(tx)
        }

        identity.transactions = transactions

        identities.push({ identity, block })
      }

      const { body } = await client.get('/identities?order_by=tx_count&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities
        .sort((a, b) => b.identity.transactions.length - a.identity.transactions.length || b.identity.id - a.identity.id)
        .slice(0, 10)
        .map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: 0,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: _identity.identity.transactions.length + 1,
          totalTransfers: 0,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })

    it('should allow sort by balance', async () => {
      const identities = []

      for (let i = 0; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        identity = await fixtures.identity(knex, { block_hash: block.hash })
        transferTx = await fixtures.transaction(knex, {
          block_hash: block.hash,
          type: StateTransitionEnum.IDENTITY_TOP_UP,
          owner: identity.identifier
        })
        transfer = await fixtures.transfer(knex, {
          amount: Math.floor(1000 * Math.random()),
          recipient: identity.identifier,
          state_transition_hash: transferTx.hash
        })
        identity.balance = transfer.amount
        identities.push({ identity, block, transfer })
      }

      const { body } = await client.get('/identities?order_by=balance&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, identities.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedIdentities = identities
        .sort((a, b) => b.identity.balance - a.identity.balance)
        .slice(0, 10)
        .map((_identity) => ({
          identifier: _identity.identity.identifier,
          owner: _identity.identity.identifier,
          revision: _identity.identity.revision,
          balance: _identity.identity.balance,
          timestamp: _identity.block.timestamp.toISOString(),
          txHash: _identity.identity.txHash,
          totalTxs: 2,
          totalTransfers: 1,
          totalDocuments: 0,
          totalDataContracts: 0,
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedIdentities)
    })
  })

  describe('getDataContractsByIdentity()', async () => {
    it('should return default set of data contracts by identity', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier
        })
        dataContracts.push({ dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/dataContracts`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDataContracts = dataContracts.slice(0, 10).map((_dataContract) => ({
        identifier: _dataContract.dataContract.identifier,
        name: _dataContract.dataContract.name,
        owner: identity.identifier,
        version: 0,
        schema: null,
        txHash: _dataContract.transaction.hash,
        timestamp: _dataContract.block.timestamp.toISOString(),
        isSystem: false,
        documentsCount: 0
      }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should return default set of data contracts by identity desc', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier
        })
        dataContracts.push({ dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/dataContracts?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDataContracts = dataContracts
        .sort((a, b) => b.dataContract.id - a.dataContract.id)
        .slice(0, 10)
        .map((_dataContract) => ({
          identifier: _dataContract.dataContract.identifier,
          name: _dataContract.dataContract.name,
          owner: identity.identifier,
          version: 0,
          schema: null,
          txHash: _dataContract.transaction.hash,
          timestamp: _dataContract.block.timestamp.toISOString(),
          isSystem: false,
          documentsCount: 0
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should allow walk through pages', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier
        })
        dataContracts.push({ dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/dataContracts?page=2&limit=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 5)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 5)

      const expectedDataContracts = dataContracts
        .sort((a, b) => a.dataContract.id - b.dataContract.id)
        .slice(5, 10)
        .map((_dataContract) => ({
          identifier: _dataContract.dataContract.identifier,
          name: _dataContract.dataContract.name,
          owner: identity.identifier,
          version: 0,
          schema: null,
          txHash: _dataContract.transaction.hash,
          timestamp: _dataContract.block.timestamp.toISOString(),
          isSystem: false,
          documentsCount: 0
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should allow walk through pages desc', async () => {
      dataContracts = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier
        })
        dataContracts.push({ dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/dataContracts?page=2&limit=5&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 5)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 5)

      const expectedDataContracts = dataContracts
        .sort((a, b) => b.dataContract.id - a.dataContract.id)
        .slice(5, 10)
        .map((_dataContract) => ({
          identifier: _dataContract.dataContract.identifier,
          owner: identity.identifier,
          name: _dataContract.dataContract.name,
          version: 0,
          schema: null,
          txHash: _dataContract.transaction.hash,
          timestamp: _dataContract.block.timestamp.toISOString(),
          isSystem: false,
          documentsCount: 0
        }))
      assert.deepEqual(body.resultSet, expectedDataContracts)
    })
  })

  describe('getDocumentsByIdentity()', async () => {
    it('should return default set of data contracts by identity', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents.slice(0, 10).map((_document) => ({
        identifier: _document.document.identifier,
        owner: identity.identifier,
        dataContractIdentifier: _document.dataContract.identifier,
        revision: 0,
        txHash: _document.transaction.hash,
        deleted: false,
        data: null,
        timestamp: _document.block.timestamp.toISOString(),
        isSystem: false
      }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should return default set of data contracts by identity dsc', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents
        .sort((a, b) => b.document.id - a.document.id)
        .slice(0, 10)
        .map((_document) => ({
          identifier: _document.document.identifier,
          owner: identity.identifier,
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 0,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          timestamp: _document.block.timestamp.toISOString(),
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should be able to walk through pages', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents?page=2&limit=3`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 3)

      const expectedDocuments = documents
        .sort((a, b) => a.document.id - b.document.id)
        .slice(3, 6)
        .map((_document) => ({
          identifier: _document.document.identifier,
          owner: identity.identifier,
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 0,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          timestamp: _document.block.timestamp.toISOString(),
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should be able to walk through pages desc', async () => {
      documents = []
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        dataContractTransaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DATA_CONTRACT_CREATE
        })
        dataContract = await fixtures.dataContract(knex, {
          state_transition_hash: dataContractTransaction.hash,
          owner: identity.identifier
        })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        document = await fixtures.document(knex, {
          state_transition_hash: transaction.hash,
          owner: identity.identifier,
          data_contract_id: dataContract.id
        })
        documents.push({ document, dataContract, transaction, identity, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/documents?page=2&limit=3&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 3)

      const expectedDocuments = documents
        .sort((a, b) => b.document.id - a.document.id)
        .slice(3, 6)
        .map((_document) => ({
          identifier: _document.document.identifier,
          owner: identity.identifier,
          dataContractIdentifier: _document.dataContract.identifier,
          revision: 0,
          txHash: _document.transaction.hash,
          deleted: false,
          data: null,
          timestamp: _document.block.timestamp.toISOString(),
          isSystem: false
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })
  })

  describe('getTransactionsByIdentity()', async () => {
    it('should return default set of transactions by identity', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        transactions.push({ transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transactions`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = transactions
        .sort((a, b) => a.block.height - b.block.height)
        .slice(0, 10)
        .map((_transaction, i) => ({
          hash: _transaction.transaction.hash,
          index: 0,
          blockHash: _transaction.transaction.block_hash,
          blockHeight: _transaction.block.height,
          type: i === 0 ? StateTransitionEnum.IDENTITY_CREATE : StateTransitionEnum.DOCUMENTS_BATCH,
          data: null,
          timestamp: _transaction.block.timestamp.toISOString(),
          gasUsed: _transaction.transaction.gas_used,
          status: _transaction.transaction.status,
          error: _transaction.transaction.error
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
    })

    it('should return default set of transactions by identity desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        transactions.push({ transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transactions?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransactions = transactions
        .sort((a, b) => b.block.height - a.block.height)
        .slice(0, 10)
        .map((_transaction, i) => ({
          hash: _transaction.transaction.hash,
          index: 0,
          blockHash: _transaction.transaction.block_hash,
          blockHeight: _transaction.block.height,
          type: StateTransitionEnum.DOCUMENTS_BATCH,
          data: null,
          timestamp: _transaction.block.timestamp.toISOString(),
          gasUsed: _transaction.transaction.gas_used,
          status: _transaction.transaction.status,
          error: _transaction.transaction.error
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
    })

    it('should allow walk through pages', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        transactions.push({ transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transactions?page=2&limit=4`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 4)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 4)

      const expectedTransactions = transactions
        .sort((a, b) => a.block.height - b.block.height)
        .slice(4, 8)
        .map((_transaction, i) => ({
          hash: _transaction.transaction.hash,
          index: 0,
          blockHash: _transaction.transaction.block_hash,
          blockHeight: _transaction.block.height,
          type: StateTransitionEnum.DOCUMENTS_BATCH,
          data: null,
          timestamp: _transaction.block.timestamp.toISOString(),
          gasUsed: _transaction.transaction.gas_used,
          status: _transaction.transaction.status,
          error: _transaction.transaction.error
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
    })

    it('should allow walk through pages desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transactions = [{ transaction: identity.transaction, block }]

      for (let i = 1; i < 30; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.DOCUMENTS_BATCH
        })
        transactions.push({ transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transactions?page=2&limit=4&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 4)
      assert.equal(body.pagination.total, transactions.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 4)

      const expectedTransactions = transactions
        .sort((a, b) => b.block.height - a.block.height)
        .slice(4, 8)
        .map((_transaction, i) => ({
          hash: _transaction.transaction.hash,
          index: 0,
          blockHash: _transaction.transaction.block_hash,
          blockHeight: _transaction.block.height,
          type: StateTransitionEnum.DOCUMENTS_BATCH,
          data: null,
          timestamp: _transaction.block.timestamp.toISOString(),
          gasUsed: _transaction.transaction.gas_used,
          status: _transaction.transaction.status,
          error: _transaction.transaction.error
        }))

      assert.deepEqual(body.resultSet, expectedTransactions)
    })
  })

  describe('getTransfersByIdentity()', async () => {
    it('should return default set of transfers by identity', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransfers = transfers
        .sort((a, b) => a.block.height - b.block.height)
        .slice(0, 10)
        .map((_transfer, i) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString()
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should return default set of transfers by identity desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedTransfers = transfers
        .sort((a, b) => b.block.height - a.block.height)
        .slice(0, 10)
        .map((_transfer, i) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString()
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should allow to walk through pages', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?page=2&limit=7`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 7)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)

      const expectedTransfers = transfers
        .sort((a, b) => a.block.height - b.block.height)
        .slice(7, 14)
        .map((_transfer, i) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString()
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })

    it('should allow to walk through pages desc', async () => {
      block = await fixtures.block(knex, { height: 1 })
      identity = await fixtures.identity(knex, { block_hash: block.hash })
      transfers = []

      for (let i = 1; i < 31; i++) {
        block = await fixtures.block(knex, { height: i + 1 })
        transaction = await fixtures.transaction(knex, {
          block_hash: block.hash,
          owner: identity.identifier,
          type: StateTransitionEnum.IDENTITY_TOP_UP
        })
        transfer = await fixtures.transfer(knex, {
          amount: 1000,
          recipient: identity.identifier,
          sender: null,
          state_transition_hash: transaction.hash
        })
        transfers.push({ transfer, transaction, block })
      }

      const { body } = await client.get(`/identity/${identity.identifier}/transfers?page=2&limit=7&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 7)
      assert.equal(body.pagination.total, documents.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)

      const expectedTransfers = transfers
        .sort((a, b) => b.block.height - a.block.height)
        .slice(7, 14)
        .map((_transfer, i) => ({
          amount: parseInt(_transfer.transfer.amount),
          sender: _transfer.transfer.sender,
          recipient: _transfer.transfer.recipient,
          timestamp: _transfer.block.timestamp.toISOString()
        }))

      assert.deepEqual(body.resultSet, expectedTransfers)
    })
  })
})
