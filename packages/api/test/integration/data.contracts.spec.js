const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const DAPI = require('../../src/DAPI')

describe('DataContracts routes', () => {
  let app
  let client
  let knex
  let height

  let block
  let identity
  let dataContracts
  let documents

  let diferentVersionsDataContract

  before(async () => {
    app = await server.start()
    client = supertest(app.server)
    knex = getKnex()

    await fixtures.cleanup(knex)

    mock.method(DAPI.prototype, 'getContestedState', async () => null)

    height = 1
    dataContracts = []
    documents = []
    diferentVersionsDataContract = []
    block = await fixtures.block(knex)
    identity = await fixtures.identity(knex, { block_hash: block.hash })

    // first 5 system documents
    for (let i = 0; i < 5; i++) {
      const dataContract = await fixtures.dataContract(knex, {
        state_transition_hash: null,
        is_system: true,
        owner: identity.identifier
      })

      dataContracts.push({ transaction: null, block: null, dataContract })
    }

    for (let i = 5; i < 29; i++) {
      const block = await fixtures.block(knex, { height: i + 1 })
      const transaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        type: StateTransitionEnum.DATA_CONTRACT_CREATE,
        owner: identity.identifier,
        data: 'AAAANB6g6fZVacLiESmz0Z1FUW4fi2YzEfBw1Val4hjUsnIAAAAAAAEBAAABcZnx9oQEyG7PYNnLk67zGPoPKwjln/0Xa970MVT/3msAAQ1kYXRhQ29udHJhY3RzFgQSBHR5cGUSBm9iamVjdBIKcHJvcGVydGllcxYCEgppZGVudGlmaWVyFgQSBHR5cGUSBnN0cmluZxIJbWluTGVuZ3RoA1YSCW1heExlbmd0aANYEghwb3NpdGlvbgMAEgRuYW1lFgQSBHR5cGUSBnN0cmluZxIJbWF4TGVuZ3RoA0ASCW1pbkxlbmd0aAMGEghwb3NpdGlvbgMCEghyZXF1aXJlZBUCEgppZGVudGlmaWVyEgRuYW1lEhRhZGRpdGlvbmFsUHJvcGVydGllcxMAAQACQSAyv1MhMb7BIg1n8F0cn2etI1ONNbxCBSCSrdja5W6F1TRtKQiW4Dckvj5otqvvquK14L8RZMgT1Rhz/GupDl+Z'
      })
      const dataContract = await fixtures.dataContract(knex, {
        state_transition_hash: transaction.hash,
        owner: identity.identifier,
        schema: '{}'
      })

      dataContracts.push({ transaction, block, dataContract })
      height = i
    }

    const block2 = await fixtures.block(knex, { height })
    const contractCreateTransaction = await fixtures.transaction(knex, {
      block_hash: block2.hash,
      type: StateTransitionEnum.DATA_CONTRACT_CREATE,
      owner: identity.identifier,
      data: 'AAAANB6g6fZVacLiESmz0Z1FUW4fi2YzEfBw1Val4hjUsnIAAAAAAAEBAAABcZnx9oQEyG7PYNnLk67zGPoPKwjln/0Xa970MVT/3msAAQ1kYXRhQ29udHJhY3RzFgQSBHR5cGUSBm9iamVjdBIKcHJvcGVydGllcxYCEgppZGVudGlmaWVyFgQSBHR5cGUSBnN0cmluZxIJbWluTGVuZ3RoA1YSCW1heExlbmd0aANYEghwb3NpdGlvbgMAEgRuYW1lFgQSBHR5cGUSBnN0cmluZxIJbWF4TGVuZ3RoA0ASCW1pbkxlbmd0aAMGEghwb3NpdGlvbgMCEghyZXF1aXJlZBUCEgppZGVudGlmaWVyEgRuYW1lEhRhZGRpdGlvbmFsUHJvcGVydGllcxMAAQACQSAyv1MhMb7BIg1n8F0cn2etI1ONNbxCBSCSrdja5W6F1TRtKQiW4Dckvj5otqvvquK14L8RZMgT1Rhz/GupDl+Z'
    })
    const dataContract = await fixtures.dataContract(knex, {
      state_transition_hash: contractCreateTransaction.hash,
      owner: identity.identifier,
      schema: '{}'
    })
    dataContract.documents = []
    dataContracts.push({ transaction: contractCreateTransaction, block: block2, dataContract })

    diferentVersionsDataContract.push({ dataContract: dataContracts[dataContracts.length - 1].dataContract, transaction: dataContracts[dataContracts.length - 1].transaction })
    // create some documents in different data contract versions
    for (let i = 0; i < 5; i++) {
      const contractCreateTransaction = await fixtures.transaction(knex, {
        block_hash: block2.hash,
        type: StateTransitionEnum.DATA_CONTRACT_UPDATE,
        owner: identity.identifier,
        data: 'AAAANB6g6fZVacLiESmz0Z1FUW4fi2YzEfBw1Val4hjUsnIAAAAAAAEBAAABcZnx9oQEyG7PYNnLk67zGPoPKwjln/0Xa970MVT/3msAAQ1kYXRhQ29udHJhY3RzFgQSBHR5cGUSBm9iamVjdBIKcHJvcGVydGllcxYCEgppZGVudGlmaWVyFgQSBHR5cGUSBnN0cmluZxIJbWluTGVuZ3RoA1YSCW1heExlbmd0aANYEghwb3NpdGlvbgMAEgRuYW1lFgQSBHR5cGUSBnN0cmluZxIJbWF4TGVuZ3RoA0ASCW1pbkxlbmd0aAMGEghwb3NpdGlvbgMCEghyZXF1aXJlZBUCEgppZGVudGlmaWVyEgRuYW1lEhRhZGRpdGlvbmFsUHJvcGVydGllcxMAAQACQSAyv1MhMb7BIg1n8F0cn2etI1ONNbxCBSCSrdja5W6F1TRtKQiW4Dckvj5otqvvquK14L8RZMgT1Rhz/GupDl+Z'
      })
      const dataContract = await fixtures.dataContract(knex, {
        state_transition_hash: contractCreateTransaction.hash,
        owner: identity.identifier,
        identifier: dataContracts[dataContracts.length - 1].dataContract.identifier,
        version: dataContracts[dataContracts.length - 1].dataContract.version + 1,
        schema: '{}',
        name: 'L33T D4T4C087R4CT',
        documents: dataContracts[dataContracts.length - 1].dataContract.documents
      })

      const documentTransaction = await fixtures.transaction(knex, {
        block_hash: block2.hash,
        type: StateTransitionEnum.BATCH,
        owner: identity.identifier,
        data: 'AgBxmfH2hATIbs9g2cuTrvMY+g8rCOWf/Rdr3vQxVP/eawEDAABF/LZHZLWdw2w3F4+EpbOlpl8RNK6icPPgAI9u0KsLgwMFQ2xhaW2q3m53l6rTxI+1VTW/2E/dRKsBVNmCJOId0FU9WzapBQRiKSUxGfUgcL2NTlWbhbJM3jqldTUNCUFqM2l63hfROQABQR8ouGytATEcwiRiyIQUYhv0HL3oiPWMtzS8SE668LoJ+Geo+PQq0fMsigWlNUNG4bz3UYQfwiubqFmrX8XflISM'
      })

      const document = await fixtures.document(knex, {
        data_contract_id: dataContract.id,
        owner: identity.identifier,
        is_system: true,
        prefunded_voting_balance: i % 2 === 0 ? {} : undefined,
        state_transition_hash: documentTransaction.hash
      })

      diferentVersionsDataContract.push({ dataContract, transaction: contractCreateTransaction })
      dataContract.documents.push(document)
      documents.push({ transaction: documentTransaction, block: block2, dataContract, document })
      dataContracts[dataContracts.length - 1].transaction = contractCreateTransaction
      dataContracts[dataContracts.length - 1].dataContract = dataContract
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getDataContracts()', async () => {
    it('should return default set of contracts', async () => {
      const { body } = await client.get('/dataContracts')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContracts = dataContracts.slice(0, 10)
        .sort((a, b) => a.dataContract.id - b.dataContract.id)
        .map(({ transaction, dataContract, block }) => ({
          identifier: dataContract.identifier,
          name: dataContract.name,
          owner: identity.identifier,
          schema: null,
          version: 0,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null
        }))

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should return default set of contracts desc', async () => {
      const { body } = await client.get('/dataContracts?order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContracts = dataContracts
        .sort((a, b) => b.dataContract.id - a.dataContract.id)
        .slice(0, 10)
        .map(({ transaction, dataContract, block }) => ({
          identifier: dataContract.identifier,
          name: dataContract.name,
          owner: identity.identifier,
          schema: null,
          version: dataContract.version,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null
        }))

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should allow to walk through pages', async () => {
      const { body } = await client.get('/dataContracts?page=2&limit=6')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContracts = dataContracts
        .sort((a, b) => a.dataContract.id - b.dataContract.id)
        .slice(6, 12)
        .map(({ transaction, dataContract, block }) => ({
          identifier: dataContract.identifier,
          name: dataContract.name,
          owner: identity.identifier,
          schema: null,
          version: 0,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null
        }))

      assert.equal(body.resultSet.length, 6)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 6)

      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should allow to walk through pages desc', async () => {
      const { body } = await client.get('/dataContracts?page=3&limit=6&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContracts = dataContracts
        .sort((a, b) => b.dataContract.id - a.dataContract.id)
        .slice(12, 18)
        .map(({ transaction, dataContract, block }) => ({
          identifier: dataContract.identifier,
          name: dataContract.name,
          owner: identity.identifier,
          schema: null,
          version: 0,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null
        }))

      assert.equal(body.resultSet.length, 6)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 6)

      assert.deepEqual(body.resultSet, expectedDataContracts)
    })

    it('should return set sort by doc count (desc)', async () => {
      const { body } = await client.get('/dataContracts?order=desc&order_by=documents_count')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContracts = dataContracts
        .sort((a, b) => (b.dataContract.documents.length - a.dataContract.documents.length ||
          b.dataContract.id - a.dataContract.id))
        .slice(0, 10)
        .map(({ transaction, dataContract, block }) => ({
          identifier: dataContract.identifier,
          name: dataContract.name,
          owner: identity.identifier,
          schema: null,
          version: dataContract.version,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null
        }))

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, dataContracts.length)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      assert.deepEqual(body.resultSet, expectedDataContracts)
    })
  })

  describe('getDataContractByIdentifier()', async () => {
    it('should return system data contract by identifier', async () => {
      const [dataContract] = dataContracts.sort((a, b) => a.dataContract.id - b.dataContract.id)

      const { body } = await client.get(`/dataContract/${dataContract.dataContract.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContract = {
        identifier: dataContract.dataContract.identifier,
        name: dataContract.dataContract.name,
        owner: {
          identifier: identity.identifier.trim(),
          aliases: []
        },
        schema: '{}',
        version: 0,
        txHash: null,
        timestamp: null,
        isSystem: true,
        documentsCount: 0,
        averageGasUsed: 0,
        identitiesInteracted: 0,
        topIdentity: {
          identifier: null,
          aliases: []
        },
        totalGasUsed: 0
      }

      assert.deepEqual(body, expectedDataContract)
    })

    it('should return data contract by identifier', async () => {
      const [dataContract] = dataContracts.sort((a, b) => b.dataContract.id - a.dataContract.id)

      const { body } = await client.get(`/dataContract/${dataContract.dataContract.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDataContract = {
        identifier: dataContract.dataContract.identifier,
        name: dataContract.dataContract.name,
        owner: {
          identifier: identity.identifier.trim(),
          aliases: []
        },
        schema: '{}',
        version: dataContract.dataContract.version,
        txHash: dataContract.transaction.hash,
        timestamp: dataContract.block.timestamp.toISOString(),
        isSystem: false,
        documentsCount: dataContract.dataContract.documents.length,
        averageGasUsed: 0,
        identitiesInteracted: 1,
        topIdentity: {
          identifier: dataContract.dataContract.owner.trim(),
          aliases: []
        },
        totalGasUsed: 0
      }

      assert.deepEqual(body, expectedDataContract)
    })

    it('should return 404 if data contract not found', async () => {
      await client.get('/dataContract/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getDataContractTransactions()', async () => {
    it('should return data contract transactions by identifier', async () => {
      const [dataContract] = dataContracts.filter(dataContract => dataContract.dataContract.documents?.length > 0).sort((a, b) => a.dataContract.id - b.dataContract.id)

      const { body } = await client.get(`/dataContract/${dataContract.dataContract.identifier}/transactions`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.resultSet.length, 10)
      assert.deepEqual(body.pagination.page, 1)
      assert.deepEqual(body.pagination.limit, 10)
      assert.deepEqual(body.pagination.total, 11)

      const dataContractVersions = diferentVersionsDataContract.map(dataContractVersion => ({
        type: 0,
        action: null,
        owner: {
          identifier: dataContractVersion.dataContract.owner,
          aliases: []
        },
        timestamp: dataContract.block.timestamp.toISOString(),
        gasUsed: 0,
        error: null,
        hash: dataContractVersion.transaction.hash,
        id: dataContractVersion.transaction.id
      }))

      const documentsTransactions = documents.map(({ document, transaction, block }) => ({
        type: 1,
        action: [{
          action: 3,
          id: '5iCdbVb5Tn3GLzqCzsX7SVXaZgFeNQ1NDmVZ51Rap1Tx'
        }],
        owner: {
          identifier: document.owner,
          aliases: []
        },
        timestamp: block.timestamp.toISOString(),
        gasUsed: 0,
        error: null,
        hash: transaction.hash,
        id: transaction.id
      }))

      const expectedDataTransactions = [...dataContractVersions, ...documentsTransactions]
        .sort((a, b) => a.id - b.id)
        .map(tx => ({
          type: tx.type,
          action: tx.action,
          owner: tx.owner,
          timestamp: tx.timestamp,
          gasUsed: tx.gasUsed,
          error: tx.error,
          hash: tx.hash
        }))

      assert.deepEqual(body.resultSet, expectedDataTransactions.slice(0, 10))
    })

    it('should return data contract transactions by identifier with custom page size', async () => {
      const [dataContract] = dataContracts.filter(dataContract => dataContract.dataContract.documents?.length > 0).sort((a, b) => a.dataContract.id - b.dataContract.id)

      const { body } = await client.get(`/dataContract/${dataContract.dataContract.identifier}/transactions?limit=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.resultSet.length, 5)
      assert.deepEqual(body.pagination.page, 1)
      assert.deepEqual(body.pagination.limit, 5)
      assert.deepEqual(body.pagination.total, 11)

      const dataContractVersions = diferentVersionsDataContract.map(dataContractVersion => ({
        type: 0,
        action: null,
        owner: {
          identifier: dataContractVersion.dataContract.owner,
          aliases: []
        },
        timestamp: dataContract.block.timestamp.toISOString(),
        gasUsed: 0,
        error: null,
        hash: dataContractVersion.transaction.hash,
        id: dataContractVersion.transaction.id
      }))

      const documentsTransactions = documents.map(({ document, transaction, block }) => ({
        type: 1,
        action: [{
          action: 3,
          id: '5iCdbVb5Tn3GLzqCzsX7SVXaZgFeNQ1NDmVZ51Rap1Tx'
        }],
        owner: {
          identifier: document.owner,
          aliases: []
        },
        timestamp: block.timestamp.toISOString(),
        gasUsed: 0,
        error: null,
        hash: transaction.hash,
        id: transaction.id
      }))

      const expectedDataTransactions = [...dataContractVersions, ...documentsTransactions]
        .sort((a, b) => a.id - b.id)
        .map(tx => ({
          type: tx.type,
          action: tx.action,
          owner: tx.owner,
          timestamp: tx.timestamp,
          gasUsed: tx.gasUsed,
          error: tx.error,
          hash: tx.hash
        }))

      assert.deepEqual(body.resultSet, expectedDataTransactions.slice(0, 5))
    })

    it('should return data contract transactions by identifier with custom page size and order desc', async () => {
      const [dataContract] = dataContracts.filter(dataContract => dataContract.dataContract.documents?.length > 0).sort((a, b) => a.dataContract.id - b.dataContract.id)

      const { body } = await client.get(`/dataContract/${dataContract.dataContract.identifier}/transactions?limit=5&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.resultSet.length, 5)
      assert.deepEqual(body.pagination.page, 1)
      assert.deepEqual(body.pagination.limit, 5)
      assert.deepEqual(body.pagination.total, 11)

      const dataContractVersions = diferentVersionsDataContract.map(dataContractVersion => ({
        type: 0,
        action: null,
        owner: {
          identifier: dataContractVersion.dataContract.owner,
          aliases: []
        },
        timestamp: dataContract.block.timestamp.toISOString(),
        gasUsed: 0,
        error: null,
        hash: dataContractVersion.transaction.hash,
        id: dataContractVersion.transaction.id
      }))

      const documentsTransactions = documents.map(({ document, transaction, block }) => ({
        type: 1,
        action: [{
          action: 3,
          id: '5iCdbVb5Tn3GLzqCzsX7SVXaZgFeNQ1NDmVZ51Rap1Tx'
        }],
        owner: {
          identifier: document.owner,
          aliases: []
        },
        timestamp: block.timestamp.toISOString(),
        gasUsed: 0,
        error: null,
        hash: transaction.hash,
        id: transaction.id
      }))

      const expectedDataTransactions = [...dataContractVersions, ...documentsTransactions]
        .sort((a, b) => b.id - a.id)
        .map(tx => ({
          type: tx.type,
          action: tx.action,
          owner: tx.owner,
          timestamp: tx.timestamp,
          gasUsed: tx.gasUsed,
          error: tx.error,
          hash: tx.hash
        }))

      assert.deepEqual(body.resultSet, expectedDataTransactions.slice(0, 5))
    })
  })
})
