// Bounded, expiring request cache. Concurrent callers share the same promise.
module.exports = ({ ttl = 60000, maxEntries = 256, timeout = 15000 } = {}) => {
  const entries = new Map()
  return (key, load) => {
    const cached = entries.get(key)
    if (cached && cached.expires > Date.now()) return cached.promise
    const entry = { expires: Infinity }
    let timer
    const deadline = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Request timed out')), timeout)
    })
    entry.promise = Promise.race([Promise.resolve().then(load), deadline]).finally(() => clearTimeout(timer)).then(value => {
      entry.expires = Date.now() + ttl
      return value
    }, error => {
      if (entries.get(key) === entry) entries.delete(key)
      throw error
    })
    entries.delete(key)
    entries.set(key, entry)
    while (entries.size > maxEntries) entries.delete(entries.keys().next().value)
    return entry.promise
  }
}
