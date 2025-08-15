const { describe, it, before, after, mock } = require('node:test')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const DAPI = require('../../src/DAPI')
const { CONTESTED_RESOURCE_VOTE_DEADLINE } = require('../../src/constants')
const ChoiceEnum = require('../../src/enums/ChoiceEnum')
const { IdentifierWASM } = require('pshenmic-dpp')

describe('Contested documents routes', () => {
  let app
  let client
  let knex

  let block
  let identity
  let dataContract
  let contestedResources

  let resourceValue

  let aliasTimestamp

  before(async () => {
    aliasTimestamp = new Date()

    mock.method(DAPI.prototype, 'getDocuments', async () => [{
      properties: {
        label: 'alias',
        parentDomainName: 'dash',
        normalizedLabel: 'a11as'
      },
      id: new IdentifierWASM('AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW'),
      createdAt: BigInt(aliasTimestamp.getTime())
    }])

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    await fixtures.cleanup(knex)

    contestedResources = []

    resourceValue = Buffer.from('["dash", "xyz"]').toString('base64')
    block = await fixtures.block(knex)
    identity = await fixtures.identity(knex, {
      block_hash: block.hash,
      block_height: block.height
    })
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
        timestamp: new Date(i),
        height: i + 1
      })
      const contender = await fixtures.identity(knex, {
        block_hash: block.hash,
        block_height: block.height
      })
      const documentTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
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
        block_hash: block.hash,
        block_height: block.height
      })

      const masternodeTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
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

    for (let i = 0; i < 30; i++) {
      const block = await fixtures.block(knex, {
        timestamp: new Date((i + 10) * 100),
        height: i + 11
      })
      const contender = await fixtures.identity(knex, {
        block_hash: block.hash,
        block_height: block.height
      })
      const documentTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        type: 0,
        owner: contender.identifier,
        gas_used: 11
      })

      const randomName = `${Math.round(Math.random() * 1000)}${Math.round(Math.random() * 1000)}${Math.round(Math.random() * 1000)}`

      const document = await fixtures.document(knex, {
        owner: contender.identifier,
        data_contract_id: dataContract.id,
        data: {
          label: i % 2 === 0 ? randomName : contestedResources[contestedResources.length - 1].document.data.label,
          records: {
            identity: '36LGwPSXef8q8wpdnx4EdDeVNuqCYNAE9boDu5bxytsm'
          },
          preorderSalt: 'r9uAaZjEz+lsPrpqt+rqGQ+qIxZS40Ci7wkV8cGI7k4=',
          subdomainRules: {
            allowSubdomains: false
          },
          normalizedLabel: i % 2 === 0 ? randomName : contestedResources[contestedResources.length - 1].document.data.label,
          parentDomainName: 'dash',
          normalizedParentDomainName: 'dash'
        },
        prefunded_voting_balance: {
          parentNameAndLabel: 20000000
        },
        state_transition_hash: documentTransaction.hash
      })

      const masternodeIdentity = await fixtures.identity(knex, {
        block_height: block.height,
        block_hash: block.hash
      })

      const masternodeTransaction = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
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
        index_values: JSON.stringify(['dash', i % 2 === 0 ? randomName : contestedResources[contestedResources.length - 1].document.data.label]),
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
      const { body } = await client.get(`/contestedResource/${resourceValue}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedResource = {
        contenders: contestedResources
          .filter(resource => resource.document.data.label === 'xyz')
          .map(resource => ({
            identifier: resource.contender.identifier,
            timestamp: resource.block.timestamp.toISOString(),
            documentIdentifier: resource.document.identifier,
            documentStateTransition: resource.document.state_transition_hash,
            aliases: [
              {
                alias: 'alias.dash',
                contested: true,
                documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                status: 'ok',
                timestamp: aliasTimestamp.toISOString()
              }
            ],
            towardsIdentityVotes: contestedResources.filter(res => res.masternodeVote.towards_identity_identifier === resource.contender.identifier).length,
            abstainVotes: contestedResources
              .filter(res =>
                res.masternodeVote.index_values === JSON.stringify(['dash', 'xyz']) &&
                res.masternodeVote.choice === ChoiceEnum.ABSTAIN)
              .length,
            lockVotes: contestedResources
              .filter(res =>
                res.masternodeVote.index_values === JSON.stringify(['dash', 'xyz']) &&
                res.masternodeVote.choice !== ChoiceEnum.ABSTAIN &&
                (res.masternodeVote.choice === ChoiceEnum.LOCK || res.masternodeVote.towards_identity_identifier !== resource.contender.identifier))
              .length
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
        totalCountVotes: contestedResources.filter(resource => resource.document.data.label === 'xyz').length,
        totalCountLock: 3,
        totalCountAbstain: 3,
        totalCountTowardsIdentity: 4,
        status: 'finished',
        endTimestamp: new Date(contestedResources[0].block.timestamp.getTime() + CONTESTED_RESOURCE_VOTE_DEADLINE).toISOString(),
        finished: true,
        towardsIdentity: contestedResources.filter(resource => resource.document.data.label === 'xyz')[0].contender.identifier
      }

      assert.deepEqual(body, expectedResource)
    })

    it('should return votes for value', async () => {
      const { body } = await client.get(`/contestedResource/${resourceValue}/votes`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 10)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 10)
      assert.equal(body.pagination.page, 1)

      const expectedVotes = contestedResources
        .filter(vote => vote.masternodeVote.index_values === JSON.stringify((['dash', 'xyz'])))
        .sort((a, b) => a.masternodeVote.id - b.masternodeVote.id)
        .slice(0, 10)
        .map(({ block, masternodeVote, document }) => ({
          proTxHash: masternodeVote.pro_tx_hash,
          txHash: masternodeVote.state_transition_hash,
          voterIdentifier: masternodeVote.voter_identity_id,
          choice: masternodeVote.choice,
          timestamp: block.timestamp.toISOString(),
          towardsIdentity: masternodeVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: masternodeVote.document_type_name,
          documentIdentifier: masternodeVote.choice === 0 ? document.identifier : null,
          indexName: masternodeVote.index_name,
          indexValues: JSON.parse(masternodeVote.index_values),
          identityAliases: masternodeVote.choice === 0
            ? [
                {
                  alias: 'alias.dash',
                  contested: true,
                  documentId: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  status: 'ok',
                  timestamp: aliasTimestamp.toISOString()
                }
              ]
            : [],
          power: masternodeVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })

    it('should return votes for value by choice', async () => {
      const { body } = await client.get(`/contestedResource/${resourceValue}/votes?choice=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.resultSet.length, 3)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 3)
      assert.equal(body.pagination.page, 1)

      const expectedVotes = contestedResources
        .filter(resource => resource.document.data.label === 'xyz')
        .filter(vote => (vote.masternodeVote.choice === 2))
        .sort((a, b) => a.masternodeVote.id - b.masternodeVote.id)
        .slice(0, 10)
        .map(({ block, masternodeVote, document }) => ({
          proTxHash: masternodeVote.pro_tx_hash,
          txHash: masternodeVote.state_transition_hash,
          voterIdentifier: masternodeVote.voter_identity_id,
          choice: masternodeVote.choice,
          timestamp: block.timestamp.toISOString(),
          towardsIdentity: masternodeVote.towards_identity_identifier,
          dataContractIdentifier: dataContract.identifier,
          documentTypeName: masternodeVote.document_type_name,
          documentIdentifier: masternodeVote.choice === 0 ? document.identifier : null,
          indexName: masternodeVote.index_name,
          indexValues: JSON.parse(masternodeVote.index_values),
          identityAliases: [],
          power: masternodeVote.power
        }))

      assert.deepStrictEqual(body.resultSet, expectedVotes)
    })
  })

  describe('getContestedResources()', async () => {
    it('should return default set on contested resources', async () => {
      const { body } = await client.get('/contestedResources')

      const uniqueResources = contestedResources
        .sort((a, b) => a.block.height - b.block.height)
        .filter((item, pos, self) => self
          .findIndex((resource) => resource.document.data.label === self[pos].document.data.label) === pos
        )

      const expectedResources = uniqueResources
        .sort((a, b) => a.block.height - b.block.height)
        .slice(0, 10)
        .map((resource) => {
          const lock = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.LOCK).length
          const abstain = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.ABSTAIN).length
          const towards = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.TowardsIdentity).length
          return {
            contenders: null,
            indexName: resource.masternodeVote.index_name,
            resourceValue: JSON.parse(resource.masternodeVote.index_values),
            dataContractIdentifier: dataContract.identifier,
            prefundedVotingBalance: null,
            documentTypeName: resource.document.document_type_name,
            timestamp: resource.block.timestamp.toISOString(),
            totalGasUsed: null,
            totalVotesGasUsed: null,
            totalCountVotes: towards + abstain + lock,
            totalDocumentsGasUsed: null,
            totalCountLock: lock,
            totalCountAbstain: abstain,
            totalCountTowardsIdentity: towards,
            status: null,
            endTimestamp: new Date(resource.block.timestamp.getTime() + CONTESTED_RESOURCE_VOTE_DEADLINE).toISOString(),
            finished: true,
            towardsIdentity: null
          }
        })

      assert.deepEqual(body.resultSet, expectedResources)
    })

    it('should return default set on contested resources with desc order', async () => {
      const { body } = await client.get('/contestedResources?order=desc')

      const uniqueResources = contestedResources
        .sort((a, b) => b.block.height - a.block.height)
        .filter((item, pos, self) => self
          .findIndex((resource) => resource.document.data.label === self[pos].document.data.label) === pos
        )

      const expectedResources = uniqueResources
        .sort((a, b) => b.block.height - a.block.height)
        .slice(0, 10)
        .map((resource) => {
          const lock = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.LOCK).length
          const abstain = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.ABSTAIN).length
          const towards = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.TowardsIdentity).length
          return {
            contenders: null,
            indexName: resource.masternodeVote.index_name,
            resourceValue: JSON.parse(resource.masternodeVote.index_values),
            dataContractIdentifier: dataContract.identifier,
            prefundedVotingBalance: null,
            documentTypeName: resource.document.document_type_name,
            timestamp: resource.block.timestamp.toISOString(),
            totalGasUsed: null,
            totalVotesGasUsed: null,
            totalCountVotes: towards + abstain + lock,
            totalDocumentsGasUsed: null,
            totalCountLock: lock,
            totalCountAbstain: abstain,
            totalCountTowardsIdentity: towards,
            status: null,
            endTimestamp: new Date(resource.block.timestamp.getTime() + CONTESTED_RESOURCE_VOTE_DEADLINE).toISOString(),
            finished: true,
            towardsIdentity: null
          }
        })

      assert.deepEqual(body.resultSet, expectedResources)
    })

    it('should return default set on contested resources with desc order and custom page size', async () => {
      const { body } = await client.get('/contestedResources?order=desc&page=2&limit=5')

      const uniqueResources = contestedResources
        .sort((a, b) => b.block.height - a.block.height)
        .filter((item, pos, self) => self
          .findIndex((resource) => resource.document.data.label === self[pos].document.data.label) === pos
        )

      const expectedResources = uniqueResources
        .sort((a, b) => b.block.height - a.block.height)
        .slice(5, 10)
        .map((resource) => {
          const lock = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.LOCK).length
          const abstain = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.ABSTAIN).length
          const towards = contestedResources.filter(votedResource => resource.masternodeVote.index_values === votedResource.masternodeVote.index_values && votedResource.masternodeVote.choice === ChoiceEnum.TowardsIdentity).length
          return {
            contenders: null,
            indexName: resource.masternodeVote.index_name,
            resourceValue: JSON.parse(resource.masternodeVote.index_values),
            dataContractIdentifier: dataContract.identifier,
            prefundedVotingBalance: null,
            documentTypeName: resource.document.document_type_name,
            timestamp: resource.block.timestamp.toISOString(),
            totalGasUsed: null,
            totalVotesGasUsed: null,
            totalCountVotes: towards + abstain + lock,
            totalDocumentsGasUsed: null,
            totalCountLock: lock,
            totalCountAbstain: abstain,
            totalCountTowardsIdentity: towards,
            status: null,
            endTimestamp: new Date(resource.block.timestamp.getTime() + CONTESTED_RESOURCE_VOTE_DEADLINE).toISOString(),
            finished: true,
            towardsIdentity: null
          }
        })

      assert.deepEqual(body.resultSet, expectedResources)
    })
  })

  describe('get contested resources status', async () => {
    it('should return stats of contested resources', async () => {
      const { body } = await client.get('/contestedResources/stats')

      const expectedBody = {
        totalContestedResources: 40,
        totalPendingContestedResources: 0,
        totalVotesCount: 40,
        expiringContestedResource: null
      }

      assert.deepEqual(body, expectedBody)
    })

    it('should return status of contested resources with pending value', async () => {
      const block = await fixtures.block(knex, {
        timestamp: new Date(),
        height: 99
      })
      const contender = await fixtures.identity(knex, {
        block_height: block.height,
        block_hash: block.hash
      })
      const documentTransaction = await fixtures.transaction(knex, {
        block_height: block.height,
        block_hash: block.hash,
        type: 0,
        owner: contender.identifier,
        gas_used: 11
      })
      await fixtures.document(knex, {
        owner: contender.identifier,
        data_contract_id: dataContract.id,
        data: {
          label: 'xyy',
          records: {
            identity: '36LGwPSXef8q8wpdnx4EdDeVNuqCYNAE9boDu5bxytsm'
          },
          preorderSalt: 'r9uAaZjEz+lsPrpqt+rqGQ+qIxZS40Ci7wkV8cGI7k4=',
          subdomainRules: {
            allowSubdomains: false
          },
          normalizedLabel: 'xyy',
          parentDomainName: 'dash',
          normalizedParentDomainName: 'dash'
        },
        prefunded_voting_balance: {
          parentNameAndLabel: 20000000
        },
        state_transition_hash: documentTransaction.hash
      })

      const { body } = await client.get('/contestedResources/stats')

      const expectedBody = {
        totalContestedResources: 41,
        totalPendingContestedResources: 1,
        totalVotesCount: 40,
        expiringContestedResource: {
          contenders: null,
          indexName: null,
          resourceValue: ['dash', 'xyy'],
          dataContractIdentifier: null,
          prefundedVotingBalance: null,
          documentTypeName: null,
          timestamp: block.timestamp.toISOString(),
          totalGasUsed: null,
          totalVotesGasUsed: null,
          totalCountVotes: null,
          totalCountLock: 0,
          totalCountAbstain: 0,
          totalCountTowardsIdentity: 0,
          totalDocumentsGasUsed: null,
          status: null,
          endTimestamp: new Date(block.timestamp.getTime() + CONTESTED_RESOURCE_VOTE_DEADLINE).toISOString(),
          finished: false,
          towardsIdentity: null
        }
      }

      assert.deepEqual(body, expectedBody)
    })
  })
})
