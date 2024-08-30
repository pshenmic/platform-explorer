module.exports = class EpochData {
  epoch
  tps
  totalCollectedFees
  bestValidator

  constructor (epoch, tps, totalCollectedFees, bestValidator) {
    this.epoch = epoch ?? null
    this.tps = tps ?? null
    this.totalCollectedFees = totalCollectedFees ?? null
    this.bestValidator = bestValidator ?? null
  }

  // eslint-disable-next-line camelcase
  static fromObject ({ epoch, tps, total_collected_fees, best_validator }) {
    // eslint-disable-next-line camelcase
    return new EpochData(epoch, Number(tps ?? 0), Number(total_collected_fees ?? 0), best_validator)
  }
}
