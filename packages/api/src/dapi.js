const { Identifier } = require('@dashevo/wasm-dpp')

class DAPI {
  dapi
  dpp

  constructor (dapi, dpp) {
    this.dapi = dapi
    this.dpp = dpp
  }

  async getIdentityBalance (identifier) {
    const identity = await this.dapi.platform.getIdentity(Identifier.from(identifier))
    return this.dpp.identity.createFromBuffer(identity.getIdentity()).balance
  }
}

module.exports = DAPI
