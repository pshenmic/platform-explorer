const { Identifier } = require('@dashevo/wasm-dpp')
const DAPIClient = require('@dashevo/dapi-client')

class DAPI {
  dapi
  dpp

  constructor (options, dpp) {
    this.dapi = new DAPIClient(options)
    this.dpp = dpp
  }

  async getIdentityBalance (identifier) {
    const GRPCIdentity = await this.dapi.platform.getIdentity(Identifier.from(identifier))
    return this.dpp.identity.createFromBuffer(GRPCIdentity.getIdentity()).balance
  }
}

module.exports = DAPI
