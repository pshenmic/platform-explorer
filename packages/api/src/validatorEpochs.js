const cache = require('./cache')
const { VALIDATOR_EPOCH_MAX_POINTS, VALIDATOR_EPOCH_CACHE_MAX_ENTRIES } = require('./constants')

const caches = new WeakMap()

// Long ranges are grouped using real epoch boundaries, never an assumed duration.
module.exports = async (node, start, end) => {
  if (!caches.has(node)) caches.set(node, cache.create({ maxEntries: VALIDATOR_EPOCH_CACHE_MAX_ENTRIES }))

  const cached = caches.get(node)
  const read = (count, from) => cached.getOrLoad(`epochs:${from ?? 'latest'}:${count}`, async () => {
    const rows = await node.getEpochsInfo(count, from != null, from)
    return rows.map((row, i) => {
      const epoch = { number: Number(row.number), startTime: Number(row.startTime) }
      if (!Number.isInteger(epoch.number) || epoch.number < 0 || !Number.isFinite(epoch.startTime) ||
        (from != null && (epoch.number < from || epoch.number >= from + count)) ||
        (i > 0 && epoch.number <= Number(rows[i - 1].number))) throw new Error('Incomplete epoch metadata')
      return epoch
    })
  })

  const [current] = await read(1)
  if (!current) throw new Error('Epoch metadata unavailable')

  const until = Math.min(end.getTime(), Date.now())
  if (start.getTime() > until) return []

  const epochAt = async time => {
    if (time >= current.startTime) return current.number

    const [genesis] = await read(1, 0)
    if (!genesis) throw new Error('Epoch metadata unavailable')
    if (time <= genesis.startTime) return 0

    let low = 0
    let high = current.number
    while (low < high) {
      const mid = Math.ceil((low + high) / 2)
      const [epoch] = await read(1, mid)
      if (!epoch) throw new Error('Epoch metadata unavailable for the requested dates')
      if (epoch.startTime <= time) low = mid
      else high = mid - 1
    }
    return low
  }

  const [first, last] = await Promise.all([epochAt(start.getTime()), epochAt(until)])
  const span = last - first + 1
  const count = Math.min(VALIDATOR_EPOCH_MAX_POINTS, span)
  const boundaries = Array.from({ length: count + 1 }, (_, i) => first + Math.floor(i * span / count))
  const byNumber = new Map()
  // Batch nearby epochs; sparse boundaries keep even an All request bounded.
  const requests = span <= 1000
    ? Array.from({ length: Math.ceil((Math.min(last + 1, current.number) - first + 1) / 100) }, (_, i) =>
      [Math.min(100, current.number - first - i * 100 + 1, last + 2 - first - i * 100), first + i * 100])
    : boundaries.filter(n => n <= current.number).map(n => [1, n])
  for (let i = 0; i < requests.length; i += 8) {
    const batches = await Promise.all(requests.slice(i, i + 8).map(([size, from]) => read(size, from)))
    for (const rows of batches) for (const epoch of rows) byNumber.set(epoch.number, epoch)
  }
  // Some historic epoch entries are not returned by Platform. Missing internal
  // boundaries merge adjacent groups; they must never remove blocks from the sum.
  const available = boundaries.filter(n => byNumber.has(n) || n > current.number)
  if (available[0] !== first || available.at(-1) !== last + 1) throw new Error('Incomplete epoch metadata')
  return available.slice(0, -1).map((number, i) => {
    const epoch = byNumber.get(number)
    const nextNumber = available[i + 1]
    const next = byNumber.get(nextNumber)
    if (next && next.startTime <= epoch.startTime) throw new Error('Invalid epoch boundaries')
    return { ...epoch, endNumber: nextNumber - 1, endTime: next?.startTime ?? null }
  }).filter(epoch => epoch.startTime <= until)
}
