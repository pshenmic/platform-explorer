const { Identifier } = require('@dashevo/wasm-dpp')
const DAPIClient = require('@dashevo/dapi-client')

class DAPI {
  dapi
  dpp

  constructor (dpp) {
    this.dapi = this.getDapi()
    this.dpp = dpp
  }

  async getIdentityBalance (identifier) {
    const GRPCIdentity = await this.dapi.platform.getIdentity(Identifier.from(identifier))
    return this.dpp.identity.createFromBuffer(GRPCIdentity.getIdentity()).balance
  }

  getDapi () {
    return this.dapi ?? new DAPIClient({
      dapiAddresses: [
        {
          host: process.env.DAPI_HOST,
          port: process.env.DAPI_PORT,
          retries: process.env.DAPI_RETRIES,
          protocol: process.env.DAPI_PROTOCOL
        }
      ],
      retries: -1
    })
  }
}

module.exports = DAPI
