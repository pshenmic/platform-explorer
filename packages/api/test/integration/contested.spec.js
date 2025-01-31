const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const DAPI = require('../../src/DAPI')

describe('Contested documents routes', () => {
  let app
  let client
  let knex

  let block
  let identity
  let dataContract
  let contestedResources

  before(async () => {
    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    await fixtures.cleanup(knex)

    contestedResources = []

    block = await fixtures.block(knex)
    identity = await fixtures.identity(knex, { block_hash: block.hash })
    dataContract = await fixtures.dataContract(knex, {
      owner: identity.identifier,
      schema: {
        domain: {
          type: 'object',
          indices: [
            {
              name: 'parentNameAndLabel',
              unique: true,
              contested: {
                resolution: 0,
                description: 'If the normalized label part of this index is less than 20 characters (all alphabet a-z, A-Z, 0, 1, and -) then a masternode vote contest takes place to give out the name',
                fieldMatches: [
                  {
                    field: 'normalizedLabel',
                    regexPattern: '^[a-zA-Z01-]{3,19}$'
                  }
                ]
              },
              properties: [
                {
                  normalizedParentDomainName: 'asc'
                },
                {
                  normalizedLabel: 'asc'
                }
              ]
            }
          ]
        }
      }
    })

    for (let i = 0; i < 10; i++) {
      const block = await fixtures.block(knex, {
        timestamp: new Date(i)
      })
      const contender = await fixtures.identity(knex, {
        block_hash: block.hash
      })
      const documentTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        type: 0,
        owner: contender.identifier,
        gas_used: 11
      })
      const document = await fixtures.document(knex, {
        owner: contender.identifier,
        data_contract_id: dataContract.id,
        data: {
          label: 'xyz',
          records: {
            identity: '36LGwPSXef8q8wpdnx4EdDeVNuqCYNAE9boDu5bxytsm'
          },
          preorderSalt: 'r9uAaZjEz+lsPrpqt+rqGQ+qIxZS40Ci7wkV8cGI7k4=',
          subdomainRules: {
            allowSubdomains: false
          },
          normalizedLabel: 'xyz',
          parentDomainName: 'dash',
          normalizedParentDomainName: 'dash'
        },
        prefunded_voting_balance: {
          parentNameAndLabel: 20000000
        },
        state_transition_hash: documentTransaction.hash
      })

      const masternodeIdentity = await fixtures.identity(knex, {
        block_hash: block.hash
      })

      const masternodeTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        type: 0,
        owner: masternodeIdentity.identifier,
        gas_used: 13
      })

      const masternodeVote = await fixtures.masternodeVote(knex, {
        state_transition_hash: masternodeTransaction.hash,
        voter_identity_id: masternodeIdentity.identifier,
        data_contract_id: dataContract.id,
        choice: i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : 2),
        towards_identity_identifier: i % 3 === 0 ? contender.identifier : undefined,
        index_values: JSON.stringify(['dash', 'xyz']),
        document_type_name: 'domain',
        index_name: 'parentNameAndLabel'
      })

      contestedResources.push({
        block,
        contender,
        documentTransaction,
        document,
        masternodeIdentity,
        masternodeTransaction,
        masternodeVote
      })
    }

    mock.method(DAPI.prototype, 'getContestedState', async () => ({ finishedVoteInfo: {} }))
  })

  after(async () => {
    await server.stop()
    await knex.destroy()
  })

  describe('getContestedResource()', async () => {
    it('should return default set of Masternode votes', async () => {
      const { body } = await client.get('/contested?resource_value=dash&resource_value=xyz')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedResource = {
        contenders: contestedResources.map(resource => ({
          identifier: resource.contender.identifier,
          timestamp: resource.block.timestamp.toISOString(),
          documentIdentifier: resource.document.identifier,
          documentStateTransition: resource.document.state_transition_hash,
          aliases: [],
          yesVotes: contestedResources.filter(res => res.masternodeVote.towards_identity_identifier === resource.contender.identifier).length,
          abstainVotes: 3,
          notMeVotes: 7 - contestedResources.filter(res => res.masternodeVote.towards_identity_identifier === resource.contender.identifier).length
        })),
        indexName: 'parentNameAndLabel',
        resourceValue: ['dash', 'xyz'],
        dataContractIdentifier: dataContract.identifier,
        prefundedVotingBalance: {
          parentNameAndLabel: 20000000
        },
        documentTypeName: 'type_name',
        timestamp: contestedResources[0].block.timestamp.toISOString(),
        totalGasUsed: 240,
        totalDocumentsGasUsed: 110,
        totalVotesGasUsed: 130,
        totalCountVotes: contestedResources.length,
        totalCountLock: 3,
        totalCountAbstain: 3,
        totalCountYes: 4,
        status: 'finished',
        endTimestamp: null
      }

      assert.deepEqual(body, expectedResource)
    })
  })
})
