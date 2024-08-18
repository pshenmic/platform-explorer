const DAPIClient = require('@dashevo/dapi-client')
const {Identifier, DashPlatformProtocol} = require('@dashevo/wasm-dpp')

class DAPI {
    DAPIClient
    dpp

    constructor(options) {
        this.DAPIClient = new DAPIClient(options)
        this.dpp = new DashPlatformProtocol()
    }

    //======================//
    // W e   c a n   g e t: //
    //    metadata          //
    //    public keys       //
    //    balance           //
    //======================//
    async getIdentityBalance(identifier) {
        const identityId = Identifier.from(identifier)
        // Drops errors on idenitities like: 11111111111111111111111111111111 (bad)
        const GRPCIdentity = await this.DAPIClient.platform.getIdentity(identityId)
        return this.dpp.identity.createFromBuffer(GRPCIdentity.getIdentity()).balance
    }
}

module.exports = DAPI
