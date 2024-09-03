const { Identifier } = require('@dashevo/wasm-dpp')
const {getDapi} = require("./utils");

class DAPI {
  dapi
  dpp

  constructor (dpp) {
    this.dapi = getDapi()
    this.dpp = dpp
  }

  async getIdentityBalance (identifier) {
    const GRPCIdentity = await this.dapi.platform.getIdentity(Identifier.from(identifier))
    return this.dpp.identity.createFromBuffer(GRPCIdentity.getIdentity()).balance
  }
}

module.exports = DAPI
