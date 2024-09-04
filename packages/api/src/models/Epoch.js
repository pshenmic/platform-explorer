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
      endTime = nextEpoch.startTime
    } else if (startTime) {
      endTime = startTime + EPOCH_CHANGE_TIME
    }

    return new Epoch(number, firstBlockHeight, firstCoreBlockHeight, startTime, feeMultiplier, endTime)
  }
}

// module.exports = class Epoch {
//   index
//   startTime
//   endTime
//
//   constructor (index, startTime, endTime) {
//     this.index = index ?? null
//     this.startTime = startTime ?? null
//     this.endTime = endTime ?? null
//   }
//
//   static fromObject ({ index, genesisTime, timestamp }) {
//     const currentBlocktime = timestamp.getTime()
//     const epochIndex = Math.floor((currentBlocktime - genesisTime.getTime()) / EPOCH_CHANGE_TIME)
//
//     const startEpochTime =
//       Math.floor(genesisTime.getTime() + EPOCH_CHANGE_TIME * Number(index ?? epochIndex))
//     const endEpochTime = Math.floor(startEpochTime + EPOCH_CHANGE_TIME)
//
//     return new Epoch(
//       Number(index ?? epochIndex),
//       new Date(startEpochTime),
//       new Date(endEpochTime)
//     )
//   }
// }
