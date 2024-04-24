const { describe, it, before, after } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const { getKnex } = require('../../src/utils')
const fixtures = require('../utils/fixtures')
const { StateTransitionEnum } = require('../../src/constants')

describe('DataContracts routes', () => {
  let app
  let client
  let knex
  let height

  let block
  let identity
  let dataContracts
  let documents

  before(async () => {
    app = await server.start()
    client = supertest(app.server)
    knex = getKnex()

    await fixtures.cleanup(knex)

    height = 1
    dataContracts = []
    documents = []
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

    for (let i = 5; i < 35; i++) {
      const block = await fixtures.block(knex, { height: i + 1 })
      const transaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        type: StateTransitionEnum.DATA_CONTRACT_CREATE,
        owner: identity.identifier
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
      owner: identity.identifier
    })
    const dataContract = await fixtures.dataContract(knex, {
      state_transition_hash: contractCreateTransaction.hash,
      owner: identity.identifier,
      schema: '{}'
    })
    dataContracts.push({ transaction: contractCreateTransaction, block: block2, dataContract })

    // create random amount of documents
    for (let i = 0; i < 5; i++) {
      const document = await fixtures.document(knex, {
        data_contract_id: dataContract.id, owner: identity.identifier, is_system: true
      })
      dataContract.documents.push(document)
      documents.push({ transaction: null, block: null, dataContract, document })
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  // describe('getDataContracts()', async () => {
  //   it('should return default set of contracts', async () => {
  //     const { body } = await client.get('/dataContracts')
  //       .expect(200)
  //       .expect('Content-Type', 'application/json; charset=utf-8')
  //
  //     const expectedDataContracts = dataContracts.slice(0, 10)
  //       .sort((a, b) => a.dataContract.id - b.dataContract.id)
  //       .map(({ transaction, dataContract, block }) => ({
  //         identifier: dataContract.identifier,
  //         owner: identity.identifier,
  //         schema: null,
  //         version: 0,
  //         txHash: dataContract.is_system ? null : transaction.hash,
  //         timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
  //         isSystem: dataContract.is_system
  //       }))
  //
  //     assert.equal(body.resultSet.length, 10)
  //     assert.equal(body.pagination.total, dataContracts.length)
  //     assert.equal(body.pagination.page, 1)
  //     assert.equal(body.pagination.limit, 10)
  //
  //     assert.deepEqual(body.resultSet, expectedDataContracts)
  //   })
  //
  //   it('should return default set of contracts desc', async () => {
  //     const { body } = await client.get('/dataContracts?order=desc')
  //       .expect(200)
  //       .expect('Content-Type', 'application/json; charset=utf-8')
  //
  //     const expectedDataContracts = dataContracts
  //       .sort((a, b) => b.dataContract.id - a.dataContract.id)
  //       .slice(0, 10)
  //       .map(({ transaction, dataContract, block }) => ({
  //         identifier: dataContract.identifier,
  //         owner: identity.identifier,
  //         schema: null,
  //         version: 0,
  //         txHash: dataContract.is_system ? null : transaction.hash,
  //         timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
  //         isSystem: dataContract.is_system
  //       }))
  //
  //     assert.equal(body.resultSet.length, 10)
  //     assert.equal(body.pagination.total, dataContracts.length)
  //     assert.equal(body.pagination.page, 1)
  //     assert.equal(body.pagination.limit, 10)
  //
  //     assert.deepEqual(body.resultSet, expectedDataContracts)
  //   })
  //
  //   it('should allow to walk through pages', async () => {
  //     const { body } = await client.get('/dataContracts?page=2&limit=6')
  //       .expect(200)
  //       .expect('Content-Type', 'application/json; charset=utf-8')
  //
  //     const expectedDataContracts = dataContracts
  //       .sort((a, b) => a.dataContract.id - b.dataContract.id)
  //       .slice(6, 12)
  //       .map(({ transaction, dataContract, block }) => ({
  //         identifier: dataContract.identifier,
  //         owner: identity.identifier,
  //         schema: null,
  //         version: 0,
  //         txHash: dataContract.is_system ? null : transaction.hash,
  //         timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
  //         isSystem: dataContract.is_system
  //       }))
  //
  //     assert.equal(body.resultSet.length, 6)
  //     assert.equal(body.pagination.total, dataContracts.length)
  //     assert.equal(body.pagination.page, 2)
  //     assert.equal(body.pagination.limit, 6)
  //
  //     assert.deepEqual(body.resultSet, expectedDataContracts)
  //   })
  //
  //   it('should allow to walk through pages desc', async () => {
  //     const { body } = await client.get('/dataContracts?page=3&limit=6&order=desc')
  //       .expect(200)
  //       .expect('Content-Type', 'application/json; charset=utf-8')
  //
  //     const expectedDataContracts = dataContracts
  //       .sort((a, b) => b.dataContract.id - a.dataContract.id)
  //       .slice(12, 18)
  //       .map(({ transaction, dataContract, block }) => ({
  //         identifier: dataContract.identifier,
  //         owner: identity.identifier,
  //         schema: null,
  //         version: 0,
  //         txHash: dataContract.is_system ? null : transaction.hash,
  //         timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
  //         isSystem: dataContract.is_system
  //       }))
  //
  //     assert.equal(body.resultSet.length, 6)
  //     assert.equal(body.pagination.total, dataContracts.length)
  //     assert.equal(body.pagination.page, 3)
  //     assert.equal(body.pagination.limit, 6)
  //
  //     assert.deepEqual(body.resultSet, expectedDataContracts)
  //   })
  // })

  it('should return set sort by tx count (desc)', async () => {
    const { body } = await client.get('/dataContracts?order=desc&order_by=doc_count')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

    const expectedDataContracts = dataContracts
      .sort((a, b) => (b.dataContract.documents.length - a.dataContract.documents.length ||
        b.dataContract.id - a.dataContract.id))
      .slice(0, 10)
      .map(({ transaction, dataContract, block }) => ({
        identifier: dataContract.identifier,
        owner: identity.identifier,
        schema: null,
        version: 0,
        txHash: dataContract.is_system ? null : transaction.hash,
        timestamp: dataContract.is_system ? null : block.timestamp.toISOString(),
        isSystem: dataContract.is_system
      }))

    assert.equal(body.resultSet.length, 10)
    assert.equal(body.pagination.total, dataContracts.length)
    assert.equal(body.pagination.page, 1)
    assert.equal(body.pagination.limit, 10)

    assert.deepEqual(body.resultSet, expectedDataContracts)
  })

  // describe('getDataContractByIdentifier()', async () => {
  //   it('should return system data contract by identifier', async () => {
  //     dataContracts.sort((a, b) => a.dataContract.id - b.dataContract.id)
  //
  //     const { body } = await client.get(`/dataContract/${dataContracts[0].dataContract.identifier}`)
  //       .expect(200)
  //       .expect('Content-Type', 'application/json; charset=utf-8')
  //
  //     const expectedDataContract = {
  //       identifier: dataContracts[0].dataContract.identifier,
  //       owner: identity.identifier,
  //       schema: '{}',
  //       version: 0,
  //       txHash: null,
  //       timestamp: null,
  //       isSystem: true
  //     }
  //
  //     assert.deepEqual(body, expectedDataContract)
  //   })
  //
  //   // it('should return system data contract by identifier', async () => {
  //   //     const {body} = await client.get('/dataContract/GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec')
  //   //         .expect(200)
  //   //         .expect('Content-Type', 'application/json; charset=utf-8');
  //   //
  //   //     assert.equal(body.identifier, 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec')
  //   //     assert.equal(body.txHash, null)
  //   //     assert.equal(body.owner, '4EfA9Jrvv3nnCFdSf7fad59851iiTRZ6Wcu6YVJ4iSeF')
  //   //     assert.equal(body.version, 0)
  //   //     assert.equal(body.timestamp, null)
  //   //     assert.equal(body.isSystem, true)
  //   // });
  //   //
  //   // it('should return last revision of data contract by identifier', async () => {
  //   //     const {body} = await client.get('/dataContract/Gc7HqRGqmA4ZSafQ6zXeKH8Rh4AjNjjWsztotJDLpMXa')
  //   //         .expect(200)
  //   //         .expect('Content-Type', 'application/json; charset=utf-8');
  //   //
  //   //     assert.equal(body.identifier, 'Gc7HqRGqmA4ZSafQ6zXeKH8Rh4AjNjjWsztotJDLpMXa')
  //   //     assert.equal(body.txHash, '4107CE20DB3BE2B2A3B3F3ABA9F68438428E734E4ACF39D4F6D03B0F9B187829')
  //   //     assert.equal(body.owner, 'FRMXvU2vRqk9xTya3MTB58ieBt27izpPyoX3fVLf3HuA')
  //   //     assert.equal(body.version, 2)
  //   //     assert.equal(body.timestamp, '2024-02-22T14:23:57.592Z')
  //   // });
  //
  //   it('should return 404 if data contract not found', async () => {
  //     await client.get('/dataContract/DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF')
  //       .expect(404)
  //       .expect('Content-Type', 'application/json; charset=utf-8')
  //   })
  // })
})
