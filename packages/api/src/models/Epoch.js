const { EPOCH_CHANGE_TIME } = require('../constants')

module.exports = class Epoch {
  number
  firstBlockHeight
  firstCoreBlockHeight
  startTime
  feeMultiplier
  endTime
  totalBlocksInEpoch
  totalProcessingFees
  totalDistributedStorageFees
  totalCreatedStorageFees
  coreBlockRewards

  constructor (number, firstBlockHeight, firstCoreBlockHeight, startTime, feeMultiplier, endTime, totalBlocksInEpoch, totalProcessingFees, totalDistributedStorageFees, totalCreatedStorageFees, coreBlockRewards) {
    this.number = number ?? null
    this.firstBlockHeight = firstBlockHeight ?? null
    this.firstCoreBlockHeight = firstCoreBlockHeight ?? null
    this.startTime = startTime ?? null
    this.feeMultiplier = feeMultiplier ?? null
    this.endTime = endTime ?? null
    this.totalBlocksInEpoch = totalBlocksInEpoch ?? null
    this.totalProcessingFees = totalProcessingFees ?? null
    this.totalDistributedStorageFees = totalDistributedStorageFees ?? null
    this.totalCreatedStorageFees = totalCreatedStorageFees ?? null
    this.coreBlockRewards = coreBlockRewards ?? null
  }

  static fromObject ({ number, firstBlockHeight, firstCoreBlockHeight, startTime, feeMultiplier, nextEpoch, finalizedEpochInfo }) {
    let endTime

    if (nextEpoch) {
      endTime = Number(nextEpoch.startTime)
    } else if (startTime) {
      endTime = Number(startTime) + EPOCH_CHANGE_TIME
    }

    return new Epoch(
      number,
      String(firstBlockHeight),
      firstCoreBlockHeight,
      Number(startTime),
      String(feeMultiplier),
      endTime,
      finalizedEpochInfo ? Number(finalizedEpochInfo.totalBlocksInEpoch) : null,
      finalizedEpochInfo ? String(finalizedEpochInfo.totalProcessingFees) : null,
      finalizedEpochInfo ? String(finalizedEpochInfo.totalDistributedStorageFees) : null,
      finalizedEpochInfo ? String(finalizedEpochInfo.totalCreatedStorageFees) : null,
      finalizedEpochInfo ? String(finalizedEpochInfo.coreBlockRewards) : null
    )
  }
}
