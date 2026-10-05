const cache = require('../cache')

const MONTH_MS = 30 * 86400000
const CREDITS_PER_DASH = 100000000000
const EPOCH_COUNT = 6

// Gross proposer shares, not owner balances or net profit. Use integer credits
// until the final conversion to an explicitly approximate monthly DASH amount.
module.exports = class ValidatorEarnings {
  constructor (node, core) {
    this.node = node
    this.core = core
    this.cache = cache.create({ maxEntries: 1 })
  }

  epochs = () => this.cache.getOrLoad('epochs', async () => {
    const [current] = await this.node.getEpochsInfo(1)
    if (!current || current.number < EPOCH_COUNT) throw new Error('Insufficient epoch history')
    const rows = await this.node.getFinalizedEpochsInfo(current.number - EPOCH_COUNT, true, current.number, false)
    if (rows.length !== EPOCH_COUNT) throw new Error('Incomplete finalized epoch history')
    const start = Number(rows[0].firstBlockTime)
    const end = Number(current.startTime)
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('Invalid epoch period')
    const credits = new Map()
    rows.forEach((row, i) => {
      if (row.epochIndex !== current.number - EPOCH_COUNT + i || row.totalBlocksInEpoch <= 0n ||
        (i > 0 && Number(row.firstBlockTime) <= Number(rows[i - 1].firstBlockTime)) ||
        Number(row.firstBlockTime) >= end ||
        row.blockProposers.reduce((sum, proposer) => sum + proposer.count, 0n) !== row.totalBlocksInEpoch) {
        throw new Error('Incomplete finalized epoch data')
      }
      const pool = row.totalProcessingFees + row.totalDistributedStorageFees + row.coreBlockRewards
      if (pool < 0n) throw new Error('Invalid epoch pool')
      for (const proposer of row.blockProposers) {
        if (proposer.count < 0n) throw new Error('Invalid proposer count')
        const hash = proposer.proposer.hex().toLowerCase()
        const share = pool * proposer.count / row.totalBlocksInEpoch
        credits.set(hash, (credits.get(hash) ?? 0n) + share)
      }
    })
    return { credits, start, end, firstEpoch: rows[0].epochIndex, lastEpoch: rows.at(-1).epochIndex }
  })

  get = async hash => {
    const [core, platform] = await Promise.allSettled([this.core.snapshot(), this.epochs()])
    const snapshot = core.status === 'fulfilled' ? core.value : null
    const registered = snapshot?.list?.find(node => node.proTxHash.toLowerCase() === hash.toLowerCase())
    const eligible = snapshot?.list ? Boolean(registered && registered.state?.PoSeBanHeight === -1) : null
    const corePerMonth = eligible === true && snapshot?.coreYieldPerYear != null
      ? snapshot.coreYieldPerYear * 30 / 365
      : null
    const history = platform.status === 'fulfilled' ? platform.value : null
    const credits = history?.credits.get(hash.toLowerCase()) ?? 0n
    // Keep history available, but do not forecast payments for a banned/removed
    // node or a newly registered node without a complete observation window.
    const enoughHistory = history && registered?.state?.registeredHeight != null &&
      await this.core.blockTime(registered.state.registeredHeight).then(time => Date.parse(time) <= history.start).catch(() => false)
    const platformPerMonth = eligible === true && enoughHistory
      ? Number(credits) / CREDITS_PER_DASH * MONTH_MS / (history.end - history.start)
      : null
    return {
      periodDays: 30,
      eligible,
      corePerMonth,
      platformPerMonth,
      totalPerMonth: corePerMonth != null && platformPerMonth != null ? corePerMonth + platformPerMonth : null,
      platformHistory: history
        ? {
            firstEpoch: history.firstEpoch,
            lastEpoch: history.lastEpoch,
            startTime: new Date(history.start).toISOString(),
            endTime: new Date(history.end).toISOString(),
            grossCredits: credits.toString()
          }
        : null
    }
  }
}
