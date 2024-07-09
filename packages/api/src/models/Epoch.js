const { EPOCH_CHANGE_TIME } = require('../constants')

module.exports = class Epoch {
  index
  startTime
  endTime

  constructor (index, startTime, endTime) {
    this.index = index ?? null
    this.startTime = startTime ?? null
    this.endTime = endTime ?? null
  }

  static fromObject ({ index, genesisTime, timestamp }) {
    const currentBlocktime = timestamp.getTime()
    const epochIndex = Math.floor((currentBlocktime - genesisTime.getTime()) / EPOCH_CHANGE_TIME)

    const startEpochTime =
      Math.floor(genesisTime.getTime() + EPOCH_CHANGE_TIME * Number(index ?? epochIndex))
    const endEpochTime = Math.floor(startEpochTime + EPOCH_CHANGE_TIME)

    return new Epoch(
      Number(index ?? epochIndex),
      new Date(startEpochTime),
      new Date(endEpochTime)
    )
  }
}
