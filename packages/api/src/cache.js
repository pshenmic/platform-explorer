const cacheStorage = {}

const cache = {}

cache.set = (key, value, timeout) => {
  cacheStorage[key] = value

  if (timeout) {
    setTimeout(() => cache.delete(key), timeout)
  }
}

cache.delete = (key) => {
  cacheStorage[key] = undefined
}

cache.get = (key) => cacheStorage[key]

module.exports = cache
