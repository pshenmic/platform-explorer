const { test } = require('node:test')
const assert = require('node:assert/strict')
const cache = require('../../src/cache')

function deferred () {
  let resolvePromise
  let rejectPromise
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  return { promise, resolve: resolvePromise, reject: rejectPromise }
}

test('shared cache preserves get, set and delete, including falsy values', context => {
  const key = 'cache-unit-test'
  context.after(() => cache.delete(key))

  for (const value of [0, false, null, undefined, -1, { balance: '0' }]) {
    cache.set(key, value)
    assert.equal(cache.get(key), value)
    cache.delete(key)
    assert.equal(cache.get(key), undefined)
  }
})

test('shared cache entries without a lifetime do not expire or inherit request limits', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  const keys = Array.from({ length: 300 }, (_, index) => `cache-unit-${index}`)
  context.after(() => keys.forEach(key => cache.delete(key)))

  keys.forEach(key => cache.set(key, key))
  context.mock.timers.tick(600000)
  keys.forEach(key => assert.equal(cache.get(key), key))
})

test('replacing or deleting a value cancels its old expiration', context => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  const store = cache.create()

  store.set('key', 'old', 10)
  context.mock.timers.tick(5)
  store.set('key', 'new', 20)
  context.mock.timers.tick(5)
  assert.equal(store.get('key'), 'new')
  context.mock.timers.tick(15)
  assert.equal(store.get('key'), undefined)

  store.set('key', 'deleted', 10)
  store.delete('key')
  store.set('key', 'persistent')
  context.mock.timers.tick(10)
  assert.equal(store.get('key'), 'persistent')
})

test('instances and the shared cache keep identical keys isolated', async context => {
  const first = cache.create()
  const second = cache.create()
  const key = 'isolated-cache-unit-test'
  context.after(() => cache.delete(key))
  cache.set(key, 'shared')

  assert.equal(await first.getOrLoad(key, () => 'first'), 'first')
  assert.equal(await second.getOrLoad(key, () => 'second'), 'second')
  assert.equal(cache.get(key), 'shared')
})

test('concurrent callers share one pending request and reuse its result', async () => {
  const store = cache.create()
  const source = deferred()
  let calls = 0
  const load = () => {
    calls++
    return source.promise
  }

  const first = store.getOrLoad('key', load)
  const second = store.getOrLoad('key', load)
  assert.equal(first, second)
  source.resolve(42)
  assert.deepEqual(await Promise.all([first, second]), [42, 42])
  assert.equal(await store.getOrLoad('key', load), 42)
  assert.equal(calls, 1)
})

test('getOrLoad uses the same storage as get, set and delete', async () => {
  const store = cache.create()
  store.set('key', undefined)
  assert.equal(await store.getOrLoad('key', () => assert.fail('Already cached')), undefined)
  store.delete('key')

  const pending = store.getOrLoad('key', () => 0)
  assert.equal(store.get('key'), pending)
  assert.equal(await pending, 0)
  assert.equal(await store.getOrLoad('key', () => assert.fail('Already cached')), 0)
})

test('request lifetime begins at completion rather than at request start', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  const store = cache.create({ ttl: 10, timeout: 100 })
  const source = deferred()
  const pending = store.getOrLoad('key', () => source.promise)

  context.mock.timers.tick(20)
  assert.equal(store.getOrLoad('key', () => assert.fail('Still pending')), pending)
  source.resolve('first')
  await pending

  context.mock.timers.tick(9)
  assert.equal(await store.getOrLoad('key', () => assert.fail('Not expired')), 'first')
  context.mock.timers.tick(1)
  assert.equal(await store.getOrLoad('key', () => 'second'), 'second')
})

test('entry limit evicts the oldest entry and permits reloading it', async () => {
  const store = cache.create({ maxEntries: 1 })
  assert.equal(await store.getOrLoad('first', () => 1), 1)
  assert.equal(await store.getOrLoad('second', () => 2), 2)
  assert.equal(store.get('first'), undefined)
  assert.equal(await store.getOrLoad('first', () => 3), 3)
})

test('synchronous errors and rejected requests can be retried', async () => {
  const store = cache.create()
  await assert.rejects(store.getOrLoad('key', () => { throw new Error('sync failure') }), /sync failure/)
  await assert.rejects(store.getOrLoad('key', async () => { throw new Error('async failure') }), /async failure/)
  assert.equal(await store.getOrLoad('key', () => 42), 42)
})

test('timeout permits retry and late completion cannot overwrite the new result', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  const store = cache.create({ timeout: 10 })
  const source = deferred()
  const pending = store.getOrLoad('key', () => source.promise)
  const rejected = assert.rejects(pending, /Request timed out/)
  await Promise.resolve()

  context.mock.timers.tick(10)
  await rejected
  assert.equal(await store.getOrLoad('key', () => 'new'), 'new')
  source.resolve('old')
  await Promise.resolve()
  assert.equal(await store.getOrLoad('key', () => assert.fail('Already cached')), 'new')
})

test('an evicted request cannot delete or replace a newer entry with the same key', async () => {
  for (const outcome of ['resolve', 'reject']) {
    const store = cache.create({ maxEntries: 1 })
    const source = deferred()
    const pending = store.getOrLoad('key', () => source.promise)
    const completed = outcome === 'reject' ? assert.rejects(pending, /old failure/) : pending

    await store.getOrLoad('other', () => 'other')
    await store.getOrLoad('key', () => 'new')
    if (outcome === 'reject') source.reject(new Error('old failure'))
    else source.resolve('old')
    await completed

    assert.equal(await store.getOrLoad('key', () => assert.fail('Already cached')), 'new')
  }
})

test('invalid cache limits fail immediately', () => {
  for (const maxEntries of [0, -1, NaN, 1.5]) {
    assert.throws(() => cache.create({ maxEntries }), RangeError)
  }
  assert.throws(() => cache.create({ ttl: -1 }), RangeError)
  assert.throws(() => cache.create({ timeout: 0 }), RangeError)
})
