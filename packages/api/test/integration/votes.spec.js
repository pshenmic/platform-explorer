const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const DAPI = require('../../src/DAPI')

describe('Masternode routes', () => {
  let app
  let client
  let knex

  let dataContract
  let masternodeVotes

  before(async () => {
    mock.method(DAPI.prototype, 'getDocuments', async () => [])

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    await fixtures.cleanup(knex)

    masternodeVotes = []

    const block = await fixtures.block(knex)

    const identity = await fixtures.identity(knex, {
      block_height: block.height,
      block_hash: block.hash
    })

    dataContract = await fixtures.dataContract(knex, {
      owner: identity.identifier
    })

    for (let i = 0; i < 49; i++) {
      const block = await fixtures.block(knex, {
        timestamp: new Date(300000 * i).toISOString()
      })
      const voterIdentity = await fixtures.identity(knex, {
        block_height: block.height,
        block_hash: block.hash
      })
      const transaction = await fixtures.transaction(knex, {
        block_height: block.height,
        block_hash: block.hash,
        type: 8,
        owner: voterIdentity.identifier
      })
      const mnVote = await fixtures.masternodeVote(knex, {
        state_transition_hash: transaction.hash,
        voter_identity_id: voterIdentity.identifier,
        data_contract_id: dataContract.id,
        voter_id: i % 2 === 0 ? voterIdentity.identifier : identity.identifier,
        choice: i % 3 === 0 ? 0 : 2,
        index_values: JSON.stringify(i % 2 === 0 ? ['dash', 'xyz'] : []),
        power: i % 2 === 0 ? 1 : 4
      })

      if (i === 0) {
        const mnVote2 = await fixtures.masternodeVote(knex, {
          state_transition_hash: transaction.hash,
          voter_identity_id: voterIdentity.identifier,
          data_contract_id: dataContract.id,
          voter_id: voterIdentity.identifier,
          choice: i % 3 === 0 ? 0 : 2,
          towards_identity_identifier: identity.identifier,
          power: i % 2 === 0 ? 1 : 4
        })

        masternodeVotes.push({
          block,
          voterIdentity,
          transaction,
          mnVote: mnVote2
        })
      }

      masternodeVotes.push({
        block,
        voterIdentity: i % 2 === 0 ? voterIdentity : identity,
        transaction,
        mnVote
      })
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getMasternodeVotes()', async () => {
    it('should return default set of Masternode votes', async () => {
      const { body } = await client.get('/masternodes/votes')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 50)
      assert.equal(body.pagination.page, 1)

      const expectedVotes = masternodeVotes
        .sort((a, b) => a.mnVote.id - b.mnVote.id)
        .slice(0, 10)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should return default set of Masternode votes with order desc', async () => {
      const { body } = await client.get('/masternodes/votes?order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 50)
      assert.equal(body.pagination.page, 1)

      const expectedVotes = masternodeVotes
        .sort((a, b) => b.mnVote.id - a.mnVote.id)
        .slice(0, 10)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should allow walk thought pages', async () => {
      const { body } = await client.get('/masternodes/votes?page=2')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 50)
      assert.equal(body.pagination.page, 2)

      const expectedVotes = masternodeVotes
        .sort((a, b) => a.mnVote.id - b.mnVote.id)
        .slice(10, 20)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should allow walk thought pages with custom page size', async () => {
      const { body } = await client.get('/masternodes/votes?page=2&limit=15')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 15)
      assert.equal(body.pagination.limit, 15)
      assert.equal(body.pagination.total, 50)
      assert.equal(body.pagination.page, 2)

      const expectedVotes = masternodeVotes
        .sort((a, b) => a.mnVote.id - b.mnVote.id)
        .slice(15, 30)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should allow walk thought pages with custom page size with order desc', async () => {
      const { body } = await client.get('/masternodes/votes?page=2&limit=15&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 15)
      assert.equal(body.pagination.limit, 15)
      assert.equal(body.pagination.total, 50)
      assert.equal(body.pagination.page, 2)

      const expectedVotes = masternodeVotes
        .sort((a, b) => b.mnVote.id - a.mnVote.id)
        .slice(15, 30)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should allow filter by timestamp', async () => {
      const { body } = await client.get(`/masternodes/votes?timestamp_start=${new Date(0).toISOString()}&timestamp_end=${new Date(4200000).toISOString()}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 16)
      assert.equal(body.pagination.page, 1)

      const expectedVotes = masternodeVotes
        .filter(vote => new Date(vote.block.timestamp).getTime() < 4500000)
        .sort((a, b) => a.mnVote.id - b.mnVote.id)
        .slice(0, 10)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should allow filter by timestamp and power', async () => {
      const { body } = await client.get(`/masternodes/votes?timestamp_start=${new Date(0).toISOString()}&timestamp_end=${new Date(4200000).toISOString()}&power=4`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 7)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 7)
      assert.equal(body.pagination.page, 1)

      const expectedVotes = masternodeVotes
        .filter(vote => vote.mnVote.power === 4)
        .filter(vote => new Date(vote.block.timestamp).getTime() < 4500000)
        .sort((a, b) => a.mnVote.id - b.mnVote.id)
        .slice(0, 10)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should allow filter by timestamp and voter identity', async () => {
      const [{ mnVote }] = masternodeVotes.sort((a, b) => a.mnVote.id - b.mnVote.id)

      const { body } = await client.get(`/masternodes/votes?timestamp_start=${new Date(0).toISOString()}&timestamp_end=${new Date(4200000).toISOString()}&voter_identity=${mnVote.voter_identity_id}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 2)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 2)
      assert.equal(body.pagination.page, 1)

      const expectedVotes = masternodeVotes
        .filter(vote => new Date(vote.block.timestamp).getTime() < 4500000 && vote.mnVote.voter_identity_id === mnVote.voter_identity_id)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should allow filter by timestamp and voter identity and towards identity', async () => {
      const [, { mnVote }] = masternodeVotes.sort((a, b) => a.mnVote.id - b.mnVote.id)

      const { body } = await client.get(`/masternodes/votes?timestamp_start=${new Date(0).toISOString()}&timestamp_end=${new Date(4200000).toISOString()}&voter_identity=${mnVote.voter_identity_id}&towards_identity=${mnVote.towards_identity_identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 1)
      assert.equal(body.pagination.page, 1)

      const expectedVotes = masternodeVotes
        .filter(vote => new Date(vote.block.timestamp).getTime() < 4500000 && vote.mnVote.voter_identity_id === mnVote.voter_identity_id && vote.mnVote.towards_identity_identifier === mnVote.towards_identity_identifier)
        .map(({ block, voterIdentity, transaction, mnVote }) => ({
          proTxHash: mnVote.pro_tx_hash,
          txHash: mnVote.state_transition_hash,
          voterIdentifier: mnVote.voter_identity_id,
          choice: mnVote.choice,
          timestamp: block.timestamp,
          towardsIdentity: mnVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: mnVote.document_type_name,
          documentIdentifier: null,
          indexName: mnVote.index_name,
          indexValues: JSON.parse(mnVote.index_values),
          identityAliases: [],
          power: mnVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })
  })
})
