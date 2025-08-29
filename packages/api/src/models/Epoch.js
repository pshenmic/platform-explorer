const { EPOCH_CHANGE_TIME } = require('../constants')

module.exports = class Epoch {
  number
  firstBlockHeight
  firstCoreBlockHeight
  startTime
  feeMultiplier
  endTime

  constructor (number, firstBlockHeight, firstCoreBlockHeight, startTime, feeMultiplier, endTime) {
    this.number = number ?? null
    this.firstBlockHeight = firstBlockHeight ?? null
    this.firstCoreBlockHeight = firstCoreBlockHeight ?? null
    this.startTime = startTime ?? null
    this.feeMultiplier = feeMultiplier ?? null
    this.endTime = endTime ?? null
  }

  static fromObject ({ number, firstBlockHeight, firstCoreBlockHeight, startTime, feeMultiplier, nextEpoch }) {
    let endTime

    if (nextEpoch) {
      endTime = Number(nextEpoch.startTime)
    } else if (startTime) {
      endTime = Number(startTime) + EPOCH_CHANGE_TIME
    }

    return new Epoch(number, String(firstBlockHeight), firstCoreBlockHeight, Number(startTime), String(feeMultiplier), endTime)
  }
}
