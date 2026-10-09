const { test } = require('node:test')
const assert = require('node:assert/strict')
const Fastify = require('fastify')
const createKnex = require('knex')
const schemas = require('../../src/schemas')
const Routes = require('../../src/routes')
const ValidatorsController = require('../../src/controllers/ValidatorsController')
const ValidatorsDAO = require('../../src/dao/ValidatorsDAO')
const TenderdashRPC = require('../../src/tenderdashRpc')
const DashCoreRPC = require('../../src/dashcoreRpc')

test('validator sorting supports both parameter names without changing other routes', async context => {
  const app = Fastify()
  context.after(() => app.close())
  context.mock.method(TenderdashRPC, 'getValidators', async () => ({ validators: [] }))
  context.mock.method(DashCoreRPC, 'getProTxList', async () => [])

  const controller = new ValidatorsController(null, {
    node: { getEpochsInfo: async () => [{ number: 1, startTime: 1000 }] }
  })
  let selectedOrder
  controller.validatorsDAO.getValidators = async (...args) => {
    selectedOrder = args[15]
    return { resultSet: [], pagination: {} }
  }

  schemas.forEach(schema => app.addSchema(schema))
  const unusedController = new Proxy({}, { get: () => async () => ({}) })
  Routes(new Proxy({ fastify: app, validatorsController: controller }, {
    get: (target, name) => target[name] ?? unusedController
  }))

  const cases = [
    ['', 'id'],
    ['orderBy=latest_timestamp', 'latest_timestamp'],
    ['order_by=latest_timestamp', 'latest_timestamp'],
    ['orderBy=proposed_blocks_amount', 'proposed_blocks_amount'],
    ['order_by=proposed_blocks_amount', 'proposed_blocks_amount'],
    ['orderBy=id', 'id'],
    ['order_by=id', 'id'],
    ['orderBy=unknown', 'id'],
    ['order_by=unknown', 'id'],
    ['orderBy=id&order_by=latest_timestamp', 'id'],
    ['orderBy=latest_timestamp&order_by=id', 'latest_timestamp'],
    ['orderBy=unknown&order_by=latest_timestamp', 'id']
  ]

  for (const [query, expected] of cases) {
    const response = await app.inject(`/validators?${query}`)
    assert.equal(response.statusCode, 200, response.body)
    assert.equal(selectedOrder, expected, query)
  }

  const transactions = await app.inject('/transactions?orderBy=latest_timestamp')
  assert.equal(transactions.statusCode, 400)
  const invalidLimit = await app.inject('/validators?limit=101')
  assert.equal(invalidLimit.statusCode, 400)
  const invalidRegistration = await app.inject('/validators?isRegistered=invalid')
  assert.equal(invalidRegistration.statusCode, 400)
})

test('validator SQL always uses id as the final sorting criterion', async context => {
  const knex = createKnex({ client: 'pg' })
  context.after(() => knex.destroy())
  let query
  context.mock.method(knex.client, 'runner', builder => ({
    run: async () => {
      query = builder.toSQL()
      return []
    }
  }))
  const dao = new ValidatorsDAO(knex)

  for (const direction of ['asc', 'desc']) {
    for (const field of ['latest_timestamp', 'proposed_blocks_amount', 'id', 'unknown']) {
      await dao.getValidators(
        1, 10, direction, undefined, [], undefined, [], undefined,
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, field
      )

      const expected = field === 'latest_timestamp'
        ? `order by "latest_timestamp" ${direction} nulls last, "id" ${direction}`
        : field === 'proposed_blocks_amount'
          ? `order by "proposed_blocks_amount" ${direction}, "id" ${direction}`
          : `order by "id" ${direction}`

      assert.ok(query.sql.endsWith(`${expected} limit ?`), query.sql)
    }
  }
})
