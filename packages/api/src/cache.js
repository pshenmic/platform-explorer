const cacheStorage = {}
const timeouts = {}

const cache = {}

cache.set = (key, value, timeout) => {
  clearTimeout(timeouts[key])
  delete timeouts[key]

  cacheStorage[key] = value

  if (timeout) {
    // an expiry does not keep the process alive
    timeouts[key] = setTimeout(() => cache.delete(key), timeout).unref()
  }
}

cache.delete = (key) => {
  clearTimeout(timeouts[key])
  delete timeouts[key]
  delete cacheStorage[key]
}

cache.get = (key) => cacheStorage[key]

module.exports = cache
