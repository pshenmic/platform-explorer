process.env.EPOCH_CHANGE_TIME = 3600000
const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const tenderdashRpc = require('../../src/tenderdashRpc')
const {NodeController} = require('dash-platform-sdk/src/node')

describe('Epoch routes', () => {
  let app
  let client
  let knex

  let blocks
  let identities
  let transactions
  let validator
  let dataContracts
  let documents
  let masternodeVotes
  let masternodeVotesGas

  before(async () => {
    mock.method(tenderdashRpc, 'getBlockByHeight', async () => ({
      block: {
        header: {
          time: new Date(0).toISOString()
        }
      }
    }))
    mock.method(NodeController.prototype, 'getEpochsInfo', () => [
      {
        number: 0,
        firstBlockHeight: 0,
        firstCoreBlockHeight: 1,
        startTime: 0,
        feeMultiplier: 1
      },
      {
        number: 1,
        firstBlockHeight: 1,
        firstCoreBlockHeight: 1,
        startTime: 1800000,
        feeMultiplier: 1
      }])
    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    blocks = []
    transactions = []
    identities = []
    dataContracts = []
    documents = []
    masternodeVotes = []
    masternodeVotesGas = 0

    await fixtures.cleanup(knex)

    validator = await fixtures.validator(knex)
    for (let i = 1; i <= 30; i++) {
      const block = await fixtures.block(knex, {
        height: i,
        timestamp: new Date(60000 * i),
        validator: i % 5 === 0 ? validator.pro_tx_hash : null
      })
      const identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })
      const transaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        index: i,
        type: 0,
        gas_used: Math.ceil(Math.random() * 1000),
        owner: identity.identifier
      })
      const dataContract = await fixtures.dataContract(knex, {
        owner: identity.identifier
      })
      const document = await fixtures.document(knex, {
        owner: identity.identifier,
        data_contract_id: dataContract.id
      })

      const masternodeVotesPart = []

      for (let v = 0; v < i; v++) {
        const masternodeVote = await fixtures.masternodeVote(knex, {
          state_transition_hash: transaction.hash,
          voter_identity_id: identity.identifier,
          data_contract_id: dataContract.id,
          choice: v % 2 === 0 ? 0 : 1,
          index_values: JSON.stringify([i])
        })

        masternodeVotesGas = masternodeVotesGas + transaction.gas_used

        masternodeVotesPart.push(masternodeVote)
      }

      blocks.push(block)
      transactions.push(transaction)
      identities.push(identity)
      dataContracts.push(dataContract)
      documents.push(document)
      masternodeVotes.push(masternodeVotesPart)
    }
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getEpochInfo()', async () => {
    it('should return epoch data', async () => {
      const { body } = await client.get('/epoch/0')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedBlock = {
        epoch: {
          number: 0,
          firstBlockHeight: '0',
          firstCoreBlockHeight: 1,
          startTime: 0,
          feeMultiplier: '1',
          endTime: 1800000
        },
        tps: (identities.length + transactions.length) / 1800,
        totalCollectedFees: transactions.reduce((acc, tx) => acc + tx.gas_used, 0),
        bestValidator: validator.pro_tx_hash,
        bestVoter: {
          totalCountAbstain: 15,
          totalCountTowardsIdentity: 15,
          totalCountLock: 0,
          identifier: masternodeVotes[masternodeVotes.length - 1][0].voter_identity_id
        },
        topVotedResource: {
          totalCountAbstain: 15,
          totalCountTowardsIdentity: 15,
          totalCountLock: 0,
          resourceValue: [30]
        },
        totalVotesCount: 465,
        totalVotesGasUsed: masternodeVotesGas
      }
      assert.deepEqual(body, expectedBlock)
    })

    it('should return error if not valid date', async () => {
      mock.reset()
      mock.method(NodeController.prototype, 'getEpochsInfo', () => {
        throw new Error()
      })
      await client.get('/epoch/10000000000000000000')
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })
})
