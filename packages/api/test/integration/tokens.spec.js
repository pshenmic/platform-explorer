const { describe, it, before, after, mock } = require('node:test')
const DAPI = require('../../src/DAPI')
const assert = require('node:assert').strict
const supertest = require('supertest')
const server = require('../../src/server')
const fixtures = require('../utils/fixtures')
const { getKnex } = require('../../src/utils')
const BatchEnum = require('../../src/enums/BatchEnum')

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

    mock.method(DAPI.prototype, 'getTokenTotalSupply', async () => ({
      totalSystemAmount: 1000,
      totalAggregatedAmountInUserAccounts: 1000
    }))
    mock.method(DAPI.prototype, 'getDataContract', async () => ({
      tokens: {
        29: {
          description: null,
          baseSupply: 1000n,
          maxSupply: 1010n,
          conventions: {
            decimals: 1000,
            localizations: {
              en: {
                pluralForm: 'tests',
                singularForm: 'test',
                shouldCapitalize: true
              }
            }
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
                    name: 'BlockBasedDistributionWASM'
                  },
                  interval: 100n,
                  function: {
                    getFunctionName: () => 'FixedAmount',
                    getFunctionValue: () => ({
                      amount: 100n
                    })
                  }
                })
              },
              distributionRecipient: {
                getType: () => 'ContractOwner',
                getValue: () => undefined
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
      let tokenTransition

      const stateTransition = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        data: 'AAABB/ElAIxLgoxYzc+KXVe7+xw3ml3m11Rozv7zfz4qlh8BAAAAAAEBAAABAXGZ8faEBMhuz2DZy5Ou8xj6DysI5Z/9F2ve9DFU/95rAAEKd2l0aGRyYXdhbBYHEgtkZXNjcmlwdGlvbhKAV2l0aGRyYXdhbCBkb2N1bWVudCB0byB0cmFjayB1bmRlcmx5aW5nIHdpdGhkcmF3YWwgdHJhbnNhY3Rpb25zLiBXaXRoZHJhd2FscyBzaG91bGQgYmUgY3JlYXRlZCB3aXRoIElkZW50aXR5V2l0aGRyYXdhbFRyYW5zaXRpb24SF2NyZWF0aW9uUmVzdHJpY3Rpb25Nb2RlAwQSBHR5cGUSBm9iamVjdBIHaW5kaWNlcxUEFgMSBG5hbWUSDmlkZW50aXR5U3RhdHVzEgpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgZzdGF0dXMSA2FzYxYBEgokY3JlYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSDmlkZW50aXR5UmVjZW50Egpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MWARIGc3RhdHVzEgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSB3Bvb2xpbmcSCnByb3BlcnRpZXMVBBYBEgZzdGF0dXMSA2FzYxYBEgdwb29saW5nEgNhc2MWARIOY29yZUZlZVBlckJ5dGUSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSC3RyYW5zYWN0aW9uEgpwcm9wZXJ0aWVzFQIWARIGc3RhdHVzEgNhc2MWARIQdHJhbnNhY3Rpb25JbmRleBIDYXNjEgZ1bmlxdWUTABIKcHJvcGVydGllcxYHEhB0cmFuc2FjdGlvbkluZGV4FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEnlTZXF1ZW50aWFsIGluZGV4IG9mIGFzc2V0IHVubG9jayAod2l0aGRyYXdhbCkgdHJhbnNhY3Rpb24uIFBvcHVsYXRlZCB3aGVuIGEgd2l0aGRyYXdhbCBwb29sZWQgaW50byB3aXRoZHJhd2FsIHRyYW5zYWN0aW9uEgdtaW5pbXVtAwISCHBvc2l0aW9uAwASFXRyYW5zYWN0aW9uU2lnbkhlaWdodBYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhIvVGhlIENvcmUgaGVpZ2h0IG9uIHdoaWNoIHRyYW5zYWN0aW9uIHdhcyBzaWduZWQSB21pbmltdW0DAhIIcG9zaXRpb24DAhIGYW1vdW50FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEhpUaGUgYW1vdW50IHRvIGJlIHdpdGhkcmF3bhIHbWluaW11bQP7B9ASCHBvc2l0aW9uAwQSDmNvcmVGZWVQZXJCeXRlFgUSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uElBUaGlzIGlzIHRoZSBmZWUgdGhhdCB5b3UgYXJlIHdpbGxpbmcgdG8gc3BlbmQgZm9yIHRoaXMgdHJhbnNhY3Rpb24gaW4gRHVmZnMvQnl0ZRIHbWluaW11bQMCEgdtYXhpbXVtA/0AAAAB/////hIIcG9zaXRpb24DBhIHcG9vbGluZxYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhJOVGhpcyBpbmRpY2F0ZWQgdGhlIGxldmVsIGF0IHdoaWNoIFBsYXRmb3JtIHNob3VsZCB0cnkgdG8gcG9vbCB0aGlzIHRyYW5zYWN0aW9uEgRlbnVtFQMDAAMCAwQSCHBvc2l0aW9uAwgSDG91dHB1dFNjcmlwdBYFEgR0eXBlEgVhcnJheRIJYnl0ZUFycmF5EwESCG1pbkl0ZW1zAy4SCG1heEl0ZW1zAzISCHBvc2l0aW9uAwoSBnN0YXR1cxYEEgR0eXBlEgdpbnRlZ2VyEgRlbnVtFQUDAAMCAwQDBgMIEgtkZXNjcmlwdGlvbhJDMCAtIFBlbmRpbmcsIDEgLSBTaWduZWQsIDIgLSBCcm9hZGNhc3RlZCwgMyAtIENvbXBsZXRlLCA0IC0gRXhwaXJlZBIIcG9zaXRpb24DDBIUYWRkaXRpb25hbFByb3BlcnRpZXMTABIIcmVxdWlyZWQVBxIKJGNyZWF0ZWRBdBIKJHVwZGF0ZWRBdBIGYW1vdW50Eg5jb3JlRmVlUGVyQnl0ZRIHcG9vbGluZxIMb3V0cHV0U2NyaXB0EgZzdGF0dXMAAAAAAAAAAQAAAAECZW4AAQV0b2tlbgZ0b2tlbnMBAAAAAQEBAQAAAQEBAQEBAAAAAAABAQEAAAAAAAEBAQAAAAAAAQEBAQAAAAEBAQAAAAEBAQAAAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAABBG5vdGUAABIAAkEgb0tBVP6C6SuQ546sZq7bRYDt4+gShWY4ajVH4eKUwbYWblZRoVKYmQbfdoqy5wUIlOeBPMM43jYQ/BdmvOeiEQ==',
        type: 0,
        gas_used: 1111,
        owner: identity.identifier
      })

      const token = await fixtures.token(knex, {
        position: 29,
        owner: identity.identifier,
        data_contract_id: dataContract.id,
        decimals: i,
        base_supply: (i + 1) * 1000,
        state_transition_hash: stateTransition?.hash
      })

      if (i > 15) {
        tokenTransition = await fixtures.tokeTransition(knex, {
          token_identifier: token.identifier,
          owner: identity.identifier,
          action: 8,
          state_transition_hash: stateTransition?.hash,
          token_contract_position: token.position,
          data_contract_id: dataContract.id
        })
      }

      tokens.push({ token, stateTransition, tokenTransition })
    }

    for (let i = 0; i < 5; i++) {
      const stateTransition = await fixtures.transaction(knex, {
        block_hash: block.hash,
        block_height: block.height,
        data:
          i % 2 === 0
            ? 'AgG5BZwAg32+HPkczu8vW/+JvgoxqyypH+IC1KWlLtXX+AEBCgAACwDzGOdLDmuMO+LzhxqoUD27hy0iOXXmTgtqUBfkbuocK1qATLyeQ7SGhaPaequ9LTc28gNTVAJVI/372kNoKvmPAAEBBAH9AAABF2WS4AAC/QAAAEXZZLgACv0AAABJG9vEAPwF9eEA/QAAAAJUC+QAAAABQR8uWDXdK0f/ZYsZPfKK3JTUJqEZs1zMPY6OVbzRQ2nDoyggK6X0sUpl3fOkf0v1sAyYDKiDp0LLyqJECrIPg4VS'
            : 'AgH0Z0dWPzi+nB/g9cz0JvDSstQcBxUflSKbAKmE+PjyJAEBCgAAAgAJZIbY2wo/Shtxo0mIuagf9Ro+X89oUbKos8GVbeY0uFYAWtls/LUGnuwod79+fX4OQgW8rj/Az8rO4twC5kZnAAEACgABBUEfVJP/Rc/YDMRnDXAlU1bDHHGmBIWjCyx3LfnMSeaMZLokSZt6hRsN7cxVL6O9t5n2PoXZ46VYnUXSeeNkNJuzLg==',
        type: 0,
        gas_used: 1111,
        owner: identity.identifier
      })

      const token = await fixtures.token(knex, {
        position: 29,
        owner: identity.identifier,
        data_contract_id: dataContract.id,
        decimals: i,
        base_supply: (i + 1) * 1000,
        state_transition_hash: stateTransition?.hash
      })

      const tokenTransition = await fixtures.tokeTransition(knex, {
        token_identifier: token.identifier,
        owner: identity.identifier,
        action: 10,
        state_transition_hash: stateTransition?.hash,
        token_contract_position: token.position,
        data_contract_id: dataContract.id
      })

      tokens.push({ token, stateTransition, tokenTransition })
    }

    mock.method(DAPI.prototype, 'getIdentityTokenBalances', async () => null)
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
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalGasUsed: null,
          totalTransitionsCount: null,
          decimals: null,
          perpetualDistribution: null,
          preProgrammedDistribution: null,
          prices: null,
          price: null
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
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalGasUsed: null,
          decimals: null,
          totalTransitionsCount: null,
          perpetualDistribution: null,
          preProgrammedDistribution: null,
          prices: null,
          price: null
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
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalGasUsed: null,
          decimals: null,
          totalTransitionsCount: null,
          perpetualDistribution: null,
          preProgrammedDistribution: null,
          prices: null,
          price: null
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
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalGasUsed: null,
          decimals: null,
          totalTransitionsCount: null,
          perpetualDistribution: null,
          preProgrammedDistribution: null,
          prices: null,
          price: null
        }))

      assert.deepEqual(expectedTokens, body.resultSet)
    })
  })

  describe('getTokenByIdentifier()', () => {
    it('should return token by id', async () => {
      const token = tokens[29]

      const { body } = await client.get(`/token/${token.token.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedToken = {
        localizations: {
          en: {
            pluralForm: 'tests',
            singularForm: 'test',
            shouldCapitalize: true
          }
        },
        identifier: token.token.identifier,
        position: 29,
        timestamp: block.timestamp.toISOString(),
        description: null,
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
        totalGasUsed: 0,
        mainGroup: null,
        totalTransitionsCount: 0,
        decimals: 1000,
        totalFreezeTransitionsCount: 0,
        totalBurnTransitionsCount: 0,
        preProgrammedDistribution: null,
        perpetualDistribution: {
          functionName: 'FixedAmount',
          functionValue: {
            amount: '100'
          },
          interval: 100,
          recipientType: 'ContractOwner',
          recipientValue: null,
          type: 'BlockBasedDistribution'
        },
        price: null,
        prices: null
      }

      assert.deepEqual(body, expectedToken)
    })

    it('should return token by id with single price', async () => {
      const [, token] = tokens

      const { body } = await client.get(`/token/${token.token.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedToken = {
        localizations: {
          en: {
            pluralForm: 'tests',
            singularForm: 'test',
            shouldCapitalize: true
          }
        },
        identifier: token.token.identifier,
        position: 29,
        timestamp: block.timestamp.toISOString(),
        description: null,
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
        totalGasUsed: 1111,
        mainGroup: null,
        totalTransitionsCount: 1,
        decimals: 1000,
        totalFreezeTransitionsCount: 0,
        totalBurnTransitionsCount: 0,
        price: '10',
        prices: null
      }

      assert.deepEqual(body, expectedToken)
    })

    it('should return token by id with multi price', async () => {
      const [token] = tokens

      const { body } = await client.get(`/token/${token.token.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedToken = {
        localizations: {
          en: {
            pluralForm: 'tests',
            singularForm: 'test',
            shouldCapitalize: true
          }
        },
        identifier: token.token.identifier,
        position: 29,
        timestamp: block.timestamp.toISOString(),
        description: null,
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
        totalGasUsed: 1111,
        mainGroup: null,
        totalTransitionsCount: 1,
        decimals: 1000,
        totalFreezeTransitionsCount: 0,
        totalBurnTransitionsCount: 0,
        price: null,
        prices: [
          {
            amount: '1',
            price: '1200000000000'
          },
          {
            amount: '2',
            price: '300000000000'
          },
          {
            amount: '10',
            price: '314000000000'
          },
          {
            amount: '100000000',
            price: '10000000000'
          }
        ]
      }

      assert.deepEqual(body, expectedToken)
    })

    it('should return token by id with transition', async () => {
      const [token] = tokens

      const { body } = await client.get(`/token/${token.token.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedToken = {
        localizations: {
          en: {
            pluralForm: 'tests',
            singularForm: 'test',
            shouldCapitalize: true
          }
        },
        identifier: token.token.identifier,
        position: 29,
        timestamp: block.timestamp.toISOString(),
        description: null,
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
        totalGasUsed: 1111,
        mainGroup: null,
        totalTransitionsCount: 1,
        decimals: 1000,
        totalFreezeTransitionsCount: 0,
        totalBurnTransitionsCount: 0,
        preProgrammedDistribution: null,
        perpetualDistribution: {
          functionName: 'FixedAmount',
          functionValue: {
            amount: '100'
          },
          interval: 100,
          recipientType: 'ContractOwner',
          recipientValue: null,
          type: 'BlockBasedDistribution'
        },
        price: null,
        prices: null
      }

      assert.deepEqual(body, expectedToken)
    })

    it('should return token by id with transition and pre programmed distribution', async () => {
      mock.method(DAPI.prototype, 'getDataContract', async () => ({
        tokens: {
          29: {
            description: null,
            baseSupply: 1000n,
            maxSupply: 1010n,
            conventions: {
              decimals: 1000,
              localizations: {
                en: {
                  pluralForm: 'tests',
                  singularForm: 'test',
                  shouldCapitalize: true
                }
              }
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
              preProgrammedDistribution: {
                distributions: {
                  1752571480493: {
                    AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW: 1n
                  },
                  1752571110493: {
                    AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW: 10n
                  }
                }
              }
            },
            mainGroup: undefined
          }
        }
      }))

      const [token] = tokens

      const { body } = await client.get(`/token/${token.token.identifier}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedToken = {
        localizations: {
          en: {
            pluralForm: 'tests',
            singularForm: 'test',
            shouldCapitalize: true
          }
        },
        identifier: token.token.identifier,
        position: 29,
        timestamp: block.timestamp.toISOString(),
        description: null,
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
        totalGasUsed: 1111,
        mainGroup: null,
        totalTransitionsCount: 1,
        decimals: 1000,
        totalFreezeTransitionsCount: 0,
        totalBurnTransitionsCount: 0,
        perpetualDistribution: null,
        preProgrammedDistribution: [
          {
            out: [
              {
                identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                tokenAmount: '1'
              }
            ],
            timestamp: '2025-07-15T09:24:40.493Z'
          },
          {
            out: [
              {
                identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                tokenAmount: '10'
              }
            ],
            timestamp: '2025-07-15T09:18:30.493Z'
          }
        ],
        price: null,
        prices: [
          {
            amount: '1',
            price: '1200000000000'
          },
          {
            amount: '2',
            price: '300000000000'
          },
          {
            amount: '10',
            price: '314000000000'
          },
          {
            amount: '100000000',
            price: '10000000000'
          }
        ]
      }

      assert.deepEqual(body, expectedToken)
    })

    it('should return 404 on not found', async () => {
      await client.get('/token/444444446WCPE4h1AFPQBJ4Rje6TfZw8kiBzkSAzvmCL')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
    })
  })

  describe('getTokenTransitions()', () => {
    let token
    let tokenTransitions

    before(async () => {
      token = tokens[0].token
      tokenTransitions = [{
        tokenTransition: tokens[0].tokenTransition,
        stateTransition: tokens[0].stateTransition
      }]

      for (let i = 0; i < 15; i++) {
        const stateTransition = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          data: 'AAABB/ElAIxLgoxYzc+KXVe7+xw3ml3m11Rozv7zfz4qlh8BAAAAAAEBAAABAXGZ8faEBMhuz2DZy5Ou8xj6DysI5Z/9F2ve9DFU/95rAAEKd2l0aGRyYXdhbBYHEgtkZXNjcmlwdGlvbhKAV2l0aGRyYXdhbCBkb2N1bWVudCB0byB0cmFjayB1bmRlcmx5aW5nIHdpdGhkcmF3YWwgdHJhbnNhY3Rpb25zLiBXaXRoZHJhd2FscyBzaG91bGQgYmUgY3JlYXRlZCB3aXRoIElkZW50aXR5V2l0aGRyYXdhbFRyYW5zaXRpb24SF2NyZWF0aW9uUmVzdHJpY3Rpb25Nb2RlAwQSBHR5cGUSBm9iamVjdBIHaW5kaWNlcxUEFgMSBG5hbWUSDmlkZW50aXR5U3RhdHVzEgpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgZzdGF0dXMSA2FzYxYBEgokY3JlYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSDmlkZW50aXR5UmVjZW50Egpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MWARIGc3RhdHVzEgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSB3Bvb2xpbmcSCnByb3BlcnRpZXMVBBYBEgZzdGF0dXMSA2FzYxYBEgdwb29saW5nEgNhc2MWARIOY29yZUZlZVBlckJ5dGUSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSC3RyYW5zYWN0aW9uEgpwcm9wZXJ0aWVzFQIWARIGc3RhdHVzEgNhc2MWARIQdHJhbnNhY3Rpb25JbmRleBIDYXNjEgZ1bmlxdWUTABIKcHJvcGVydGllcxYHEhB0cmFuc2FjdGlvbkluZGV4FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEnlTZXF1ZW50aWFsIGluZGV4IG9mIGFzc2V0IHVubG9jayAod2l0aGRyYXdhbCkgdHJhbnNhY3Rpb24uIFBvcHVsYXRlZCB3aGVuIGEgd2l0aGRyYXdhbCBwb29sZWQgaW50byB3aXRoZHJhd2FsIHRyYW5zYWN0aW9uEgdtaW5pbXVtAwISCHBvc2l0aW9uAwASFXRyYW5zYWN0aW9uU2lnbkhlaWdodBYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhIvVGhlIENvcmUgaGVpZ2h0IG9uIHdoaWNoIHRyYW5zYWN0aW9uIHdhcyBzaWduZWQSB21pbmltdW0DAhIIcG9zaXRpb24DAhIGYW1vdW50FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEhpUaGUgYW1vdW50IHRvIGJlIHdpdGhkcmF3bhIHbWluaW11bQP7B9ASCHBvc2l0aW9uAwQSDmNvcmVGZWVQZXJCeXRlFgUSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uElBUaGlzIGlzIHRoZSBmZWUgdGhhdCB5b3UgYXJlIHdpbGxpbmcgdG8gc3BlbmQgZm9yIHRoaXMgdHJhbnNhY3Rpb24gaW4gRHVmZnMvQnl0ZRIHbWluaW11bQMCEgdtYXhpbXVtA/0AAAAB/////hIIcG9zaXRpb24DBhIHcG9vbGluZxYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhJOVGhpcyBpbmRpY2F0ZWQgdGhlIGxldmVsIGF0IHdoaWNoIFBsYXRmb3JtIHNob3VsZCB0cnkgdG8gcG9vbCB0aGlzIHRyYW5zYWN0aW9uEgRlbnVtFQMDAAMCAwQSCHBvc2l0aW9uAwgSDG91dHB1dFNjcmlwdBYFEgR0eXBlEgVhcnJheRIJYnl0ZUFycmF5EwESCG1pbkl0ZW1zAy4SCG1heEl0ZW1zAzISCHBvc2l0aW9uAwoSBnN0YXR1cxYEEgR0eXBlEgdpbnRlZ2VyEgRlbnVtFQUDAAMCAwQDBgMIEgtkZXNjcmlwdGlvbhJDMCAtIFBlbmRpbmcsIDEgLSBTaWduZWQsIDIgLSBCcm9hZGNhc3RlZCwgMyAtIENvbXBsZXRlLCA0IC0gRXhwaXJlZBIIcG9zaXRpb24DDBIUYWRkaXRpb25hbFByb3BlcnRpZXMTABIIcmVxdWlyZWQVBxIKJGNyZWF0ZWRBdBIKJHVwZGF0ZWRBdBIGYW1vdW50Eg5jb3JlRmVlUGVyQnl0ZRIHcG9vbGluZxIMb3V0cHV0U2NyaXB0EgZzdGF0dXMAAAAAAAAAAQAAAAECZW4AAQV0b2tlbgZ0b2tlbnMBAAAAAQEBAQAAAQEBAQEBAAAAAAABAQEAAAAAAAEBAQAAAAAAAQEBAQAAAAEBAQAAAAEBAQAAAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAABBG5vdGUAABIAAkEgb0tBVP6C6SuQ546sZq7bRYDt4+gShWY4ajVH4eKUwbYWblZRoVKYmQbfdoqy5wUIlOeBPMM43jYQ/BdmvOeiEQ==',
          type: 0,
          gas_used: 1111,
          owner: identity.identifier
        })

        const tokenTransition = await fixtures.tokeTransition(knex, {
          token_identifier: token.identifier,
          owner: identity.identifier,
          action: i % 2 === 0 ? 9 : 6,
          amount: i * 100,
          state_transition_hash: stateTransition?.hash,
          token_contract_position: token.position,
          data_contract_id: dataContract.id
        })

        tokenTransitions.push({ tokenTransition, stateTransition })
      }
    })

    it('should allow to get default token transitions list', async () => {
      const { body } = await client.get(`/token/${token.identifier}/transitions`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedTransitions =
        tokenTransitions
          .slice(0, 10)
          .map(({ tokenTransition }) => ({
            amount: tokenTransition.amount ?? 0,
            recipient: tokenTransition.recipient,
            owner: tokenTransition.owner,
            action: BatchEnum[tokenTransition.action + 6],
            stateTransitionHash: tokenTransition.state_transition_hash,
            timestamp: block.timestamp.toISOString(),
            publicNote: null
          }))

      assert.deepEqual(body.resultSet, expectedTransitions)
    })

    it('should allow to get default token transitions list with order desc', async () => {
      const { body } = await client.get(`/token/${token.identifier}/transitions?order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedTransitions =
        tokenTransitions
          .sort((a, b) => b.tokenTransition.id - a.tokenTransition.id)
          .slice(0, 10)
          .map(({ tokenTransition }) => ({
            amount: tokenTransition.amount ?? 0,
            recipient: tokenTransition.recipient,
            owner: tokenTransition.owner,
            action: BatchEnum[tokenTransition.action + 6],
            stateTransitionHash: tokenTransition.state_transition_hash,
            timestamp: block.timestamp.toISOString(),
            publicNote: null
          }))

      assert.deepEqual(body.resultSet, expectedTransitions)
    })

    it('should allow to get default token transitions list with order desc and custom limit', async () => {
      const { body } = await client.get(`/token/${token.identifier}/transitions?order=desc&limit=7`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedTransitions =
        tokenTransitions
          .sort((a, b) => b.tokenTransition.id - a.tokenTransition.id)
          .slice(0, 7)
          .map(({ tokenTransition }) => ({
            amount: tokenTransition.amount ?? 0,
            recipient: tokenTransition.recipient,
            owner: tokenTransition.owner,
            action: BatchEnum[tokenTransition.action + 6],
            stateTransitionHash: tokenTransition.state_transition_hash,
            timestamp: block.timestamp.toISOString(),
            publicNote: null
          }))

      assert.deepEqual(body.resultSet, expectedTransitions)
    })

    it('should allow to get default token transitions list with order desc and custom limit and custom page', async () => {
      const { body } = await client.get(`/token/${token.identifier}/transitions?order=desc&limit=7&page=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      const expectedTransitions =
        tokenTransitions
          .sort((a, b) => b.tokenTransition.id - a.tokenTransition.id)
          .slice(7, 14)
          .map(({ tokenTransition }) => ({
            amount: tokenTransition.amount ?? 0,
            recipient: tokenTransition.recipient,
            owner: tokenTransition.owner,
            action: BatchEnum[tokenTransition.action + 6],
            stateTransitionHash: tokenTransition.state_transition_hash,
            timestamp: block.timestamp.toISOString(),
            publicNote: null
          }))

      assert.deepEqual(body.resultSet, expectedTransitions)
    })
  })

  describe('getTokensByIdentity()', () => {
    let dataContracts

    before(async () => {
      dataContracts = []

      await fixtures.cleanup(knex)

      block = await fixtures.block(knex)

      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      for (let i = 0; i < 30; i++) {
        const stateTransition = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          data: 'AAABB/ElAIxLgoxYzc+KXVe7+xw3ml3m11Rozv7zfz4qlh8BAAAAAAEBAAABAXGZ8faEBMhuz2DZy5Ou8xj6DysI5Z/9F2ve9DFU/95rAAEKd2l0aGRyYXdhbBYHEgtkZXNjcmlwdGlvbhKAV2l0aGRyYXdhbCBkb2N1bWVudCB0byB0cmFjayB1bmRlcmx5aW5nIHdpdGhkcmF3YWwgdHJhbnNhY3Rpb25zLiBXaXRoZHJhd2FscyBzaG91bGQgYmUgY3JlYXRlZCB3aXRoIElkZW50aXR5V2l0aGRyYXdhbFRyYW5zaXRpb24SF2NyZWF0aW9uUmVzdHJpY3Rpb25Nb2RlAwQSBHR5cGUSBm9iamVjdBIHaW5kaWNlcxUEFgMSBG5hbWUSDmlkZW50aXR5U3RhdHVzEgpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgZzdGF0dXMSA2FzYxYBEgokY3JlYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSDmlkZW50aXR5UmVjZW50Egpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MWARIGc3RhdHVzEgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSB3Bvb2xpbmcSCnByb3BlcnRpZXMVBBYBEgZzdGF0dXMSA2FzYxYBEgdwb29saW5nEgNhc2MWARIOY29yZUZlZVBlckJ5dGUSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSC3RyYW5zYWN0aW9uEgpwcm9wZXJ0aWVzFQIWARIGc3RhdHVzEgNhc2MWARIQdHJhbnNhY3Rpb25JbmRleBIDYXNjEgZ1bmlxdWUTABIKcHJvcGVydGllcxYHEhB0cmFuc2FjdGlvbkluZGV4FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEnlTZXF1ZW50aWFsIGluZGV4IG9mIGFzc2V0IHVubG9jayAod2l0aGRyYXdhbCkgdHJhbnNhY3Rpb24uIFBvcHVsYXRlZCB3aGVuIGEgd2l0aGRyYXdhbCBwb29sZWQgaW50byB3aXRoZHJhd2FsIHRyYW5zYWN0aW9uEgdtaW5pbXVtAwISCHBvc2l0aW9uAwASFXRyYW5zYWN0aW9uU2lnbkhlaWdodBYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhIvVGhlIENvcmUgaGVpZ2h0IG9uIHdoaWNoIHRyYW5zYWN0aW9uIHdhcyBzaWduZWQSB21pbmltdW0DAhIIcG9zaXRpb24DAhIGYW1vdW50FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEhpUaGUgYW1vdW50IHRvIGJlIHdpdGhkcmF3bhIHbWluaW11bQP7B9ASCHBvc2l0aW9uAwQSDmNvcmVGZWVQZXJCeXRlFgUSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uElBUaGlzIGlzIHRoZSBmZWUgdGhhdCB5b3UgYXJlIHdpbGxpbmcgdG8gc3BlbmQgZm9yIHRoaXMgdHJhbnNhY3Rpb24gaW4gRHVmZnMvQnl0ZRIHbWluaW11bQMCEgdtYXhpbXVtA/0AAAAB/////hIIcG9zaXRpb24DBhIHcG9vbGluZxYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhJOVGhpcyBpbmRpY2F0ZWQgdGhlIGxldmVsIGF0IHdoaWNoIFBsYXRmb3JtIHNob3VsZCB0cnkgdG8gcG9vbCB0aGlzIHRyYW5zYWN0aW9uEgRlbnVtFQMDAAMCAwQSCHBvc2l0aW9uAwgSDG91dHB1dFNjcmlwdBYFEgR0eXBlEgVhcnJheRIJYnl0ZUFycmF5EwESCG1pbkl0ZW1zAy4SCG1heEl0ZW1zAzISCHBvc2l0aW9uAwoSBnN0YXR1cxYEEgR0eXBlEgdpbnRlZ2VyEgRlbnVtFQUDAAMCAwQDBgMIEgtkZXNjcmlwdGlvbhJDMCAtIFBlbmRpbmcsIDEgLSBTaWduZWQsIDIgLSBCcm9hZGNhc3RlZCwgMyAtIENvbXBsZXRlLCA0IC0gRXhwaXJlZBIIcG9zaXRpb24DDBIUYWRkaXRpb25hbFByb3BlcnRpZXMTABIIcmVxdWlyZWQVBxIKJGNyZWF0ZWRBdBIKJHVwZGF0ZWRBdBIGYW1vdW50Eg5jb3JlRmVlUGVyQnl0ZRIHcG9vbGluZxIMb3V0cHV0U2NyaXB0EgZzdGF0dXMAAAAAAAAAAQAAAAECZW4AAQV0b2tlbgZ0b2tlbnMBAAAAAQEBAQAAAQEBAQEBAAAAAAABAQEAAAAAAAEBAQAAAAAAAQEBAQAAAAEBAQAAAAEBAQAAAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAABBG5vdGUAABIAAkEgb0tBVP6C6SuQ546sZq7bRYDt4+gShWY4ajVH4eKUwbYWblZRoVKYmQbfdoqy5wUIlOeBPMM43jYQ/BdmvOeiEQ==',
          type: 0,
          gas_used: 1111,
          owner: identity.identifier
        })

        const dataContract = await fixtures.dataContract(knex, {
          owner: identity.identifier
        })

        const token = await fixtures.token(knex, {
          position: 29,
          owner: identity.identifier,
          data_contract_id: dataContract.id,
          decimals: i,
          base_supply: (i + 1) * 1000,
          state_transition_hash: stateTransition?.hash
        })

        dataContracts.push({ dataContract, token })
      }
    })

    it('should allow to get default list of tokens for identity', async () => {
      const { body } = await client.get(`/identity/${identity.identifier}/tokens`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, 30)

      const expectedTokens = dataContracts
        .sort((a, b) => a.token.id - b.token.id)
        .slice(0, 10)
        .map(({ token, dataContract }) => ({
          identifier: token.identifier,
          position: 29,
          description: null,
          localizations: {
            en: {
              pluralForm: 'tests',
              shouldCapitalize: true,
              singularForm: 'test'
            }
          },
          baseSupply: '1000',
          maxSupply: '1010',
          totalSupply: '1000',
          owner: token.owner,
          mintable: false,
          burnable: false,
          freezable: false,
          unfreezable: false,
          destroyable: false,
          allowedEmergencyActions: false,
          dataContractIdentifier: dataContract.identifier,
          changeMaxSupply: true,
          mainGroup: null,
          decimals: 1000,
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalTransitionsCount: null,
          totalGasUsed: null,
          balance: null,
          perpetualDistribution: null,
          preProgrammedDistribution: [
            {
              out: [
                {
                  identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  tokenAmount: '1'
                }
              ],
              timestamp: '2025-07-15T09:24:40.493Z'
            },
            {
              out: [
                {
                  identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  tokenAmount: '10'
                }
              ],
              timestamp: '2025-07-15T09:18:30.493Z'
            }
          ],
          prices: null,
          price: null
        }))

      assert.deepEqual(body.resultSet, expectedTokens)
    })

    it('should allow to get list of tokens for identity with custom limit', async () => {
      const { body } = await client.get(`/identity/${identity.identifier}/tokens?limit=5`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 5)
      assert.equal(body.pagination.total, 30)

      const expectedTokens = dataContracts
        .sort((a, b) => a.token.id - b.token.id)
        .slice(0, 5)
        .map(({ token, dataContract }) => ({
          identifier: token.identifier,
          position: 29,
          description: null,
          localizations: {
            en: {
              pluralForm: 'tests',
              shouldCapitalize: true,
              singularForm: 'test'
            }
          },
          baseSupply: '1000',
          maxSupply: '1010',
          totalSupply: '1000',
          owner: token.owner,
          mintable: false,
          burnable: false,
          freezable: false,
          unfreezable: false,
          destroyable: false,
          allowedEmergencyActions: false,
          dataContractIdentifier: dataContract.identifier,
          changeMaxSupply: true,
          mainGroup: null,
          decimals: 1000,
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalTransitionsCount: null,
          totalGasUsed: null,
          balance: null,
          perpetualDistribution: null,
          preProgrammedDistribution: [
            {
              out: [
                {
                  identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  tokenAmount: '1'
                }
              ],
              timestamp: '2025-07-15T09:24:40.493Z'
            },
            {
              out: [
                {
                  identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  tokenAmount: '10'
                }
              ],
              timestamp: '2025-07-15T09:18:30.493Z'
            }
          ],
          prices: null,
          price: null
        }))

      assert.deepEqual(body.resultSet, expectedTokens)
    })

    it('should allow to get list of tokens for identity with custom limit and order desc', async () => {
      const { body } = await client.get(`/identity/${identity.identifier}/tokens?limit=5&order=desc`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 5)
      assert.equal(body.pagination.total, 30)

      const expectedTokens = dataContracts
        .sort((a, b) => b.token.id - a.token.id)
        .slice(0, 5)
        .map(({ token, dataContract }) => ({
          identifier: token.identifier,
          position: 29,
          description: null,
          localizations: {
            en: {
              pluralForm: 'tests',
              shouldCapitalize: true,
              singularForm: 'test'
            }
          },
          baseSupply: '1000',
          maxSupply: '1010',
          totalSupply: '1000',
          owner: token.owner,
          mintable: false,
          burnable: false,
          freezable: false,
          unfreezable: false,
          destroyable: false,
          allowedEmergencyActions: false,
          dataContractIdentifier: dataContract.identifier,
          changeMaxSupply: true,
          mainGroup: null,
          decimals: 1000,
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalTransitionsCount: null,
          totalGasUsed: null,
          balance: null,
          perpetualDistribution: null,
          preProgrammedDistribution: [
            {
              out: [
                {
                  identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  tokenAmount: '1'
                }
              ],
              timestamp: '2025-07-15T09:24:40.493Z'
            },
            {
              out: [
                {
                  identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  tokenAmount: '10'
                }
              ],
              timestamp: '2025-07-15T09:18:30.493Z'
            }
          ],
          prices: null,
          price: null
        }))

      assert.deepEqual(body.resultSet, expectedTokens)
    })

    it('should allow to get list of tokens for identity with custom limit, page and order desc', async () => {
      const { body } = await client.get(`/identity/${identity.identifier}/tokens?limit=7&order=desc&page=2`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, 30)

      const expectedTokens = dataContracts
        .sort((a, b) => b.token.id - a.token.id)
        .slice(7, 14)
        .map(({ token, dataContract }) => ({
          identifier: token.identifier,
          position: 29,
          description: null,
          localizations: {
            en: {
              pluralForm: 'tests',
              shouldCapitalize: true,
              singularForm: 'test'
            }
          },
          baseSupply: '1000',
          maxSupply: '1010',
          totalSupply: '1000',
          owner: token.owner,
          mintable: false,
          burnable: false,
          freezable: false,
          unfreezable: false,
          destroyable: false,
          allowedEmergencyActions: false,
          dataContractIdentifier: dataContract.identifier,
          changeMaxSupply: true,
          mainGroup: null,
          decimals: 1000,
          timestamp: null,
          totalBurnTransitionsCount: null,
          totalFreezeTransitionsCount: null,
          totalTransitionsCount: null,
          totalGasUsed: null,
          balance: null,
          perpetualDistribution: null,
          preProgrammedDistribution: [
            {
              out: [
                {
                  identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  tokenAmount: '1'
                }
              ],
              timestamp: '2025-07-15T09:24:40.493Z'
            },
            {
              out: [
                {
                  identifier: 'AQV2G2Egvqk8jwDBAcpngjKYcwAkck8Cecs5AjYJxfvW',
                  tokenAmount: '10'
                }
              ],
              timestamp: '2025-07-15T09:18:30.493Z'
            }
          ],
          prices: null,
          price: null
        }))

      assert.deepEqual(body.resultSet, expectedTokens)
    })
  })

  describe('getTokensTrends()', () => {
    before(async () => {
      tokens = []

      await fixtures.cleanup(knex)

      block = await fixtures.block(knex)

      identity = await fixtures.identity(knex, { block_hash: block.hash, block_height: block.height })

      dataContract = await fixtures.dataContract(knex, {
        owner: identity.identifier
      })

      for (let i = 0; i < 30; i++) {
        let tokenTransition

        block = await fixtures.block(knex, {
          timestamp: new Date(new Date().getTime() - 3600000 * (31 - i)),
          height: i + 2
        })

        const stateTransition = await fixtures.transaction(knex, {
          block_hash: block.hash,
          block_height: block.height,
          data: 'AAABB/ElAIxLgoxYzc+KXVe7+xw3ml3m11Rozv7zfz4qlh8BAAAAAAEBAAABAXGZ8faEBMhuz2DZy5Ou8xj6DysI5Z/9F2ve9DFU/95rAAEKd2l0aGRyYXdhbBYHEgtkZXNjcmlwdGlvbhKAV2l0aGRyYXdhbCBkb2N1bWVudCB0byB0cmFjayB1bmRlcmx5aW5nIHdpdGhkcmF3YWwgdHJhbnNhY3Rpb25zLiBXaXRoZHJhd2FscyBzaG91bGQgYmUgY3JlYXRlZCB3aXRoIElkZW50aXR5V2l0aGRyYXdhbFRyYW5zaXRpb24SF2NyZWF0aW9uUmVzdHJpY3Rpb25Nb2RlAwQSBHR5cGUSBm9iamVjdBIHaW5kaWNlcxUEFgMSBG5hbWUSDmlkZW50aXR5U3RhdHVzEgpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgZzdGF0dXMSA2FzYxYBEgokY3JlYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSDmlkZW50aXR5UmVjZW50Egpwcm9wZXJ0aWVzFQMWARIIJG93bmVySWQSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MWARIGc3RhdHVzEgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSB3Bvb2xpbmcSCnByb3BlcnRpZXMVBBYBEgZzdGF0dXMSA2FzYxYBEgdwb29saW5nEgNhc2MWARIOY29yZUZlZVBlckJ5dGUSA2FzYxYBEgokdXBkYXRlZEF0EgNhc2MSBnVuaXF1ZRMAFgMSBG5hbWUSC3RyYW5zYWN0aW9uEgpwcm9wZXJ0aWVzFQIWARIGc3RhdHVzEgNhc2MWARIQdHJhbnNhY3Rpb25JbmRleBIDYXNjEgZ1bmlxdWUTABIKcHJvcGVydGllcxYHEhB0cmFuc2FjdGlvbkluZGV4FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEnlTZXF1ZW50aWFsIGluZGV4IG9mIGFzc2V0IHVubG9jayAod2l0aGRyYXdhbCkgdHJhbnNhY3Rpb24uIFBvcHVsYXRlZCB3aGVuIGEgd2l0aGRyYXdhbCBwb29sZWQgaW50byB3aXRoZHJhd2FsIHRyYW5zYWN0aW9uEgdtaW5pbXVtAwISCHBvc2l0aW9uAwASFXRyYW5zYWN0aW9uU2lnbkhlaWdodBYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhIvVGhlIENvcmUgaGVpZ2h0IG9uIHdoaWNoIHRyYW5zYWN0aW9uIHdhcyBzaWduZWQSB21pbmltdW0DAhIIcG9zaXRpb24DAhIGYW1vdW50FgQSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uEhpUaGUgYW1vdW50IHRvIGJlIHdpdGhkcmF3bhIHbWluaW11bQP7B9ASCHBvc2l0aW9uAwQSDmNvcmVGZWVQZXJCeXRlFgUSBHR5cGUSB2ludGVnZXISC2Rlc2NyaXB0aW9uElBUaGlzIGlzIHRoZSBmZWUgdGhhdCB5b3UgYXJlIHdpbGxpbmcgdG8gc3BlbmQgZm9yIHRoaXMgdHJhbnNhY3Rpb24gaW4gRHVmZnMvQnl0ZRIHbWluaW11bQMCEgdtYXhpbXVtA/0AAAAB/////hIIcG9zaXRpb24DBhIHcG9vbGluZxYEEgR0eXBlEgdpbnRlZ2VyEgtkZXNjcmlwdGlvbhJOVGhpcyBpbmRpY2F0ZWQgdGhlIGxldmVsIGF0IHdoaWNoIFBsYXRmb3JtIHNob3VsZCB0cnkgdG8gcG9vbCB0aGlzIHRyYW5zYWN0aW9uEgRlbnVtFQMDAAMCAwQSCHBvc2l0aW9uAwgSDG91dHB1dFNjcmlwdBYFEgR0eXBlEgVhcnJheRIJYnl0ZUFycmF5EwESCG1pbkl0ZW1zAy4SCG1heEl0ZW1zAzISCHBvc2l0aW9uAwoSBnN0YXR1cxYEEgR0eXBlEgdpbnRlZ2VyEgRlbnVtFQUDAAMCAwQDBgMIEgtkZXNjcmlwdGlvbhJDMCAtIFBlbmRpbmcsIDEgLSBTaWduZWQsIDIgLSBCcm9hZGNhc3RlZCwgMyAtIENvbXBsZXRlLCA0IC0gRXhwaXJlZBIIcG9zaXRpb24DDBIUYWRkaXRpb25hbFByb3BlcnRpZXMTABIIcmVxdWlyZWQVBxIKJGNyZWF0ZWRBdBIKJHVwZGF0ZWRBdBIGYW1vdW50Eg5jb3JlRmVlUGVyQnl0ZRIHcG9vbGluZxIMb3V0cHV0U2NyaXB0EgZzdGF0dXMAAAAAAAAAAQAAAAECZW4AAQV0b2tlbgZ0b2tlbnMBAAAAAQEBAQAAAQEBAQEBAAAAAAABAQEAAAAAAAEBAQAAAAAAAQEBAQAAAAEBAQAAAAEBAQAAAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAAAAQEBAAABBG5vdGUAABIAAkEgb0tBVP6C6SuQ546sZq7bRYDt4+gShWY4ajVH4eKUwbYWblZRoVKYmQbfdoqy5wUIlOeBPMM43jYQ/BdmvOeiEQ==',
          type: 0,
          gas_used: 1111,
          owner: identity.identifier
        })

        const token = await fixtures.token(knex, {
          position: 29,
          owner: identity.identifier,
          data_contract_id: dataContract.id,
          decimals: i,
          base_supply: (i + 1) * 1000,
          state_transition_hash: stateTransition?.hash
        })

        const tokenTransitions = []

        for (let t = 0; t < (i + 1) * 2; t++) {
          tokenTransition = await fixtures.tokeTransition(knex, {
            token_identifier: token.identifier,
            owner: identity.identifier,
            action: 8,
            state_transition_hash: stateTransition?.hash,
            token_contract_position: token.position,
            data_contract_id: dataContract.id
          })

          tokenTransitions.push(tokenTransition)
        }

        tokens.push({ token, stateTransition, tokenTransitions, block })
      }
    })

    it('Should allow to get default rating', async () => {
      const { body } = await client.get('/tokens/rating')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 10)
      assert.equal(body.pagination.total, tokens.length)
      assert.equal(body.resultSet.length, 10)

      const expected = tokens
        .map(({ token, tokenTransitions }) => ({
          localizations: {
            en: {
              pluralForm: 'tests',
              singularForm: 'test',
              shouldCapitalize: true
            }
          },
          tokenIdentifier: token.identifier,
          transitionCount: tokenTransitions.length
        }))
        .slice(0, 10)

      assert.deepEqual(body.resultSet, expected)
    })

    it('Should allow to get default rating with custom limit ', async () => {
      const { body } = await client.get('/tokens/rating?limit=15')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 1)
      assert.equal(body.pagination.limit, 15)
      assert.equal(body.pagination.total, tokens.length)
      assert.equal(body.resultSet.length, 15)

      const expected = tokens
        .map(({ token, tokenTransitions }) => ({
          localizations: {
            en: {
              pluralForm: 'tests',
              singularForm: 'test',
              shouldCapitalize: true
            }
          },
          tokenIdentifier: token.identifier,
          transitionCount: tokenTransitions.length
        }))
        .slice(0, 15)

      assert.deepEqual(body.resultSet, expected)
    })

    it('Should allow to get default rating with custom limit and page size', async () => {
      const { body } = await client.get('/tokens/rating?limit=7&page=3')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, tokens.length)
      assert.equal(body.resultSet.length, 7)

      const expected = tokens
        .map(({ token, tokenTransitions }) => ({
          localizations: {
            en: {
              pluralForm: 'tests',
              singularForm: 'test',
              shouldCapitalize: true
            }
          },
          tokenIdentifier: token.identifier,
          transitionCount: tokenTransitions.length
        }))
        .slice(14, 21)

      assert.deepEqual(body.resultSet, expected)
    })

    it('Should allow to get default rating in order desc with custom limit and page size', async () => {
      const { body } = await client.get('/tokens/rating?limit=7&page=3&order=desc')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 3)
      assert.equal(body.pagination.limit, 7)
      assert.equal(body.pagination.total, tokens.length)
      assert.equal(body.resultSet.length, 7)

      const expected = tokens
        .sort((a, b) => b.tokenTransitions.length - a.tokenTransitions.length)
        .map(({ token, tokenTransitions }) => ({
          localizations: {
            en: {
              pluralForm: 'tests',
              singularForm: 'test',
              shouldCapitalize: true
            }
          },
          tokenIdentifier: token.identifier,
          transitionCount: tokenTransitions.length
        }))
        .slice(14, 21)

      assert.deepEqual(body.resultSet, expected)
    })

    it('Should allow to get default rating in order desc with custom limit and page size and time', async () => {
      const start = new Date(new Date().getTime() - 3600000 * 20)
      const end = new Date()

      const { body } = await client.get(`/tokens/rating?limit=4&page=2&order=desc&timestamp_start=${start.toISOString()}&timestamp_end=${end.toISOString()}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 4)
      assert.equal(body.pagination.total, tokens.length)
      assert.equal(body.resultSet.length, 4)

      const expected = tokens
        .sort((a, b) => b.tokenTransitions.length - a.tokenTransitions.length)
        .filter(({ block }) => block.timestamp.getTime() > start.getTime() && block.timestamp.getTime() < end.getTime())
        .slice(4, 8)
        .map(({ token, tokenTransitions }) => ({
          localizations: {
            en: {
              pluralForm: 'tests',
              singularForm: 'test',
              shouldCapitalize: true
            }
          },
          tokenIdentifier: token.identifier,
          transitionCount: tokenTransitions.length
        }))

      assert.deepEqual(body.resultSet, expected)
    })

    it('Should allow to get rating without txs in order desc with custom limit', async () => {
      const start = new Date(new Date().getTime() + 3600000)
      const end = new Date(new Date().getTime() + 3600000 * 20)

      const { body } = await client.get(`/tokens/rating?limit=4&page=2&order=desc&timestamp_start=${start.toISOString()}&timestamp_end=${end.toISOString()}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')

      assert.equal(body.pagination.page, 2)
      assert.equal(body.pagination.limit, 4)
      assert.equal(body.pagination.total, tokens.length)

      const expected = tokens
        .sort((a, b) => b.token.id - a.token.id)
        .slice(4, 8)
        .map(({ token, tokenTransitions }) => ({
          localizations: {
            en: {
              pluralForm: 'tests',
              singularForm: 'test',
              shouldCapitalize: true
            }
          },
          tokenIdentifier: token.identifier,
          transitionCount: 0
        }))

      assert.deepEqual(body.resultSet, expected)
    })
  })
})
