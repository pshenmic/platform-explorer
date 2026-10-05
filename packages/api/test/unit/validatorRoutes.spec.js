const { test } = require('node:test')
const assert = require('node:assert/strict')
const Fastify = require('fastify')
const Routes = require('../../src/routes')
const schemas = require('../../src/schemas')

test('epoch stats reuse date definitions without changing query validation', async context => {
  const app = Fastify()
  context.after(() => app.close())
  schemas.forEach(schema => app.addSchema(schema))

  const controller = new Proxy({}, { get: () => async request => request.query })
  Routes(new Proxy({ fastify: app }, {
    get: (target, name) => target[name] ?? controller
  }))

  app.get('/previous-schema', {
    schema: {
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          timestamp_start: { type: 'string', format: 'date-time' },
          timestamp_end: { type: 'string', format: 'date-time' }
        }
      }
    }
  }, async request => request.query)

  const cases = [
    ['', 200],
    ['timestamp_start=2026-01-01T00:00:00Z', 200],
    ['timestamp_end=2026-01-02T00:00:00Z', 200],
    ['timestamp_start=2026-01-01T00:00:00Z&timestamp_end=2026-01-02T00:00:00Z', 200],
    ['timestamp_start=not-a-date', 400],
    ['timestamp_end=2026-99-99T00:00:00Z', 400],
    ['timestamp_start=null', 400],
    ['timestamp_end=', 400],
    ['timestamp_start=2026-01-01T00:00:00Z&timestamp_start=2026-01-02T00:00:00Z', 400],
    ['limit=999&order=invalid&unknown=value', 200]
  ]

  for (const [query, status] of cases) {
    const previous = await app.inject(`/previous-schema?${query}`)
    const current = await app.inject(`/validator/${'a'.repeat(64)}/epochs/stats?${query}`)
    assert.equal(previous.statusCode, status, query)
    assert.equal(current.statusCode, previous.statusCode, query)
    if (status === 200) assert.deepEqual(current.json(), previous.json(), query)
  }

  const pagination = await app.inject('/validators?limit=101')
  assert.equal(pagination.statusCode, 400)
})
