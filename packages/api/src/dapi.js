const DAPIClient = require('@dashevo/dapi-client')
const {Identifier, DashPlatformProtocol} = require('@dashevo/wasm-dpp')

class DAPI {
    DAPIClient
    dpp

    constructor(options) {
        this.initDAPI(options)
        this.dpp = new DashPlatformProtocol()
    }

    initDAPI(options){
        this.DAPIClient = new DAPIClient(options)
    }

    //======================//
    // W e   c a n   g e t: //
    //    metadata          //
    //    public keys       //
    //    balance           //
    //======================//
    async getIdentityBalance(identifier) {
        const GRPCIdentity = await this.DAPIClient.platform.getIdentity(Identifier.from(identifier))
        return this.dpp.identity.createFromBuffer(GRPCIdentity.getIdentity()).balance
    }
}

module.exports = DAPI
