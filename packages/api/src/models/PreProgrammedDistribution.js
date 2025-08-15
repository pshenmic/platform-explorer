module.exports = class PreProgrammedDistribution {
  timestamp
  out

  constructor (timestamp, out) {
    this.timestamp = timestamp ?? null
    this.out = out ?? null
  }

  static fromWASMObject ({ timestamp, value }) {
    const recipients = value ? Object.keys(value) : null

    const out = recipients?.map((recipient) => ({ identifier: recipient, tokenAmount: String(value[recipient]) }))

    return new PreProgrammedDistribution(timestamp ? new Date(Number(timestamp)) : null, out)
  }
}
