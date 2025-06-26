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

    mock.method(DAPI.prototype, 'getTokenTotalSupply', async () => ({ totalSystemAmount: 1000 }))

    app = await server.start()
    client = supertest(app.server)

    knex = getKnex()

    await fixtures.cleanup(knex)

    block = await fixtures.block(knex)

    identity = await fixtures.identity(knex, { block_hash: block.hash })

    dataContract = await fixtures.dataContract(knex, {
      owner: identity.identifier
    })

    for (let i = 0; i < 30; i++) {
      const token = await fixtures.token(knex, {
        position: i,
        owner: identity.identifier,
        data_contract_id: dataContract.id,
        decimals: i,
        base_supply: (i + 1) * 1000
      })

      tokens.push(token)
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
        .map(token => ({
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
          dataContractIdentifier: dataContract.identifier
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
        .sort((a, b) => b.id - a.id)
        .slice(0, 10)
        .map(token => ({
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
          dataContractIdentifier: dataContract.identifier
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
        .sort((a, b) => b.id - a.id)
        .slice(0, 3)
        .map(token => ({
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
          dataContractIdentifier: dataContract.identifier
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
        .sort((a, b) => b.id - a.id)
        .slice(11, 22)
        .map(token => ({
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
          dataContractIdentifier: dataContract.identifier
        }))

      assert.deepEqual(expectedTokens, body.resultSet)
    })
  })
})
