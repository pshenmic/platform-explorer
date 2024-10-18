const {Identifier} = require('dash').PlatformProtocol

class DAPI {
  dapi
  dpp

  constructor(dapi, dpp) {
    this.dapi = dapi
    this.dpp = dpp
  }

  async getIdentityBalance(identifier) {
    const {balance} = await this.dapi.platform.getIdentityBalance(Identifier.from(identifier))
    return balance
  }

  async getTotalCredits() {
    const {totalCreditsInPlatform} = await this.dapi.platform.getTotalCreditsInPlatform()
    return totalCreditsInPlatform
  }

  async getEpochsInfo(count, start, ascending) {
    const {epochsInfo} = await this.dapi.platform.getEpochsInfo(start, count, {ascending})
    return epochsInfo
  }
}

module.exports = DAPI
