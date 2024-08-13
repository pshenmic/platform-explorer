const DAPIClient = require('@dashevo/dapi-client')
const {Identifier, DashPlatformProtocol} = require('@dashevo/wasm-dpp')


class DAPI {
  DAPIClient
  dpp
  constructor(options) {
    this.DAPIClient = new DAPIClient(options)
    this.dpp = new DashPlatformProtocol();
  }

  async getIdentityBalance(identifier) {
    const identityId = Identifier.from(identifier);
    const GRPCIdentity = await this.DAPIClient.platform.getIdentity(identityId)
    const decoded = this.dpp.identity.createFromBuffer(GRPCIdentity.getIdentity())
    return decoded.balance
  }
}

module.exports = DAPI