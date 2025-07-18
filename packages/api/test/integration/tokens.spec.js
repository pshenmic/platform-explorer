const { describe, it, before, after, mock } = require('node:test')
const DAPI = require('../../src/DAPI')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')

describe('Tokens', () => {
  let app
  let client
  let knex

  let identity
  let block
  let dataContract
  let tokens

  before(async () => {
    tokens = []

    mock.method(DAPI.prototype, 'getTokenTotalSupply', async () => ({ totalSystemAmount: 1000, totalAggregatedAmountInUserAccounts: 1000 }))
    mock.method(DAPI.prototype, 'getDataContract', async () => ({
      tokens: {
        29: {
          description: null,
          baseSupply: 1000n,
          maxSupply: 1010n,
          conventions: {
            decimals: 1000
          },
          manualMintingRules: {
            authorizedToMakeChange: {
              getTakerType: () => 'NoOne'
            }
          },
          manualBurningRules: {
            authorizedToMakeChange: {
              getTakerType: () => 'NoOne'
            }
          },
          freezeRules: {
            authorizedToMakeChange: {
              getTakerType: () => 'NoOne'
            }
          },
          unfreezeRules: {
            authorizedToMakeChange: {
              getTakerType: () => 'NoOne'
            }
          },
          destroyFrozenFundsRules: {
            authorizedToMakeChange: {
              getTakerType: () => 'NoOne'
            }
          },
          emergencyActionRules: {
            authorizedToMakeChange: {
              getTakerType: () => 'NoOne'
            }
          },
          distributionRules: {
            perpetualDistribution: {
              distributionType: {
                getDistribution: () => ({
                  constructor: {
                    name: 'TimeBasedDistributionWASM'
                  }
                })
              }
            }
          },
          mainGroup: undefined
        }
      }
    }))

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    await fixtures.cleanup(knex)

    block = await fixtures.block(knex)

    identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

    dataContract = await fixtures.dataContract(knex, {
      owner: identity.identifier
    })

    for (let i = 0; i < 30; i++) {
      let stateTransition

      if (i > 10) {
        stateTransition = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          data: 'AAABB/ElAIxLgoxYzc+KXVe7+xw3ml3m11Rozv7zfz4qlh8BAAAAAAEBAAABAXGZ8faEBMhuz2DZy5Ou8xj6DysI5Z/9F2ve9DFU/95rAAEKd2l0aGRyYXdhbBYHEgtkZXNjcmlwdGlvbhKAV2l0aGRyYXdhbCBkb2N1bWVudCB0byB0cmFjayB1bmRlcmx5aW5nIHdpdGhkcmF3YWwgdHJhbnNhY3Rpb25zLiBXaXRoZHJhd2FscyBzaG91bGQgYmUgY3JlYXRlZCB3aXRoIElkZW50aXR5V2l0aGRyYXdhbFRyYW5zaXRpb24SF2NyZWF0aW9uUmVzdHJpY3Rpb25Nb2RlAwQSBHR5cGUSBm9iamVjdBIHaW5kaWNlcxUEFgMSBG5hbWUSDmlkZW50aXR5U3RhdHVzEgpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgZzdGF0dXMSA2FzYxYBEgokY3JlYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSDmlkZW50aXR5UmVjZW50Egpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MWARIGc3RhdHVzEgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSB3Bvb2xpbmcSCnByb3BlcnRpZXMVBBYBEgZzdGF0dXMSA2FzYxYBEgdwb29saW5nEgNhc2MWARIOY29yZUZlZVBlckJ5dGUSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSC3RyYW5zYWN0aW9uEgpwcm9wZXJ0aWVzFQIWARIGc3RhdHVzEgNhc2MWARIQdHJhbnNhY3Rpb25JbmRleBIDYXNjEgZ1bmlxdWUTABIKcHJvcGVydGllcxYHEhB0cmFuc2FjdGlvbkluZGV4FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEnlTZXF1ZW50aWFsIGluZGV4IG9mIGFzc2V0IHVubG9jayAod2l0aGRyYXdhbCkgdHJhbnNhY3Rpb24uIFBvcHVsYXRlZCB3aGVuIGEgd2l0aGRyYXdhbCBwb29sZWQgaW50byB3aXRoZHJhd2FsIHRyYW5zYWN0aW9uEgdtaW5pbXVtAwISCHBvc2l0aW9uAwASFXRyYW5zYWN0aW9uU2lnbkhlaWdodBYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhIvVGhlIENvcmUgaGVpZ2h0IG9uIHdoaWNoIHRyYW5zYWN0aW9uIHdhcyBzaWduZWQSB21pbmltdW0DAhIIcG9zaXRpb24DAhIGYW1vdW50FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEhpUaGUgYW1vdW50IHRvIGJlIHdpdGhkcmF3bhIHbWluaW11bQP7B9ASCHBvc2l0aW9uAwQSDmNvcmVGZWVQZXJCeXRlFgUSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uElBUaGlzIGlzIHRoZSBmZWUgdGhhdCB5b3UgYXJlIHdpbGxpbmcgdG8gc3BlbmQgZm9yIHRoaXMgdHJhbnNhY3Rpb24gaW4gRHVmZnMvQnl0ZRIHbWluaW11bQMCEgdtYXhpbXVtA/0AAAAB/////hIIcG9zaXRpb24DBhIHcG9vbGluZxYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhJOVGhpcyBpbmRpY2F0ZWQgdGhlIGxldmVsIGF0IHdoaWNoIFBsYXRmb3JtIHNob3VsZCB0cnkgdG8gcG9vbCB0aGlzIHRyYW5zYWN0aW9uEgRlbnVtFQMDAAMCAwQSCHBvc2l0aW9uAwgSDG91dHB1dFNjcmlwdBYFEgR0eXBlEgVhcnJheRIJYnl0ZUFycmF5EwESCG1pbkl0ZW1zAy4SCG1heEl0ZW1zAzISCHBvc2l0aW9uAwoSBnN0YXR1cxYEEgR0eXBlEgdpbnRlZ2VyEgRlbnVtFQUDAAMCAwQDBgMIEgtkZXNjcmlwdGlvbhJDMCAtIFBlbmRpbmcsIDEgLSBTaWduZWQsIDIgLSBCcm9hZGNhc3RlZCwgMyAtIENvbXBsZXRlLCA0IC0gRXhwaXJlZBIIcG9zaXRpb24DDBIUYWRkaXRpb25hbFByb3BlcnRpZXMTABIIcmVxdWlyZWQVBxIKJGNyZWF0ZWRBdBIKJHVwZGF0ZWRBdBIGYW1vdW50Eg5jb3JlRmVlUGVyQnl0ZRIHcG9vbGluZxIMb3V0cHV0U2NyaXB0EgZzdGF0dXMAAAAAAAAAAQAAAAECZW4AAQV0b2tlbgZ0b2tlbnMBAAAAAQEBAQAAAQEBAQEBAAAAAAABAQEAAAAAAAEBAQAAAAAAAQEBAQAAAAEBAQAAAAEBAQAAAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAABBG5vdGUAABIAAkEgb0tBVP6C6SuQ546sZq7bRYDt4+gShWY4ajVH4eKUwbYWblZRoVKYmQbfdoqy5wUIlOeBPMM43jYQ/BdmvOeiEQ==',
          type: 0,
          owner: identity.identifier
        })
      }

      const token = await fixtures.token(knex, {
        position: i,
        owner: identity.identifier,
        data_contract_id: dataContract.id,
        decimals: i,
        base_supply: (i + 1) * 1000,
        state_transition_hash: stateTransition?.hash
      })

      tokens.push({ token, stateTransition })
    }
  })

  after(async () => {
    await knex.destroy()
    await server.stop()
  })

  describe('getTokens()', () => {
    it('should return default tokens set', async () => {
      const { body } = await client.get('/tokens')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, tokens.length)

      const expectedTokens = tokens
        .sort((a, b) => a.id - b.id)
        .slice(0, 10)
        .map(({ token }) => ({
          identifier: token.identifier,
          localizations: token.localizations ?? null,
          baseSupply: token.base_supply.toString(),
          totalSupply: '1000',
          maxSupply: token.max_supply?.toString() ?? null,
          owner: token.owner,
          mintable: token.mintable,
          burnable: token.burnable,
          freezable: token.freezable,
          unfreezable: token.unfreezable,
          destroyable: token.destroyable,
          allowedEmergencyActions: token.allowed_emergency_actions,
          dataContractIdentifier: dataContract.identifier,
          mainGroup: null,
          position: null,
          description: null,
          changeMaxSupply: null,
          distributionType: null,
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalGasUsed: null,
          totalTransitionsCount: null
        }))

      assert.deepEqual(expectedTokens, body.resultSet)
    })

    it('should return tokens set with order desc', async () => {
      const { body } = await client.get('/tokens?order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, tokens.length)

      const expectedTokens = tokens
        .sort((a, b) => b.token.id - a.token.id)
        .slice(0, 10)
        .map(({ token }) => ({
          identifier: token.identifier,
          localizations: token.localizations ?? null,
          baseSupply: token.base_supply.toString(),
          totalSupply: '1000',
          maxSupply: token.max_supply?.toString() ?? null,
          owner: token.owner,
          mintable: token.mintable,
          burnable: token.burnable,
          freezable: token.freezable,
          unfreezable: token.unfreezable,
          destroyable: token.destroyable,
          allowedEmergencyActions: token.allowed_emergency_actions,
          dataContractIdentifier: dataContract.identifier,
          mainGroup: null,
          position: null,
          description: null,
          changeMaxSupply: null,
          distributionType: null,
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalGasUsed: null,
          totalTransitionsCount: null
        }))

      assert.deepEqual(expectedTokens, body.resultSet)
    })

    it('should return tokens set with order desc and custom limit', async () => {
      const { body } = await client.get('/tokens?order=desc&limit=3')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 3)
      assert.equal(body.pagination.total, tokens.length)

      const expectedTokens = tokens
        .sort((a, b) => b.token.id - a.token.id)
        .slice(0, 3)
        .map(({ token }) => ({
          identifier: token.identifier,
          localizations: token.localizations ?? null,
          baseSupply: token.base_supply.toString(),
          totalSupply: '1000',
          maxSupply: token.max_supply?.toString() ?? null,
          owner: token.owner,
          mintable: token.mintable,
          burnable: token.burnable,
          freezable: token.freezable,
          unfreezable: token.unfreezable,
          destroyable: token.destroyable,
          allowedEmergencyActions: token.allowed_emergency_actions,
          dataContractIdentifier: dataContract.identifier,
          mainGroup: null,
          position: null,
          description: null,
          changeMaxSupply: null,
          distributionType: null,
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalGasUsed: null,
          totalTransitionsCount: null
        }))

      assert.deepEqual(expectedTokens, body.resultSet)
    })

    it('should return tokens set with order desc and custom limit and pagination', async () => {
      const { body } = await client.get('/tokens?order=desc&limit=11&page=2')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 11)
      assert.equal(body.pagination.total, tokens.length)

      const expectedTokens = tokens
        .sort((a, b) => b.token.id - a.token.id)
        .slice(11, 22)
        .map(({ token }) => ({
          identifier: token.identifier,
          localizations: token.localizations ?? null,
          baseSupply: token.base_supply.toString(),
          totalSupply: '1000',
          maxSupply: token.max_supply?.toString() ?? null,
          owner: token.owner,
          mintable: token.mintable,
          burnable: token.burnable,
          freezable: token.freezable,
          unfreezable: token.unfreezable,
          destroyable: token.destroyable,
          allowedEmergencyActions: token.allowed_emergency_actions,
          dataContractIdentifier: dataContract.identifier,
          mainGroup: null,
          position: null,
          description: null,
          changeMaxSupply: null,
          distributionType: null,
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalGasUsed: null,
          totalTransitionsCount: null
        }))

      assert.deepEqual(expectedTokens, body.resultSet)
    })
  })

  describe('getTokenByIdentifier()', () => {
    it('should return token by id', async () => {
      const token = tokens[0]

      const { body } = await client.get(`/token/${token.token.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedToken = {
        identifier: token.token.identifier,
        position: 29,
        timestamp: block.timestamp.toISOString(),
        description: null,
        localizations: null,
        baseSupply: '1000',
        maxSupply: '1010',
        totalSupply: '1000',
        owner: token.token.owner,
        mintable: false,
        burnable: false,
        freezable: false,
        unfreezable: false,
        destroyable: false,
        allowedEmergencyActions: false,
        dataContractIdentifier: dataContract.identifier,
        changeMaxSupply: true,
        distributionType: 'TimeBasedDistribution',
        totalGasUsed: 0,
        mainGroup: null,
        totalTransitionsCount: 0,
        totalFreezeTransitionsCount: 0,
        totalBurnTransitionsCount: 0
      }

      assert.deepEqual(body, expectedToken)
    })

    it('should return 404 on not found', async () => {
      await client.get('/token//444444446WCPE4h1AFPQBJ4Rje6TfZw8kiBzkSAzvmCL')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })
})
