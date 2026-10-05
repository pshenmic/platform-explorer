const {
  REQUEST_CACHE_TTL,
  REQUEST_CACHE_MAX_ENTRIES,
  REQUEST_CACHE_TIMEOUT
} = require('./constants')

function createCache ({ ttl = REQUEST_CACHE_TTL, maxEntries = REQUEST_CACHE_MAX_ENTRIES, timeout = REQUEST_CACHE_TIMEOUT } = {}) {
  if (maxEntries !== Infinity && (!Number.isInteger(maxEntries) || maxEntries < 1)) {
    throw new RangeError('Cache maxEntries must be a positive integer or Infinity')
  }

  if (!Number.isFinite(ttl) || ttl < 0 || !Number.isFinite(timeout) || timeout <= 0) {
    throw new RangeError('Cache ttl must be non-negative and timeout must be positive')
  }

  const entries = new Map()
  const cache = {}

  cache.delete = key => {
    clearTimeout(entries.get(key)?.timer)
    entries.delete(key)
  }

  cache.set = (key, value, lifetime) => {
    cache.delete(key)

    const entry = { value }
    entries.set(key, entry)

    if (lifetime) {
      entry.timer = setTimeout(() => {
        if (entries.get(key) === entry) cache.delete(key)
      }, lifetime)
      entry.timer.unref?.()
    }

    while (entries.size > maxEntries) cache.delete(entries.keys().next().value)
  }

  cache.get = key => entries.get(key)?.value

  cache.getOrLoad = (key, load) => {
    const cached = entries.get(key)
    if (cached) return Promise.resolve(cached.value)

    let timer
    const deadline = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Request timed out')), timeout)
    })

    const pending = Promise.race([Promise.resolve().then(load), deadline])
      .then(value => {
        if (cache.get(key) === pending) cache.set(key, pending, ttl)
        return value
      }, error => {
        if (cache.get(key) === pending) cache.delete(key)
        throw error
      })
      .finally(() => clearTimeout(timer))

    cache.set(key, pending)
    return pending
  }

  return cache
}

const cache = createCache({ maxEntries: Infinity })
cache.create = createCache

module.exports = cache
