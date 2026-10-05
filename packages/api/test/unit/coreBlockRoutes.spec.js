const { test } = require('node:test')
const assert = require('node:assert/strict')
const Fastify = require('fastify')
const Routes = require('../../src/routes')
const schemas = require('../../src/schemas')
const BlocksController = require('../../src/controllers/BlocksController')
const DashCoreRPC = require('../../src/dashcoreRpc')
const ServiceNotAvailableError = require('../../src/errors/ServiceNotAvailableError')
const { NETWORK, REQUEST_CACHE_TTL } = require('../../src/constants')

function setup (context) {
  const app = Fastify()
  const blocksController = new BlocksController(null, null)
  schemas.forEach(schema => app.addSchema(schema))
  const stub = new Proxy({}, { get: () => async () => ({}) })
  Routes(new Proxy({ fastify: app, blocksController }, {
    get: (target, name) => target[name] ?? stub
  }))
  app.setErrorHandler((error, request, reply) => {
    reply.code(error instanceof ServiceNotAvailableError ? 503 : error.statusCode ?? 500)
      .send({ error: error.message })
  })
  context.after(() => app.close())
  return { app, blocksController }
}

test('Core hash route resolves genesis, returns network and reuses successful lookups', async context => {
  const { app } = setup(context)
  const rpc = context.mock.method(DashCoreRPC, 'getBlockHash', async height => {
    assert.equal(height, 0)
    return 'A'.repeat(64)
  })
  const replies = await Promise.all([app.inject('/core/block/0'), app.inject('/core/block/0')])
  for (const reply of replies) {
    assert.equal(reply.statusCode, 200)
    assert.deepEqual(reply.json(), { height: 0, hash: 'a'.repeat(64), network: NETWORK })
    assert.equal(reply.headers['cache-control'], 'no-store')
  }
  assert.equal(rpc.mock.callCount(), 1)
})

test('Core hash route rejects invalid heights without calling RPC', async context => {
  const { app } = setup(context)
  const rpc = context.mock.method(DashCoreRPC, 'getBlockHash', async () => 'a'.repeat(64))
  for (const height of ['-1', '1.5', 'null', 'abc', '2147483648']) {
    assert.equal((await app.inject(`/core/block/${height}`)).statusCode, 400, height)
  }
  assert.equal(rpc.mock.callCount(), 0)
})

test('Core hash route retries unavailable and malformed results without caching failures', async context => {
  const { app } = setup(context)
  let calls = 0
  context.mock.method(DashCoreRPC, 'getBlockHash', async () => {
    calls++
    if (calls === 1) throw new Error('RPC unavailable')
    if (calls === 2) return null
    if (calls === 3) return 'not-a-block-hash'
    return 'b'.repeat(64)
  })
  for (let attempt = 0; attempt < 3; attempt++) {
    assert.equal((await app.inject('/core/block/42')).statusCode, 503)
  }
  assert.equal((await app.inject('/core/block/42')).json().hash, 'b'.repeat(64))
})

test('Core height mapping expires so reorganized block hashes can change', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  const controller = new BlocksController(null, null)
  let hash = 'a'.repeat(64)
  context.mock.method(DashCoreRPC, 'getBlockHash', async () => hash)
  const response = { header: () => response, send: value => { response.value = value } }
  await controller.getCoreBlockHash({ params: { height: 42 } }, response)
  assert.equal(response.value.hash, hash)
  hash = 'b'.repeat(64)
  context.mock.timers.tick(REQUEST_CACHE_TTL)
  await controller.getCoreBlockHash({ params: { height: 42 } }, response)
  assert.equal(response.value.hash, hash)
})
