module.exports = class ValidatorEarnings {
  core
  platform
  estimate

  constructor (core, platform, estimate) {
    this.core = core ?? null
    this.platform = platform ?? null
    this.estimate = estimate ?? null
  }

  /* eslint-disable camelcase */
  static fromRow ({ core_payments, core_amount, epochs, first_epoch, last_epoch, blocks_proposed, reward }) {
    return new ValidatorEarnings(
      {
        payments: Number(core_payments),
        amount: Number(core_amount ?? 0)
      },
      {
        epochs: Number(epochs),
        firstEpoch: first_epoch ?? null,
        lastEpoch: last_epoch ?? null,
        blocksProposed: Number(blocks_proposed),
        reward: Number(reward ?? 0)
      }
    )
  }

  static fromObject ({ core, platform, estimate }) {
    return new ValidatorEarnings(core, platform, estimate)
  }
}
