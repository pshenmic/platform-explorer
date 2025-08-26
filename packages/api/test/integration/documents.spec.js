const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const StateTransitionEnum = require('../../src/enums/StateTransitionEnum')
const { getKnex } = require('../../src/utils')
const tenderdashRpc = require('../../src/tenderdashRpc')
const { IdentifierWASM } = require('pshenmic-dpp')
const BatchEnum = require('../../src/enums/BatchEnum')
const {DocumentsController} = require("dash-platform-sdk/src/documents");

describe('Documents routes', () => {
  let app
  let client
  let knex

  let identity
  let dataContract
  let block
  let documents

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

    mock.method(tenderdashRpc, 'getBlockByHeight', async () => ({
      block: {
        header: {
          time: new Date(0).toISOString()
        }
      }
    }))

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    await fixtures.cleanup(knex)

    documents = []

    block = await fixtures.block(knex, { height: 1, timestamp: new Date(0).toISOString() })
    identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

    const dataContractTransaction = await fixtures.transaction(knex, {
      block_hash: block.hash,
      block_height: block.height,
      type: StateTransitionEnum.DATA_CONTRACT_CREATE,
      owner: identity.identifier
    })
    dataContract = await fixtures.dataContract(knex, {
      state_transition_hash: dataContractTransaction.hash,
      owner: identity.identifier,
      schema: JSON.stringify(
        {
          note: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                position: 0
              }
            },
            additionalProperties: false
          }
        }
      )
    })

    const documentTransaction = await fixtures.transaction(knex, {
      block_hash: block.hash,
      block_height: block.height,
      type: StateTransitionEnum.BATCH,
      owner: identity.identifier,
      data: 'AgAOCeQUD4t3d4EL5WxH8KtcvZvtHnc6vZ+f3y/memaf9wEAAABgCLhdmCbncK0httWF8BDx37Oz8q3GSSMpu++P3sGx1wIEbm90ZdpXZPiQJeml9oBjOQnbWPb39tNYLERTk/FarViCHJ8r8Jo86sqi8SuYeboiPVuMZsMQbv5Y7cURVW8x7pZ2QSsBB21lc3NhZ2USMFR1dG9yaWFsIENJIFRlc3QgQCBUaHUsIDA4IEF1ZyAyMDI0IDIwOjI1OjAzIEdNVAAAAUEfLtRrTrHXdpT9Pzp4PcNiKV13nnAYAqrl0w3KfWI8QR5f7TTen0N66ZUU7R7AoXV8kliIwVqpxiCVwChbh2XiYQ=='
    })

    const documentForDapiSearch = await fixtures.document(knex, {
      data_contract_id: dataContract.id,
      owner: identity.identifier,
      is_system: true,
      state_transition_hash: documentTransaction.hash,
      document_type_name: 'note',
      data: {
        type: 'note',
        identifier: '7TsrNHXDy14fYoRcoYjZHH14K4riMGU2VeHMwopG82DL'
      },
      identifier: '7TsrNHXDy14fYoRcoYjZHH14K4riMGU2VeHMwopG82DL'
    })

    documents.push({ transaction: documentTransaction, block, dataContract, document: documentForDapiSearch })

    for (let i = 0; i < 4; i++) {
      const document = await fixtures.document(knex, {
        data_contract_id: dataContract.id,
        owner: identity.identifier,
        is_system: true,
        state_transition_hash: documentTransaction.hash
      })

      documents.push({ transaction: documentTransaction, block, dataContract, document })
    }

    for (let i = 5; i < 30; i++) {
      const documentTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        type: StateTransitionEnum.BATCH,
        owner: identity.identifier,
        data: 'AgAOCeQUD4t3d4EL5WxH8KtcvZvtHnc6vZ+f3y/memaf9wEAAABgCLhdmCbncK0httWF8BDx37Oz8q3GSSMpu++P3sGx1wIEbm90ZdpXZPiQJeml9oBjOQnbWPb39tNYLERTk/FarViCHJ8r8Jo86sqi8SuYeboiPVuMZsMQbv5Y7cURVW8x7pZ2QSsBB21lc3NhZ2USMFR1dG9yaWFsIENJIFRlc3QgQCBUaHUsIDA4IEF1ZyAyMDI0IDIwOjI1OjAzIEdNVAAAAUEfLtRrTrHXdpT9Pzp4PcNiKV13nnAYAqrl0w3KfWI8QR5f7TTen0N66ZUU7R7AoXV8kliIwVqpxiCVwChbh2XiYQ=='
      })
      const document = await fixtures.document(knex, {
        data_contract_id: dataContract.id,
        state_transition_hash: documentTransaction.hash,
        owner: identity.identifier
      })

      documents.push({ transaction: documentTransaction, block, dataContract, document })
    }

    for (let i = 5; i < 30; i++) {
      const documentTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        type: StateTransitionEnum.BATCH,
        owner: identity.identifier,
        data: 'AgAOCeQUD4t3d4EL5WxH8KtcvZvtHnc6vZ+f3y/memaf9wEAAABgCLhdmCbncK0httWF8BDx37Oz8q3GSSMpu++P3sGx1wIEbm90ZdpXZPiQJeml9oBjOQnbWPb39tNYLERTk/FarViCHJ8r8Jo86sqi8SuYeboiPVuMZsMQbv5Y7cURVW8x7pZ2QSsBB21lc3NhZ2USMFR1dG9yaWFsIENJIFRlc3QgQCBUaHUsIDA4IEF1ZyAyMDI0IDIwOjI1OjAzIEdNVAAAAUEfLtRrTrHXdpT9Pzp4PcNiKV13nnAYAqrl0w3KfWI8QR5f7TTen0N66ZUU7R7AoXV8kliIwVqpxiCVwChbh2XiYQ=='
      })
      const document = await fixtures.document(knex, {
        data_contract_id: dataContract.id,
        state_transition_hash: documentTransaction.hash,
        owner: identity.identifier,
        document_type_name: 'test'
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
      const [document] = documents

      const { body } = await client.get(`/document/${document.document.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      // We can't check the document correctly as we are taking data from DAPI
      // so we'll verify the data we're sending to DAPI.
      const expectedDocument = {
        dataContractIdentifier: document.dataContract.identifier,
        identifier: document.document.identifier,
        revision: 1,
        txHash: document.transaction.hash,
        deleted: document.document.deleted,
        data: JSON.stringify(document.document.data),
        timestamp: document.block.timestamp,
        entropy: 'f09a3ceacaa2f12b9879ba223d5b8c66c3106efe58edc511556f31ee9676412b',
        documentTypeName: document.document.document_type_name,
        prefundedVotingBalance: null,
        owner: {
          identifier: document.document.owner,
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
        system: document.document.is_system,
        identityContractNonce: null,
        gasUsed: null,
        totalGasUsed: 0,
        transitionType: BatchEnum[0]
      }

      assert.deepEqual(body, expectedDocument)
    })

    it('should return system document', async () => {
      const [document] = documents.filter(e => e.document.is_system)

      const { body } = await client.get(`/document/${document.document.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDocument = {
        dataContractIdentifier: document.dataContract.identifier,
        identifier: document.document.identifier,
        system: true,
        revision: 1,
        deleted: document.document.deleted,
        data: JSON.stringify(document.document.data),
        timestamp: new Date(0).toISOString(),
        entropy: 'f09a3ceacaa2f12b9879ba223d5b8c66c3106efe58edc511556f31ee9676412b',
        documentTypeName: document.document.document_type_name,
        prefundedVotingBalance: null,
        owner: {
          identifier: document.document.owner,
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
        txHash: document.transaction.hash,
        identityContractNonce: null,
        gasUsed: null,
        totalGasUsed: 0,
        transitionType: BatchEnum[0]
      }

      assert.deepEqual(body, expectedDocument)
    })

    it('should return 404 if document not found', async () => {
      // fake identifier
      await client.get('/document/Po1uVkjb7V5WozqdXvosa7LZ9SvXbyaWUV8jfnPUew3')
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getDocumentRevisions()', async () => {
    it('should return document transactions by identifier', async () => {
      const [document] = documents.filter(e => !e.document.is_system)

      const { body } = await client.get(`/document/${document.document.identifier}/revisions`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedDocument = {
        revision: document.document.revision,
        owner: {
          identifier: document.document.owner,
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
        txHash: document.transaction.hash,
        timestamp: document.block.timestamp,
        transitionType: BatchEnum[document.document.transition_type],
        data: '{}',
        dataContractIdentifier: null,
        deleted: null,
        documentTypeName: null,
        entropy: null,
        identifier: document.document.identifier,
        identityContractNonce: null,
        prefundedVotingBalance: null,
        gasUsed: 0,
        totalGasUsed: null,
        system: null
      }

      assert.deepEqual(body.resultSet, [expectedDocument])
    })
  })

  describe('getDocumentsByDataContract()', async () => {
    it('should return default set of documents', async () => {
      const { body } = await client.get(`/dataContract/${dataContract.identifier}/documents`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, 55)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents
        .slice(0, 10)
        .map(({ block, document, dataContract, transaction }) => ({
          identifier: document.identifier,
          dataContractIdentifier: dataContract.identifier,
          revision: document.revision,
          txHash: transaction.hash ?? null,
          deleted: document.deleted,
          data: JSON.stringify(document.data),
          timestamp: block.timestamp,
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
          system: document.is_system,
          entropy: null,
          documentTypeName: document.document_type_name,
          transitionType: BatchEnum[document.transition_type],
          prefundedVotingBalance: null,
          gasUsed: null,
          totalGasUsed: null,
          identityContractNonce: null
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should return default set of documents by type_name', async () => {
      const { body } = await client.get(`/dataContract/${dataContract.identifier}/documents?document_type_name=test`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, 25)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents
        .filter(({ document }) => document.document_type_name === 'test')
        .slice(0, 10)
        .map(({ block, document, dataContract, transaction }) => ({
          identifier: document.identifier,
          dataContractIdentifier: dataContract.identifier,
          revision: document.revision,
          txHash: transaction.hash,
          deleted: document.deleted,
          data: JSON.stringify(document.data?.dataContractObject
            ? {
                type: document.data.type,
                identifier: document.data.identifier,
                dataContractObject: {
                  id: document.data?.dataContractObject?.id ?? null,
                  ownerId: document.data?.dataContractObject?.ownerId ?? null,
                  version: document.data?.dataContractObject?.version ?? null,
                  $format_version: document.data?.dataContractObject?.$format_version ?? null,
                  documentSchemas: document.data?.dataContractObject?.documentSchemas ?? null
                }
              }
            : {}),
          transitionType: BatchEnum[0],
          entropy: null,
          prefundedVotingBalance: null,
          documentTypeName: document.document_type_name,
          timestamp: block.timestamp,
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
          system: document.is_system,
          gasUsed: null,
          totalGasUsed: null,
          identityContractNonce: null
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should return default set of documents by type name', async () => {
      const { body } = await client.get(`/dataContract/${dataContract.identifier}/documents?document_type_name=note`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 1)
      assert.equal(body.pagination.total, 1)
      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)

      const expectedDocuments = documents
        .slice(0, 1)
        .map(({ block, document, dataContract, transaction }) => ({
          identifier: document.identifier,
          dataContractIdentifier: dataContract.identifier,
          revision: document.revision,
          txHash: transaction.hash,
          deleted: document.deleted,
          data: JSON.stringify(document.data),
          transitionType: BatchEnum[0],
          documentTypeName: document.document_type_name,
          timestamp: block.timestamp,
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
          system: document.is_system,
          entropy: null,
          prefundedVotingBalance: null,
          gasUsed: null,
          totalGasUsed: null,
          identityContractNonce: null
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })

    it('should return default set of documents desc', async () => {
      const { body } = await client.get(`/dataContract/${dataContract.identifier}/documents?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.total, 55)
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
          data: JSON.stringify(document.data?.dataContractObject
            ? {
                type: document.data.type,
                identifier: document.data.identifier,
                dataContractObject: {
                  id: document.data?.dataContractObject?.id ?? null,
                  ownerId: document.data?.dataContractObject?.ownerId ?? null,
                  version: document.data?.dataContractObject?.version ?? null,
                  $format_version: document.data?.dataContractObject?.$format_version ?? null,
                  documentSchemas: document.data?.dataContractObject?.documentSchemas ?? null
                }
              }
            : {}),
          transitionType: BatchEnum[0],
          documentTypeName: document.document_type_name,
          timestamp: document.is_system ? null : block.timestamp,
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
          system: document.is_system,
          entropy: null,
          prefundedVotingBalance: null,
          totalGasUsed: null,
          gasUsed: null,
          identityContractNonce: null
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
          txHash: transaction.hash,
          deleted: document.deleted,
          data: JSON.stringify(document.data?.dataContractObject
            ? {
                type: document.data.type,
                identifier: document.data.identifier,
                dataContractObject: {
                  id: document.data?.dataContractObject?.id ?? null,
                  ownerId: document.data?.dataContractObject?.ownerId ?? null,
                  version: document.data?.dataContractObject?.version ?? null,
                  $format_version: document.data?.dataContractObject?.$format_version ?? null,
                  documentSchemas: document.data?.dataContractObject?.documentSchemas ?? null
                }
              }
            : {}),
          transitionType: BatchEnum[0],
          documentTypeName: 'type_name',
          timestamp: block.timestamp,
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
          system: document.is_system,
          entropy: null,
          prefundedVotingBalance: null,
          totalGasUsed: null,
          gasUsed: null,
          identityContractNonce: null
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
          data: JSON.stringify(document.data?.dataContractObject
            ? {
                type: document.data.type,
                identifier: document.data.identifier,
                dataContractObject: {
                  id: document.data?.dataContractObject?.id ?? null,
                  ownerId: document.data?.dataContractObject?.ownerId ?? null,
                  version: document.data?.dataContractObject?.version ?? null,
                  $format_version: document.data?.dataContractObject?.$format_version ?? null,
                  documentSchemas: document.data?.dataContractObject?.documentSchemas ?? null
                }
              }
            : {}),
          transitionType: BatchEnum[0],
          documentTypeName: document.document_type_name,
          timestamp: document.is_system ? null : block.timestamp,
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
          system: document.is_system,
          entropy: null,
          prefundedVotingBalance: null,
          totalGasUsed: null,
          gasUsed: null,
          identityContractNonce: null
        }))

      assert.deepEqual(body.resultSet, expectedDocuments)
    })
  })
})
