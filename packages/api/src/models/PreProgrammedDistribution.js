module.exports = class PreProgrammedDistribution {
  timestamp
  out

  constructor (timestamp, out) {
    this.timestamp = timestamp ?? null
    this.out = out ?? null
  }

  static fromWASMObject ({ distributions }) {
    const preProgrammedDistributionTimestamps = distributions ? Object.keys(distributions) : undefined

    return preProgrammedDistributionTimestamps?.map((timestamp) => {
      const recipients = distributions[timestamp] ? Object.keys(distributions[timestamp]) : null

      const out = recipients?.map((recipient) => ({
        identifier: recipient,
        tokenAmount: String(distributions[timestamp][recipient])
      }))

      return new PreProgrammedDistribution(timestamp ? new Date(Number(timestamp)) : null, out)
    })
  }
}
