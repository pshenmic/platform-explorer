const cachedRequest = require('./cachedRequest')
const { blocksUntilCorePayment } = require('../utils')
const YEAR_MS = 365 * 86400000
const DUFFS_PER_DASH = 100000000

module.exports = class ValidatorCore {
  constructor (rpc) {
    this.rpc = rpc
    this.cached = cachedRequest()
  }

  blockTime = height => {
    if (!Number.isInteger(height) || height <= 0) return Promise.resolve(null)
    return this.cached(`block:${height}`, async () => {
      const block = await this.rpc.getBlock(await this.rpc.getBlockHash(height))
      if (!Number.isFinite(block?.time)) throw new Error('Core block time unavailable')
      return new Date(block.time * 1000).toISOString()
    })
  }

  snapshot = () => this.cached('snapshot', async () => {
    const [nodes, height] = await Promise.allSettled([
      this.rpc.getProTxList('registered', true),
      this.rpc.getBlockCount()
    ])
    const list = nodes.status === 'fulfilled' && Array.isArray(nodes.value) ? nodes.value : null
    const result = {
      list,
      poseScoreMax: list ? Math.max(100, list.length) : null,
      coreYieldPerYear: null,
      coreTipTime: null,
      coreBlockIntervalMs: null
    }
    if (height.status !== 'fulfilled' || !Number.isInteger(height.value) || height.value < 1) return result
    const intervalCount = Math.min(576, height.value)
    let tipHash
    try {
      tipHash = await this.rpc.getBlockHash(height.value)
    } catch {
      return result
    }
    const [timing, payments] = await Promise.allSettled([
      Promise.all([height.value, height.value - intervalCount].map(async h => {
        const hash = h === height.value ? tipHash : await this.rpc.getBlockHash(h)
        return this.rpc.getBlock(hash)
      })),
      this.rpc.getMasternodePayments(tipHash)
    ])
    if (timing.status === 'fulfilled') {
      const [tip, first] = timing.value
      if (Number.isFinite(tip?.time)) result.coreTipTime = new Date(tip.time * 1000).toISOString()
      const mean = (tip?.time - first?.time) * 1000 / intervalCount
      if (Number.isFinite(mean) && mean > 0) result.coreBlockIntervalMs = Math.round(mean)
    }
    // Annualized gross Core payout at the observed block rate; not total APR.
    const enabled = list?.filter(node => node.state?.PoSeBanHeight === -1).length
    const payees = payments.status === 'fulfilled' ? payments.value?.[0]?.masternodes?.[0]?.payees : null
    // Core also reports the Platform pool OP_RETURN output as a masternode payment.
    const corePayees = payees?.filter(payee => typeof payee.script === 'string' && !payee.script.startsWith('6a'))
    const amount = corePayees?.length && corePayees.every(payee => Number.isSafeInteger(payee.amount) && payee.amount >= 0)
      ? corePayees.reduce((sum, payee) => sum + payee.amount, 0)
      : null
    if (Number.isSafeInteger(amount) && amount >= 0 && enabled > 0 && result.coreBlockIntervalMs) {
      result.coreYieldPerYear = amount / DUFFS_PER_DASH * YEAR_MS / result.coreBlockIntervalMs / enabled
    }
    return result
  })

  details = async (hash, registeredHeight) => {
    const [snapshot, registeredAt] = await Promise.all([
      this.snapshot().catch(() => null),
      this.blockTime(registeredHeight).catch(() => null)
    ])
    return {
      registeredAt,
      poseScoreMax: snapshot?.poseScoreMax ?? null,
      coreYieldPerYear: snapshot?.list?.some(node => node.proTxHash.toLowerCase() === hash.toLowerCase() && node.state?.PoSeBanHeight === -1) ? snapshot.coreYieldPerYear : null,
      coreTipTime: snapshot?.coreTipTime ?? null,
      coreBlockIntervalMs: snapshot?.coreBlockIntervalMs ?? null,
      blocksUntilCorePayment: blocksUntilCorePayment(hash, snapshot?.list)
    }
  }
}
