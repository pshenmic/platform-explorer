module.exports = class SeriesData {
  timestamp
  data

  constructor (timestamp, data) {
    this.timestamp = timestamp ?? null
    this.data = data ?? null
  }
}
