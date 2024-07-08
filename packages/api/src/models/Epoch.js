module.exports = class Epoch {
  index
  startTime
  endTime

  constructor (index, startTime, endTime) {
    this.index = index ?? null
    this.startTime = startTime ?? null
    this.endTime = endTime ?? null
  }
}
