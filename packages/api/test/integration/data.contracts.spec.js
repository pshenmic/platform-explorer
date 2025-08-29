const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const { IdentifierWASM } = require('pshenmic-dpp')
const { DocumentsController } = require('dash-platform-sdk/src/documents')
const { DataContractsController } = require('dash-platform-sdk/src/dataContracts')
const ContestedResourcesController = require('dash-platform-sdk/src/contestedResources')

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

  let aliasTimestamp

  before(async () => {
    aliasTimestamp = new Date()

    mock.method(DocumentsController.prototype, 'query', async () => [{
      properties: {
        label: 'alias',
        parentDomainName: 'dash',
        normalizedLabel: 'a11as'
      },
      id: new IdentifierWASM('AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW'),
      createdAt: BigInt(aliasTimestamp.getTime())
    }])

    mock.method(DataContractsController.prototype, 'getDataContractByIdentifier', async () => ({ groups: undefined }))

    app = await server.start()
    client = supertest(app.server)
    knex = getKnex()

    await fixtures.cleanup(knex)

    mock.method(ContestedResourcesController.default.prototype, 'getContestedResourceVoteState', async () => null)

    height = 1
    dataContracts = []
    documents = []
    diferentVersionsDataContract = []
    block = await fixtures.block(knex, { height })
    identity = await fixtures.identity(knex, {
      block_hash: block.hash,
      block_height: block.height
    })

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
      height = i

      const block1 = await fixtures.block(knex, { height })
      const transaction = await fixtures.transaction(knex, {
        block_height: block1.height,
        block_hash: block1.hash,
        type: StateTransitionEnum.DATA_CONTRACT_CREATE,
        owner: identity.identifier,
        data: 'AAAANB6g6fZVacLiESmz0Z1FUW4fi2YzEfBw1Val4hjUsnIAAAAAAAEBAAABcZnx9oQEyG7PYNnLk67zGPoPKwjln/0Xa970MVT/3msAAQ1kYXRhQ29udHJhY3RzFgQSBHR5cGUSBm9iamVjdBIKcHJvcGVydGllcxYCEgppZGVudGlmaWVyFgQSBHR5cGUSBnN0cmluZxIJbWluTGVuZ3RoA1YSCW1heExlbmd0aANYEghwb3NpdGlvbgMAEgRuYW1lFgQSBHR5cGUSBnN0cmluZxIJbWF4TGVuZ3RoA0ASCW1pbkxlbmd0aAMGEghwb3NpdGlvbgMCEghyZXF1aXJlZBUCEgppZGVudGlmaWVyEgRuYW1lEhRhZGRpdGlvbmFsUHJvcGVydGllcxMAAQACQSAyv1MhMb7BIg1n8F0cn2etI1ONNbxCBSCSrdja5W6F1TRtKQiW4Dckvj5otqvvquK14L8RZMgT1Rhz/GupDl+Z'
      })
      const dataContract = await fixtures.dataContract(knex, {
        state_transition_hash: transaction.hash,
        owner: identity.identifier,
        schema: '{}'
      })

      dataContracts.push({ transaction, block: block1, dataContract })
    }

    height = height + 1
    const block2 = await fixtures.block(knex, { height })
    const contractCreateTransaction = await fixtures.transaction(knex, {
      block_height: block2.height,
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
      height = height + 1
      const block3 = await fixtures.block(knex, { height, timestamp: dataContracts[dataContracts.length - 1].block.timestamp })
      const contractCreateTransaction = await fixtures.transaction(knex, {
        block_height: block3.height,
        block_hash: block3.hash,
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

      height = height + 1

      const block4 = await fixtures.block(knex, { height })
      const documentTransaction = await fixtures.transaction(knex, {
        block_height: block4.height,
        block_hash: block4.hash,
        type: StateTransitionEnum.BATCH,
        owner: identity.identifier,
        data: 'AgEhlXYiSxH/3198ZZ4ie5GrtMWunivxuQ0yWTaW3aO2QgEBAQAAAwCNdLLskTojea4JftOKVvqCzrDtvGS9D7ADq42KJRqCMCz+OMPDDzMeoYxC9XwWwllaHpMVM8iv33Yh1EZNY5e1AAGsecC8m3/PPvYdCkHt5gWisjnhZd8VzQDKCNQnl68p6wUAAAJBIB9sS3dVoEDbasALaqaBDLB8ubMXhnPrlfo7LSpzvfUCdCuucdUJJoNkuiRIXxZkfwGjAGlectH04qhyzZw24nI='
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
      documents.push({ transaction: documentTransaction, block: block4, dataContract, document })
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
          groups: null,
          version: 0,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null,
          tokens: null
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
          groups: null,
          schema: null,
          version: dataContract.version,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null,
          tokens: null
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
          groups: null,
          schema: null,
          version: 0,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null,
          tokens: null
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
          groups: null,
          schema: null,
          version: 0,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null,
          tokens: null
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
          groups: null,
          schema: null,
          version: dataContract.version,
          txHash: dataContract.is_system ? null : transaction.hash,
          timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
          isSystem: dataContract.is_system,
          documentsCount: dataContract.documents.length,
          averageGasUsed: null,
          identitiesInteracted: null,
          topIdentity: null,
          totalGasUsed: null,
          tokens: null
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
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
        },
        groups: null,
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
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
        },
        totalGasUsed: 0,
        tokens: []
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
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
        },
        groups: null,
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
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
        },
        totalGasUsed: 0,
        tokens: []
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
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
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
          action: 'TOKEN_MINT',
          documentIdentifier: null,
          tokenIdentifier: '42dmsi5zHvZg5Mg5q6rgghhQqn8bdAPhfnP96bH5GEQL',
          recipient: null,
          price: null,
          amount: '5'
        }],
        owner: {
          identifier: document.owner,
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
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
          type: StateTransitionEnum[tx.type],
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
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
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
          action: 'TOKEN_MINT',
          documentIdentifier: null,
          tokenIdentifier: '42dmsi5zHvZg5Mg5q6rgghhQqn8bdAPhfnP96bH5GEQL',
          recipient: null,
          price: null,
          amount: '5'
        }],
        owner: {
          identifier: document.owner,
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
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
          type: StateTransitionEnum[tx.type],
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
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
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
          action: 'TOKEN_MINT',
          documentIdentifier: null,
          tokenIdentifier: '42dmsi5zHvZg5Mg5q6rgghhQqn8bdAPhfnP96bH5GEQL',
          recipient: null,
          price: null,
          amount: '5'
        }],
        owner: {
          identifier: document.owner,
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
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
          type: StateTransitionEnum[tx.type],
          action: tx.action,
          owner: tx.owner,
          timestamp: tx.timestamp,
          gasUsed: tx.gasUsed,
          error: tx.error,
          hash: tx.hash
        }))

      assert.deepEqual(body.resultSet, expectedDataTransactions.slice(0, 5))
    })

    it('should return data contract transactions by identifier with custom page size and order desc and custom page', async () => {
      const [dataContract] = dataContracts.filter(dataContract => dataContract.dataContract.documents?.length > 0).sort((a, b) => a.dataContract.id - b.dataContract.id)

      const { body } = await client.get(`/dataContract/${dataContract.dataContract.identifier}/transactions?limit=5&order=desc&page=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.deepEqual(body.resultSet.length, 5)
      assert.deepEqual(body.pagination.page, 2)
      assert.deepEqual(body.pagination.limit, 5)
      assert.deepEqual(body.pagination.total, 11)

      const dataContractVersions = diferentVersionsDataContract.map(dataContractVersion => ({
        type: 0,
        action: null,
        owner: {
          identifier: dataContractVersion.dataContract.owner,
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
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
          action: 'TOKEN_MINT',
          documentIdentifier: null,
          tokenIdentifier: '42dmsi5zHvZg5Mg5q6rgghhQqn8bdAPhfnP96bH5GEQL',
          recipient: null,
          price: null,
          amount: '5'
        }],
        owner: {
          identifier: document.owner,
          aliases: [
            {
              alias: 'alias.dash',
              contested: true,
              documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
              status: 'ok',
              timestamp: aliasTimestamp.toISOString()
            }
          ]
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
          type: StateTransitionEnum[tx.type],
          action: tx.action,
          owner: tx.owner,
          timestamp: tx.timestamp,
          gasUsed: tx.gasUsed,
          error: tx.error,
          hash: tx.hash
        }))

      assert.deepEqual(body.resultSet, expectedDataTransactions.slice(5, 10))
    })
  })
})
